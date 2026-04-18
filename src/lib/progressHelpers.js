export function getLastLessonId(lessons) {
  return lessons[lessons.length - 1]?.id || 1;
}

export function sanitizeCompletedLessons(value, lessons = []) {
  const validIds = new Set((lessons || []).map((lesson) => lesson.id));
  const hasValidFilter = validIds.size > 0;

  if (!Array.isArray(value)) return [];

  return [...new Set(
    value
      .map(Number)
      .filter((n) => Number.isInteger(n) && n >= 1)
      .filter((n) => (hasValidFilter ? validIds.has(n) : true))
  )].sort((a, b) => a - b);
}

export function calculateProgress(completedLessons, totalLessons) {
  if (!totalLessons) return 0;
  return Math.round((completedLessons.length / totalLessons) * 100);
}

export function getCurrentLesson(completedLessons, lessons) {
  const next = lessons.find((lesson) => !completedLessons.includes(lesson.id));
  return next ? next.id : getLastLessonId(lessons);
}

export function isLessonUnlocked(lessonNumber, completedLessons) {
  if (lessonNumber === 1) return true;
  return completedLessons.includes(lessonNumber - 1);
}

export function getAllowedLessonId(requestedId, completedLessons, lessons, currentLesson) {
  const safeRequestedId = Number.isInteger(requestedId) ? requestedId : 1;
  const exists = lessons.some((lesson) => lesson.id === safeRequestedId);
  const fallback = Number.isInteger(currentLesson) ? currentLesson : getCurrentLesson(completedLessons, lessons);

  if (!exists) return fallback;
  if (completedLessons.includes(safeRequestedId)) return safeRequestedId;
  if (isLessonUnlocked(safeRequestedId, completedLessons)) return safeRequestedId;
  return fallback;
}

export function normalizeProgressState(progress, lessons) {
  const completedLessons = sanitizeCompletedLessons(progress?.completedLessons, lessons);
  const currentLesson = getCurrentLesson(completedLessons, lessons);

  return {
    ...progress,
    completedLessons,
    currentLesson,
    progress: calculateProgress(completedLessons, lessons.length)
  };
}

export function getLessonStatus(lessonId, progressState) {
  const completedLessons = progressState?.completedLessons || [];
  const currentLesson = progressState?.currentLesson || 1;

  if (completedLessons.includes(lessonId)) return "selesai";
  if (!isLessonUnlocked(lessonId, completedLessons)) return "terkunci";
  if (lessonId === currentLesson) return "aktif";
  return "belum";
}

