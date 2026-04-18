import { addDoc, collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase";
import { normalizeProgressState } from "./progressHelpers";

function pickBestProgress(candidates) {
  return [...candidates].sort((a, b) => {
    if (b.completedLessons.length !== a.completedLessons.length) {
      return b.completedLessons.length - a.completedLessons.length;
    }
    if (b.progress !== a.progress) {
      return b.progress - a.progress;
    }
    if (b.currentLesson !== a.currentLesson) {
      return b.currentLesson - a.currentLesson;
    }
    return String(a.id || "").localeCompare(String(b.id || ""));
  })[0];
}

async function createProgressDoc(email, courseId, lessons) {
  const normalized = normalizeProgressState({ email, courseId, completedLessons: [] }, lessons);
  const payload = {
    email,
    courseId,
    completedLessons: normalized.completedLessons,
    currentLesson: normalized.currentLesson,
    progress: normalized.progress
  };

  const docRef = await addDoc(collection(db, "user_progress"), payload);
  return { id: docRef.id, ...payload };
}

export async function loadProgress(email, courseId, lessons) {
  const q = query(
    collection(db, "user_progress"),
    where("email", "==", email),
    where("courseId", "==", courseId)
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    return createProgressDoc(email, courseId, lessons);
  }

  const candidates = snap.docs.map((progressDoc) => {
    const normalized = normalizeProgressState(
      {
        id: progressDoc.id,
        email: progressDoc.data().email || email,
        courseId: progressDoc.data().courseId || courseId,
        completedLessons: progressDoc.data().completedLessons
      },
      lessons
    );
    return normalized;
  });

  return pickBestProgress(candidates);
}

export async function saveProgressByCompletedLessons(email, courseId, lessons, nextCompletedLessons) {
  const nextState = normalizeProgressState(
    { email, courseId, completedLessons: nextCompletedLessons },
    lessons
  );

  const q = query(
    collection(db, "user_progress"),
    where("email", "==", email),
    where("courseId", "==", courseId)
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    const created = await createProgressDoc(email, courseId, lessons);
    await updateDoc(doc(db, "user_progress", created.id), {
      completedLessons: nextState.completedLessons,
      currentLesson: nextState.currentLesson,
      progress: nextState.progress
    });
    return { ...nextState, id: created.id };
  }

  await Promise.all(
    snap.docs.map((item) =>
      updateDoc(doc(db, "user_progress", item.id), {
        completedLessons: nextState.completedLessons,
        currentLesson: nextState.currentLesson,
        progress: nextState.progress
      })
    )
  );

  return { ...nextState, id: snap.docs[0].id };
}

