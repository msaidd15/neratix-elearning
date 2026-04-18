import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { db } from "./firebase";

const enrollmentsCollection = collection(db, "live_session_enrollments");

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function getEnrollmentsByStudentEmail(studentEmail) {
  const email = normalizeEmail(studentEmail);
  if (!email) return [];
  const snapshot = await getDocs(enrollmentsCollection);
  return snapshot.docs
    .map((enrollmentDoc) => ({ id: enrollmentDoc.id, ...enrollmentDoc.data() }))
    .filter((item) => normalizeEmail(item.studentEmail) === email);
}

export async function getEnrollmentsBySessionId(sessionId) {
  if (!sessionId) return [];
  const enrollmentQuery = query(enrollmentsCollection, where("sessionId", "==", sessionId));
  const snapshot = await getDocs(enrollmentQuery);
  return snapshot.docs.map((enrollmentDoc) => ({ id: enrollmentDoc.id, ...enrollmentDoc.data() }));
}

export async function getEnrollmentsBySessionIds(sessionIds) {
  const ids = Array.isArray(sessionIds) ? [...new Set(sessionIds)] : [];
  if (ids.length === 0) return [];

  const chunks = chunkArray(ids, 10);
  const snapshots = await Promise.all(
    chunks.map((chunkIds) =>
      getDocs(query(enrollmentsCollection, where("sessionId", "in", chunkIds)))
    )
  );

  return snapshots.flatMap((snapshot) =>
    snapshot.docs.map((enrollmentDoc) => ({ id: enrollmentDoc.id, ...enrollmentDoc.data() }))
  );
}

export async function getAllEnrollments() {
  const snapshot = await getDocs(enrollmentsCollection);
  return snapshot.docs.map((enrollmentDoc) => ({ id: enrollmentDoc.id, ...enrollmentDoc.data() }));
}

export async function assignStudentsToSession({ sessionId, courseId, studentEmails = [] }) {
  const emails = [
    ...new Set(
      (Array.isArray(studentEmails) ? studentEmails : [])
        .map((email) => normalizeEmail(email))
        .filter(Boolean)
    )
  ];
  const existingEnrollments = await getEnrollmentsBySessionId(sessionId);
  const existingEmails = new Set(existingEnrollments.map((enrollment) => normalizeEmail(enrollment.studentEmail)));

  const emailsToAdd = emails.filter((email) => !existingEmails.has(email));
  const tasks = emailsToAdd
    .map((email) =>
      addDoc(enrollmentsCollection, {
        studentEmail: email,
        sessionId,
        courseId,
        attendanceStatus: "assigned",
        enrolledAt: new Date().toISOString()
      })
    );

  await Promise.all(tasks);

  return {
    requestedCount: emails.length,
    addedCount: emailsToAdd.length,
    skippedCount: emails.length - emailsToAdd.length
  };
}

export async function removeEnrollment(enrollmentId) {
  return deleteDoc(doc(db, "live_session_enrollments", enrollmentId));
}

export async function removeEnrollmentBySessionAndEmail(sessionId, studentEmail) {
  if (!sessionId || !studentEmail) return 0;
  const targetEmail = normalizeEmail(studentEmail);
  const snapshot = await getDocs(query(enrollmentsCollection, where("sessionId", "==", sessionId)));
  const matches = snapshot.docs.filter(
    (item) => normalizeEmail(item.data()?.studentEmail) === targetEmail
  );
  await Promise.all(matches.map((item) => deleteDoc(doc(db, "live_session_enrollments", item.id))));
  return matches.length;
}

export async function getTotalEnrollmentsCount() {
  const snapshot = await getDocs(enrollmentsCollection);
  return snapshot.size;
}
