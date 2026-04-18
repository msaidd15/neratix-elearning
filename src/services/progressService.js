import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from "./firebase";

const progressCollection = collection(db, "user_progress");

const PACKAGE_TO_PROGRESS_COURSE = {
  "Neratix RoboExplorer": "roboexplorer",
  "Neratix RoboExplorer Plus": "roboexplorer",
  "Neratix RoboBuilder": "robobuilder",
  "Neratix RoboBuilder Plus": "robobuilder",
  "Neratix RoboEngineer": "roboengineer",
  "Neratix RoboEngineer Plus": "roboengineer"
};

export function getProgressCourseIdsFromPackages(packages) {
  const packageList = Array.isArray(packages) ? packages : [];
  const courseIds = packageList
    .map((pkg) => PACKAGE_TO_PROGRESS_COURSE[pkg])
    .filter(Boolean);
  return [...new Set(courseIds)];
}

export async function createInitialProgressForStudent(email, packages) {
  const courseIds = getProgressCourseIdsFromPackages(packages);
  const existingProgress = await getProgressByStudentEmail(email);
  const existingCourseIds = new Set(existingProgress.map((item) => item.courseId));

  const createPromises = courseIds
    .filter((courseId) => !existingCourseIds.has(courseId))
    .map((courseId) =>
      addDoc(progressCollection, {
        email,
        courseId,
        completedLessons: [],
        currentLesson: 1,
        progress: 0
      })
    );

  await Promise.all(createPromises);
}

export async function getProgressByStudentEmail(email) {
  if (!email) return [];
  const progressQuery = query(progressCollection, where("email", "==", email));
  const snapshot = await getDocs(progressQuery);
  return snapshot.docs.map((progressDoc) => ({ id: progressDoc.id, ...progressDoc.data() }));
}

export async function getAllProgress(searchText = "") {
  const snapshot = await getDocs(progressCollection);
  const rows = snapshot.docs.map((progressDoc) => ({ id: progressDoc.id, ...progressDoc.data() }));

  const keyword = searchText.trim().toLowerCase();
  if (!keyword) return rows;

  return rows.filter((item) => {
    const email = typeof item.email === "string" ? item.email.toLowerCase() : "";
    const courseId = typeof item.courseId === "string" ? item.courseId.toLowerCase() : "";
    return email.includes(keyword) || courseId.includes(keyword);
  });
}

export async function resetProgress(progressId) {
  return updateDoc(doc(db, "user_progress", progressId), {
    completedLessons: [],
    currentLesson: 1,
    progress: 0
  });
}

export async function updateProgress(progressId, payload) {
  return updateDoc(doc(db, "user_progress", progressId), payload);
}

export async function deleteProgress(progressId) {
  return deleteDoc(doc(db, "user_progress", progressId));
}
