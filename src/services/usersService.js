import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from "./firebase";

const usersCollection = collection(db, "users");
const progressCollection = collection(db, "user_progress");
const enrollmentsCollection = collection(db, "live_session_enrollments");

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

async function getDocsByNormalizedEmail(collectionRef, fieldName, targetEmail) {
  const normalizedTarget = normalizeEmail(targetEmail);
  if (!normalizedTarget) return [];

  const snapshot = await getDocs(collectionRef);
  return snapshot.docs.filter((item) => normalizeEmail(item.data()?.[fieldName]) === normalizedTarget);
}

async function deleteByDocIds(collectionName, docIds = []) {
  if (!Array.isArray(docIds) || docIds.length === 0) {
    return { deletedCount: 0, hasPermissionDenied: false };
  }

  const results = await Promise.allSettled(
    docIds.map((id) => deleteDoc(doc(db, collectionName, id)))
  );

  let hasPermissionDenied = false;
  for (const result of results) {
    if (result.status !== "rejected") continue;
    if (result.reason?.code === "permission-denied") {
      hasPermissionDenied = true;
      continue;
    }
    throw result.reason;
  }

  const deletedCount = results.filter((result) => result.status === "fulfilled").length;
  return { deletedCount, hasPermissionDenied };
}

export async function getUserDataByEmail(email) {
  if (!email) return null;
  const normalizedEmail = normalizeEmail(email);
  const candidateEmails = [...new Set([email, normalizedEmail].map((item) => String(item || "").trim()).filter(Boolean))];

  let userDoc = null;
  for (const candidateEmail of candidateEmails) {
    const userQuery = query(usersCollection, where("email", "==", candidateEmail), limit(1));
    const snapshot = await getDocs(userQuery);
    if (!snapshot.empty) {
      userDoc = snapshot.docs[0];
      break;
    }
  }

  if (!userDoc) return null;

  const data = userDoc.data();

  return {
    id: userDoc.id,
    name: typeof data.name === "string" ? data.name : "",
    email: typeof data.email === "string" ? data.email : email,
    role: typeof data.role === "string" ? data.role : "student",
    packages: Array.isArray(data.packages) ? data.packages : []
  };
}

export async function getUsersByRole(role = "student") {
  const usersQuery = query(usersCollection, where("role", "==", role));
  const snapshot = await getDocs(usersQuery);
  return snapshot.docs
    .map((userDoc) => ({ id: userDoc.id, ...userDoc.data() }))
    .sort((a, b) => {
      const nameA = typeof a.name === "string" ? a.name.toLowerCase() : "";
      const nameB = typeof b.name === "string" ? b.name.toLowerCase() : "";
      return nameA.localeCompare(nameB);
    });
}

export async function getStudents(searchText = "") {
  const students = await getUsersByRole("student");
  const keyword = searchText.trim().toLowerCase();
  if (!keyword) return students;

  return students.filter((student) => {
    const name = typeof student.name === "string" ? student.name.toLowerCase() : "";
    const email = typeof student.email === "string" ? student.email.toLowerCase() : "";
    return name.includes(keyword) || email.includes(keyword);
  });
}

export async function createStudentProfile({ name, email, packages = [] }) {
  return addDoc(usersCollection, {
    name: name || "",
    email: normalizeEmail(email),
    role: "student",
    packages: Array.isArray(packages) ? packages : []
  });
}

export async function updateStudentProfile(userId, payload) {
  const userRef = doc(db, "users", userId);
  const nextPayload = { ...(payload || {}) };
  if (typeof nextPayload.email === "string") {
    nextPayload.email = normalizeEmail(nextPayload.email);
  }
  return updateDoc(userRef, nextPayload);
}

export async function updateStudentPackages(userId, packages) {
  return updateStudentProfile(userId, {
    packages: Array.isArray(packages) ? packages : []
  });
}

export async function getUserById(userId) {
  if (!userId) return null;
  const userRef = doc(db, "users", userId);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function deleteStudentData(student) {
  const studentId = student?.id;
  const studentEmail = normalizeEmail(student?.email);
  if (!studentId) {
    throw new Error("Student ID tidak ditemukan.");
  }

  const [progressDocs, enrollmentDocs] = await Promise.all([
    getDocsByNormalizedEmail(progressCollection, "email", studentEmail),
    getDocsByNormalizedEmail(enrollmentsCollection, "studentEmail", studentEmail)
  ]);

  const progressResult = await deleteByDocIds("user_progress", progressDocs.map((item) => item.id));
  const enrollmentResult = await deleteByDocIds("live_session_enrollments", enrollmentDocs.map((item) => item.id));

  try {
    await deleteDoc(doc(db, "users", studentId));
    return {
      mode: "hard-delete",
      deletedProgressCount: progressResult.deletedCount,
      deletedEnrollmentCount: enrollmentResult.deletedCount
    };
  } catch (error) {
    if (error?.code !== "permission-denied") throw error;

    // Fallback when rules deny user delete: archive user so it disappears from student list.
    await updateDoc(doc(db, "users", studentId), {
      role: "archived_student",
      packages: [],
      archivedAt: new Date().toISOString()
    });
    return {
      mode: "soft-delete",
      deletedProgressCount: progressResult.deletedCount,
      deletedEnrollmentCount: enrollmentResult.deletedCount,
      hasPermissionDeniedCleanup: progressResult.hasPermissionDenied || enrollmentResult.hasPermissionDenied
    };
  }
}
