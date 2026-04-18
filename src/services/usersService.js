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

export async function getUserDataByEmail(email) {
  if (!email) return null;
  const userQuery = query(usersCollection, where("email", "==", email), limit(1));
  const snapshot = await getDocs(userQuery);
  if (snapshot.empty) return null;

  const userDoc = snapshot.docs[0];
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
    email: email || "",
    role: "student",
    packages: Array.isArray(packages) ? packages : []
  });
}

export async function updateStudentProfile(userId, payload) {
  const userRef = doc(db, "users", userId);
  return updateDoc(userRef, payload);
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
  const studentEmail = typeof student?.email === "string" ? student.email : "";
  if (!studentId) {
    throw new Error("Student ID tidak ditemukan.");
  }

  const progressQuery = studentEmail
    ? query(progressCollection, where("email", "==", studentEmail))
    : null;
  const enrollmentsQuery = studentEmail
    ? query(enrollmentsCollection, where("studentEmail", "==", studentEmail))
    : null;

  const [progressSnapshot, enrollmentsSnapshot] = await Promise.all([
    progressQuery ? getDocs(progressQuery) : Promise.resolve({ docs: [] }),
    enrollmentsQuery ? getDocs(enrollmentsQuery) : Promise.resolve({ docs: [] })
  ]);

  try {
    const deleteTasks = [
      ...progressSnapshot.docs.map((item) => deleteDoc(doc(db, "user_progress", item.id))),
      ...enrollmentsSnapshot.docs.map((item) => deleteDoc(doc(db, "live_session_enrollments", item.id))),
      deleteDoc(doc(db, "users", studentId))
    ];
    await Promise.all(deleteTasks);
    return { mode: "hard-delete" };
  } catch (error) {
    if (error?.code !== "permission-denied") {
      throw error;
    }

    // Fallback when rules deny delete: mark as archived so it disappears from student list.
    await updateDoc(doc(db, "users", studentId), {
      role: "archived_student",
      packages: [],
      archivedAt: new Date().toISOString()
    });
    return { mode: "soft-delete" };
  }
}
