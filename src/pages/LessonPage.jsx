import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../lib/firebase";
import { getCourseConfig, getCourseLessons } from "../data/courseData";
import {
  getAllowedLessonId,
  getCurrentLesson,
  sanitizeCompletedLessons
} from "../lib/progressHelpers";
import { loadProgress, saveProgressByCompletedLessons } from "../lib/progressStore";
import "../styles/lesson.css";

export default function LessonPage() {
  const navigate = useNavigate();
  const { courseKey, id } = useParams();
  const config = getCourseConfig(courseKey);
  const lessons = useMemo(() => (config ? getCourseLessons(courseKey) : []), [courseKey, config]);

  const [progressState, setProgressState] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const requestedId = Number(id);
  const completedLessons = progressState?.completedLessons || [];
  const derivedCurrentLesson = progressState?.currentLesson || getCurrentLesson(completedLessons, lessons);
  const allowedLessonId = getAllowedLessonId(
    Number.isNaN(requestedId) ? 1 : requestedId,
    completedLessons,
    lessons,
    derivedCurrentLesson
  );

  const currentLesson = lessons.find((item) => item.id === allowedLessonId) || lessons[0];
  const isCompleted = completedLessons.includes(currentLesson?.id);
  const nextIncompleteId = progressState?.currentLesson || null;
  const canContinueToNext = isCompleted && Number.isInteger(nextIncompleteId) && nextIncompleteId !== currentLesson?.id;

  useEffect(() => {
    if (!config) return;

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const email = firebaseUser.email || "";
        setUserEmail(email);
        const progress = await loadProgress(email, config.id, lessons);
        setProgressState(progress);
      } catch (error) {
        console.error("Gagal memuat data progress lesson:", error);
        alert("Terjadi kesalahan saat memuat data materi.");
      }
    });

    return () => unsub();
  }, [config, lessons, navigate]);

  useEffect(() => {
    if (!progressState || !currentLesson || Number.isNaN(requestedId)) return;
    if (allowedLessonId !== requestedId) {
      navigate(`/paket/${courseKey}/materi/${allowedLessonId}`, { replace: true });
    }
  }, [allowedLessonId, courseKey, currentLesson, navigate, progressState, requestedId]);

  if (!config || !currentLesson || !progressState) return null;

  async function handleMarkComplete(event) {
    event.preventDefault();
    if (isSaving || isCompleted || !currentLesson || !progressState || !userEmail) return;

    const scrollY = window.scrollY;
    setIsSaving(true);

    try {
      const nextCompleted = sanitizeCompletedLessons([...(progressState.completedLessons || []), currentLesson.id], lessons);
      const nextState = await saveProgressByCompletedLessons(userEmail, config.id, lessons, nextCompleted);
      setProgressState(nextState);
    } catch (error) {
      console.error("Gagal menyimpan progres materi:", error);
      alert("Gagal menyimpan progres. Coba lagi.");
    } finally {
      setIsSaving(false);
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY, behavior: "auto" });
      });
    }
  }

  function handleSecondaryAction() {
    if (canContinueToNext) {
      navigate(`/paket/${config.id}/materi/${nextIncompleteId}`);
      return;
    }

    navigate(`/paket/${config.id}`);
  }

  return (
    <div className="lesson-page">
      <header className="lesson-topbar">
        <div>
          <h1>Neratix Academy</h1>
          <p>{`Dashboard > ${config.name} > ${currentLesson.title}`}</p>
        </div>
        <div className="lesson-topbar-actions">
          <button
            className={`lesson-btn ${isCompleted ? "lesson-btn-success" : "lesson-btn-primary"}`}
            type="button"
            onClick={handleMarkComplete}
            disabled={isSaving || isCompleted}
          >
            {isCompleted ? "Sudah Selesai" : "Tandai Selesai"}
          </button>
          <button className="lesson-btn" type="button" onClick={handleSecondaryAction}>
            {canContinueToNext ? `Lanjut Materi ${nextIncompleteId}` : `Kembali ke ${config.shortName}`}
          </button>
        </div>
      </header>

      <main className="lesson-main">
        <section className="lesson-hero card">
          <div>
            <p className="lesson-kicker">Materi #{String(currentLesson.id).padStart(2, "0")}</p>
            <h2>{currentLesson.title}</h2>
            <p>{currentLesson.description}</p>
          </div>
          <div className="lesson-meta">
            <span>{currentLesson.duration}</span>
            <span>{isCompleted ? "Selesai" : "Sedang Dipelajari"}</span>
          </div>
        </section>

        <section className="lesson-video card">
          <h3>Video Pembelajaran</h3>
          <div className="video-wrap">
            <iframe
              src={currentLesson.videoUrl}
              title="Video Materi Robotik"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        <section className="lesson-article card">
          <h3>Penjelasan Materi</h3>
          <article id="lessonArticle">
            {currentLesson.article.map((paragraph, index) => (
              <p key={`${currentLesson.id}-${index}`}>{paragraph}</p>
            ))}
          </article>
          <div className="article-note">{currentLesson.note}</div>
        </section>
      </main>
    </div>
  );
}
