import { addDoc, arrayUnion, collection, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase";

const quizResultsCollection = collection(db, "user_quiz_results");
const progressCollection = collection(db, "user_progress");

function toTimestampMs(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value === "number") return value;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAttempt(row = {}) {
  const score = Number(row.score || 0);
  const totalQuestions = Number(row.totalQuestions || 0);
  const submittedAtMs = Number(row.submittedAtMs || toTimestampMs(row.submittedAt));

  return {
    id: row.id || "",
    email: typeof row.email === "string" ? row.email : "",
    courseId: typeof row.courseId === "string" ? row.courseId : "",
    lessonId: Number(row.lessonId || 0),
    lessonTitle: typeof row.lessonTitle === "string" ? row.lessonTitle : "",
    score,
    totalQuestions,
    submittedAtMs,
    answers: row.answers && typeof row.answers === "object" ? row.answers : {}
  };
}

function normalizeAttemptForStorage(payload = {}) {
  return {
    email: typeof payload.email === "string" ? payload.email.trim() : "",
    courseId: typeof payload.courseId === "string" ? payload.courseId.trim() : "",
    lessonId: Number(payload.lessonId || 0),
    lessonTitle: typeof payload.lessonTitle === "string" ? payload.lessonTitle : "",
    score: Number(payload.score || 0),
    totalQuestions: Number(payload.totalQuestions || 0),
    answers: payload.answers && typeof payload.answers === "object" ? payload.answers : {},
    submittedAtMs: Date.now()
  };
}

async function saveQuizResultToProgressFallback(record) {
  const progressQuery = query(
    progressCollection,
    where("email", "==", record.email),
    where("courseId", "==", record.courseId)
  );
  const progressSnapshot = await getDocs(progressQuery);
  if (progressSnapshot.empty) {
    throw new Error("Progress course siswa belum ditemukan.");
  }

  await Promise.all(
    progressSnapshot.docs.map((progressDoc) =>
      updateDoc(progressDoc.ref, {
        quizAttempts: arrayUnion({
          lessonId: record.lessonId,
          lessonTitle: record.lessonTitle,
          score: record.score,
          totalQuestions: record.totalQuestions,
          answers: record.answers,
          submittedAtMs: record.submittedAtMs
        })
      })
    )
  );
}

function collectAttemptsFromProgress(progressDocs = []) {
  const attempts = [];

  progressDocs.forEach((progressDoc) => {
    const row = progressDoc.data();
    const quizAttempts = Array.isArray(row.quizAttempts) ? row.quizAttempts : [];

    quizAttempts.forEach((attempt, index) => {
      attempts.push(
        formatAttempt({
          id: `${progressDoc.id}-fallback-${attempt.submittedAtMs || index}`,
          email: row.email,
          courseId: row.courseId,
          ...attempt
        })
      );
    });
  });

  return attempts;
}

function toSummaryRows(attempts = []) {
  const groupedMap = new Map();

  attempts.forEach((attempt) => {
    const key = `${attempt.email}::${attempt.courseId}`;
    const previous = groupedMap.get(key);

    if (!previous) {
      groupedMap.set(key, {
        id: key,
        email: attempt.email,
        courseId: attempt.courseId,
        attempts: 1,
        bestScore: attempt.score,
        latestScore: attempt.score,
        latestLessonId: attempt.lessonId,
        latestLessonTitle: attempt.lessonTitle,
        latestSubmittedAtMs: attempt.submittedAtMs,
        totalQuestions: attempt.totalQuestions
      });
      return;
    }

    previous.attempts += 1;
    previous.bestScore = Math.max(previous.bestScore, attempt.score);
    if (attempt.submittedAtMs >= previous.latestSubmittedAtMs) {
      previous.latestScore = attempt.score;
      previous.latestLessonId = attempt.lessonId;
      previous.latestLessonTitle = attempt.lessonTitle;
      previous.latestSubmittedAtMs = attempt.submittedAtMs;
      previous.totalQuestions = attempt.totalQuestions;
    }
  });

  return [...groupedMap.values()].sort((a, b) => b.latestSubmittedAtMs - a.latestSubmittedAtMs);
}

async function safeGetDocs(queryRef) {
  try {
    const snapshot = await getDocs(queryRef);
    return snapshot.docs;
  } catch (error) {
    console.error("[quizResultsService] getDocs gagal:", error);
    return [];
  }
}

export async function saveQuizResult(payload = {}) {
  const record = normalizeAttemptForStorage(payload);

  if (!record.email || !record.courseId || !record.lessonId || !record.totalQuestions) {
    throw new Error("Data hasil quiz tidak lengkap.");
  }

  if (!record.lessonTitle) {
    record.lessonTitle = `Materi ${record.lessonId}`;
  }

  try {
    await addDoc(quizResultsCollection, record);
  } catch (error) {
    await saveQuizResultToProgressFallback(record);
  }
}

export async function getAllQuizResultSummary(searchText = "") {
  const [quizResultDocs, progressDocs] = await Promise.all([
    safeGetDocs(quizResultsCollection),
    safeGetDocs(progressCollection)
  ]);

  const attemptsFromResults = quizResultDocs.map((resultDoc) =>
    formatAttempt({ id: resultDoc.id, ...resultDoc.data() })
  );
  const attemptsFromProgress = collectAttemptsFromProgress(progressDocs);
  const attempts = [...attemptsFromResults, ...attemptsFromProgress];
  const rows = toSummaryRows(attempts);
  const keyword = searchText.trim().toLowerCase();
  if (!keyword) return rows;

  return rows.filter((item) => {
    const email = item.email.toLowerCase();
    const courseId = item.courseId.toLowerCase();
    const lesson = item.latestLessonTitle.toLowerCase();
    return email.includes(keyword) || courseId.includes(keyword) || lesson.includes(keyword);
  });
}

export async function getQuizHistoryByStudent(email, courseId) {
  if (!email || !courseId) return [];

  // Hindari ketergantungan index gabungan email+courseId.
  const quizResultsQuery = query(quizResultsCollection, where("email", "==", email));
  const progressQuery = query(
    progressCollection,
    where("email", "==", email),
    where("courseId", "==", courseId)
  );

  const [quizResultDocs, progressDocs] = await Promise.all([
    safeGetDocs(quizResultsQuery),
    safeGetDocs(progressQuery)
  ]);

  const attemptsFromResults = quizResultDocs
    .map((resultDoc) => formatAttempt({ id: resultDoc.id, ...resultDoc.data() }))
    .filter((attempt) => attempt.courseId === courseId)
    .sort((a, b) => b.submittedAtMs - a.submittedAtMs);
  const attemptsFromProgress = collectAttemptsFromProgress(progressDocs);
  const attemptsById = new Map();

  [...attemptsFromResults, ...attemptsFromProgress].forEach((attempt) => {
    const dedupeKey = `${attempt.email}::${attempt.courseId}::${attempt.lessonId}::${attempt.score}::${attempt.submittedAtMs}`;
    if (!attemptsById.has(dedupeKey)) {
      attemptsById.set(dedupeKey, attempt);
    }
  });

  return [...attemptsById.values()].sort((a, b) => b.submittedAtMs - a.submittedAtMs);
}
