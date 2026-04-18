import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from "./firebase";
import { getEnrollmentsByStudentEmail } from "./enrollmentsService";

const liveSessionsCollection = collection(db, "live_sessions");

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function toTimestamp(session) {
  const dateText = typeof session?.date === "string" ? session.date.trim() : "";
  if (!dateText) return 0;

  const rawTime = typeof session?.time === "string" ? session.time.trim() : "";
  const match = rawTime.match(/^(\d{1,2}):(\d{2})/);
  const hh = match ? match[1].padStart(2, "0") : "00";
  const mm = match ? match[2] : "00";
  const parsed = Date.parse(`${dateText}T${hh}:${mm}:00`);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function sortLiveSessionsLatestFirst(sessions) {
  const list = Array.isArray(sessions) ? [...sessions] : [];
  return list.sort((a, b) => {
    const batchSort = Number(b.batchNumber || 0) - Number(a.batchNumber || 0);
    if (batchSort !== 0) return batchSort;

    const sessionSort = Number(b.sessionNumber || 0) - Number(a.sessionNumber || 0);
    if (sessionSort !== 0) return sessionSort;

    const timeSort = toTimestamp(b) - toTimestamp(a);
    if (timeSort !== 0) return timeSort;

    const titleA = typeof a?.title === "string" ? a.title.toLowerCase() : "";
    const titleB = typeof b?.title === "string" ? b.title.toLowerCase() : "";
    return titleA.localeCompare(titleB);
  });
}

export async function getAllLiveSessions() {
  const snapshot = await getDocs(liveSessionsCollection);
  return sortLiveSessionsLatestFirst(
    snapshot.docs.map((sessionDoc) => ({ id: sessionDoc.id, ...sessionDoc.data() }))
  );
}

export async function createLiveSession(payload) {
  return addDoc(liveSessionsCollection, payload);
}

export async function updateLiveSession(sessionId, payload) {
  return updateDoc(doc(db, "live_sessions", sessionId), payload);
}

export async function deleteLiveSession(sessionId) {
  return deleteDoc(doc(db, "live_sessions", sessionId));
}

export async function getLiveSessionById(sessionId) {
  const sessionRef = doc(db, "live_sessions", sessionId);
  const snapshot = await getDoc(sessionRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function getLiveSessionsByIds(sessionIds = []) {
  const ids = [...new Set((Array.isArray(sessionIds) ? sessionIds : []).filter(Boolean))];
  if (ids.length === 0) return [];

  const chunks = chunkArray(ids, 10);
  const snapshots = await Promise.all(
    chunks.map((chunkIds) =>
      getDocs(query(liveSessionsCollection, where("__name__", "in", chunkIds)))
    )
  );

  return sortLiveSessionsLatestFirst(
    snapshots.flatMap((snapshot) =>
      snapshot.docs.map((sessionDoc) => ({ id: sessionDoc.id, ...sessionDoc.data() }))
    )
  );
}

export async function getAssignedLiveSessionsForStudent(studentEmail) {
  const enrollments = await getEnrollmentsByStudentEmail(studentEmail);
  const sessionIds = enrollments.map((enrollment) => enrollment.sessionId).filter(Boolean);
  return getLiveSessionsByIds(sessionIds);
}

export async function getAssignedLiveSessionsForStudentByCourseIds(studentEmail, allowedCourseIds = []) {
  const allowedIds = [...new Set((Array.isArray(allowedCourseIds) ? allowedCourseIds : []).filter(Boolean))];
  if (allowedIds.length === 0) return [];

  const allowedSet = new Set(allowedIds);
  const enrollments = await getEnrollmentsByStudentEmail(studentEmail);

  const sessionIds = enrollments
    .filter((enrollment) => {
      const courseId = typeof enrollment?.courseId === "string" ? enrollment.courseId : "";
      // Keep rows without courseId to support legacy data; final filtering is applied after fetching sessions.
      return !courseId || allowedSet.has(courseId);
    })
    .map((enrollment) => enrollment.sessionId)
    .filter(Boolean);

  const sessions = await getLiveSessionsByIds(sessionIds);
  return sessions.filter((session) => allowedSet.has(session?.courseId));
}

export async function getTotalLiveSessionsCount() {
  const snapshot = await getDocs(liveSessionsCollection);
  return snapshot.size;
}
