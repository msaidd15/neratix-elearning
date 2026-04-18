import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

const LIVE_PACKAGE_TO_COURSE_ID = {
  "Neratix RoboExplorer Plus": "roboexplorer_plus",
  "Neratix RoboBuilder Plus": "robobuilder_plus",
  "Neratix RoboEngineer Plus": "roboengineer_plus"
};

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function splitIntoChunks(items, chunkSize) {
  const chunks = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

function toComparableDateTime(session) {
  const dateText = typeof session?.date === "string" ? session.date.trim() : "";
  if (!dateText) return 0;

  const rawTime = typeof session?.time === "string" ? session.time.trim() : "";
  const timeMatch = rawTime.match(/^(\d{1,2}):(\d{2})/);
  const hh = timeMatch ? timeMatch[1].padStart(2, "0") : "00";
  const mm = timeMatch ? timeMatch[2] : "00";

  const timestamp = Date.parse(`${dateText}T${hh}:${mm}:00`);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function getLiveCourseIds(packages) {
  const packageList = Array.isArray(packages) ? packages : [];
  const ids = packageList
    .map((pkg) => {
      if (LIVE_PACKAGE_TO_COURSE_ID[pkg]) return LIVE_PACKAGE_TO_COURSE_ID[pkg];

      const normalized = normalizeText(pkg);
      if (!normalized.includes("plus")) return null;

      if (normalized.includes("roboengineer") || normalized.includes("engineer")) return "roboengineer_plus";
      if (normalized.includes("robobuilder") || normalized.includes("builder")) return "robobuilder_plus";
      if (normalized.includes("roboexplorer") || normalized.includes("explorer")) return "roboexplorer_plus";
      return null;
    })
    .filter(Boolean);

  return [...new Set(ids)];
}

export function hasPlusPackage(packages) {
  const packageList = Array.isArray(packages) ? packages : [];
  return packageList.some((pkg) => typeof pkg === "string" && pkg.toLowerCase().includes("plus"));
}

export async function getLiveSessionsByCourseIds(courseIds) {
  const ids = Array.isArray(courseIds) ? [...new Set(courseIds)] : [];
  if (ids.length === 0) return [];

  const liveSessionsRef = collection(db, "live_sessions");
  const chunks = splitIntoChunks(ids, 10);
  const snapshotList = await Promise.all(
    chunks.map((chunkIds) => {
      const liveQuery = query(liveSessionsRef, where("courseId", "in", chunkIds));
      return getDocs(liveQuery);
    })
  );

  const sessions = snapshotList.flatMap((snapshot) =>
    snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
  );

  return sessions.sort((a, b) => {
    const batchSort = Number(b.batchNumber || 0) - Number(a.batchNumber || 0);
    if (batchSort !== 0) return batchSort;

    const sessionA = Number(a.sessionNumber || 0);
    const sessionB = Number(b.sessionNumber || 0);
    const sessionSort = sessionB - sessionA;
    if (sessionSort !== 0) return sessionSort;

    const dateSort = toComparableDateTime(b) - toComparableDateTime(a);
    if (dateSort !== 0) return dateSort;

    const titleA = typeof a?.title === "string" ? a.title.toLowerCase() : "";
    const titleB = typeof b?.title === "string" ? b.title.toLowerCase() : "";
    return titleA.localeCompare(titleB);
  });
}
