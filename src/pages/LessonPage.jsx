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
import { saveQuizResult } from "../services/quizResultsService";
import "../styles/lesson.css";

export default function LessonPage() {
  const navigate = useNavigate();
  const { courseKey, id } = useParams();
  const config = getCourseConfig(courseKey);
  const lessons = useMemo(() => (config ? getCourseLessons(courseKey) : []), [courseKey, config]);

  const [progressState, setProgressState] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [activeMenu, setActiveMenu] = useState("materi");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);

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
  const currentQuiz = currentLesson?.quiz || [];
  const quizScore = useMemo(() => {
    if (!quizSubmitted || currentQuiz.length === 0) return 0;

    return currentQuiz.reduce((total, quizItem) => {
      const selected = quizAnswers[quizItem.id];
      return selected === quizItem.answer ? total + 1 : total;
    }, 0);
  }, [currentQuiz, quizAnswers, quizSubmitted]);
  const answeredCount = useMemo(() => {
    if (!currentQuiz.length) return 0;
    return currentQuiz.filter((quizItem) => Boolean(quizAnswers[quizItem.id])).length;
  }, [currentQuiz, quizAnswers]);
  const quizPercent = useMemo(() => {
    if (!quizSubmitted || currentQuiz.length === 0) return 0;
    return Math.round((quizScore / currentQuiz.length) * 100);
  }, [currentQuiz.length, quizScore, quizSubmitted]);
  const safeVideoUrl = useMemo(() => {
    const rawVideoUrl = currentLesson?.videoUrl;
    if (!rawVideoUrl) return "";

    try {
      const embedUrl = new URL(rawVideoUrl);

      if (embedUrl.hostname.includes("youtube.com")) {
        embedUrl.hostname = "www.youtube-nocookie.com";
      }

      embedUrl.searchParams.set("rel", "0");
      embedUrl.searchParams.set("modestbranding", "1");
      embedUrl.searchParams.set("iv_load_policy", "3");
      embedUrl.searchParams.set("disablekb", "1");
      embedUrl.searchParams.set("fs", "1");
      embedUrl.searchParams.set("loop", "1");

      // Paksa loop ke video yang sama untuk meminimalkan rekomendasi video lain saat selesai.
      const pathParts = embedUrl.pathname.split("/");
      const videoId = pathParts[pathParts.length - 1] || "";
      if (videoId) {
        embedUrl.searchParams.set("playlist", videoId);
      }

      return embedUrl.toString();
    } catch {
      return rawVideoUrl;
    }
  }, [currentLesson?.videoUrl]);

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

  useEffect(() => {
    setActiveMenu("materi");
    setQuizAnswers({});
    setQuizSubmitted(false);
    setIsSavingQuiz(false);
  }, [currentLesson?.id]);

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

  function handleQuizAnswer(questionId, optionKey) {
    setQuizSubmitted(false);
    setQuizAnswers((previous) => ({
      ...previous,
      [questionId]: optionKey
    }));
  }

  async function handleSubmitQuiz() {
    if (currentQuiz.length === 0) return;
    if (!userEmail || !config?.id || !currentLesson) return;

    setIsSavingQuiz(true);
    const nextScore = currentQuiz.reduce((total, quizItem) => {
      const selected = quizAnswers[quizItem.id];
      return selected === quizItem.answer ? total + 1 : total;
    }, 0);

    try {
      await saveQuizResult({
        email: userEmail,
        courseId: config.id,
        lessonId: currentLesson.id,
        lessonTitle: currentLesson.title,
        score: nextScore,
        totalQuestions: currentQuiz.length,
        answers: quizAnswers
      });
    } catch (error) {
      console.error("Gagal menyimpan hasil quiz:", error);
      alert("Hasil quiz belum tersimpan. Silakan coba lagi.");
      setIsSavingQuiz(false);
      return;
    }

    setQuizSubmitted(true);
    setIsSavingQuiz(false);
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

        <section className="lesson-menu card">
          <button
            type="button"
            className={`lesson-menu-btn ${activeMenu === "materi" ? "active" : ""}`}
            onClick={() => setActiveMenu("materi")}
          >
            Materi
          </button>
          <button
            type="button"
            className={`lesson-menu-btn ${activeMenu === "quiz" ? "active" : ""}`}
            onClick={() => setActiveMenu("quiz")}
          >
            Quiz
          </button>
        </section>

        {activeMenu === "materi" ? (
          <>
            <section className="lesson-video card">
              <h3>Video Pembelajaran</h3>
              <div className="video-wrap">
                <iframe
                  src={safeVideoUrl}
                  title="Video Materi Robotik"
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
          </>
        ) : (
          <section className="lesson-quiz card">
            <div className="quiz-head">
              <h3>Quiz Materi</h3>
              <p>Pilih jawaban A sampai D pada setiap pertanyaan.</p>
            </div>

            <div className="quiz-list">
              {currentQuiz.map((quizItem, index) => {
                const selectedAnswer = quizAnswers[quizItem.id];

                return (
                  <article key={quizItem.id} className="quiz-item">
                    <h4>{index + 1}. {quizItem.question}</h4>
                    <div className="quiz-options">
                      {Object.entries(quizItem.options).map(([optionKey, optionValue]) => {
                        const inputId = `${quizItem.id}-${optionKey}`;
                        return (
                          <label key={inputId} htmlFor={inputId} className="quiz-option">
                            <input
                              id={inputId}
                              type="radio"
                              name={quizItem.id}
                              value={optionKey}
                              checked={selectedAnswer === optionKey}
                              onChange={() => handleQuizAnswer(quizItem.id, optionKey)}
                            />
                            <span>{optionKey}. {optionValue}</span>
                          </label>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="quiz-actions">
              <button
                className="lesson-btn lesson-btn-primary"
                type="button"
                onClick={handleSubmitQuiz}
                disabled={isSavingQuiz}
              >
                {isSavingQuiz ? "Menyimpan..." : "Kirim Jawaban"}
              </button>
              <p className="quiz-progress">Terjawab {answeredCount}/{currentQuiz.length} soal</p>
            </div>
          </section>
        )}
      </main>

      {quizSubmitted ? (
        <div
          className="lesson-quiz-popup-overlay"
          role="button"
          tabIndex={0}
          onClick={() => setQuizSubmitted(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              setQuizSubmitted(false);
            }
          }}
        >
          <div className="lesson-quiz-popup-card">
            <p className="lesson-quiz-popup-kicker">Hasil Quiz</p>
            <h3>Skor kamu {quizScore}/{currentQuiz.length}</h3>
            <p>{quizPercent}% jawaban benar</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
