import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import { getCourseConfig, getCourseLessons } from "../data/courseData";
import { getLessonIconSvg, getUiIconSvg } from "../data/icons";
import { SvgIcon } from "../components/SvgIcon";
import { getLessonStatus } from "../lib/progressHelpers";
import { loadProgress } from "../lib/progressStore";
import "../styles/course.css";

const statusMap = {
  selesai: { label: "Selesai", className: "status-selesai", action: "Lihat" },
  aktif: { label: "Sedang Dipelajari", className: "status-aktif", action: "Lanjutkan" },
  belum: { label: "Belum Dimulai", className: "status-belum", action: "Mulai" },
  terkunci: { label: "Terkunci", className: "status-terkunci", action: "Terkunci" }
};

async function getUserProfileByEmail(email) {
  const q = query(collection(db, "users"), where("email", "==", email), limit(1));
  const snap = await getDocs(q);

  if (snap.empty) {
    return { name: "NeraBot" };
  }

  const data = snap.docs[0].data();
  return {
    name: typeof data.name === "string" && data.name.trim() ? data.name : "NeraBot"
  };
}

export default function CoursePage() {
  const navigate = useNavigate();
  const { courseKey } = useParams();
  const config = getCourseConfig(courseKey);
  const lessons = useMemo(() => (config ? getCourseLessons(courseKey) : []), [courseKey, config]);

  const [currentUserName, setCurrentUserName] = useState("");
  const [progressState, setProgressState] = useState(null);

  useEffect(() => {
    if (!config) return;

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const email = firebaseUser.email || "";
        const [profile, progress] = await Promise.all([
          getUserProfileByEmail(email),
          loadProgress(email, config.id, lessons)
        ]);

        setCurrentUserName(profile.name);
        setProgressState(progress);

        const scrollKey = `${config.id}:scrollY`;
        const savedY = Number(sessionStorage.getItem(scrollKey));
        if (Number.isFinite(savedY) && savedY >= 0) {
          requestAnimationFrame(() => window.scrollTo({ top: savedY, behavior: "auto" }));
          sessionStorage.removeItem(scrollKey);
        }
      } catch (error) {
        console.error(`Gagal memuat data user ${config.shortName}:`, error);
        alert("Terjadi kesalahan saat memuat data belajar.");
      }
    });

    return () => unsub();
  }, [config, lessons, navigate]);

  if (!config || !progressState) return null;

  const completedLessons = progressState.completedLessons || [];
  const displayLessons = lessons.map((lesson) => {
    const status = getLessonStatus(lesson.id, progressState);

    return {
      ...lesson,
      status,
      locked: status === "terkunci"
    };
  });

  const activeLesson =
    displayLessons.find((lesson) => lesson.id === progressState.currentLesson && !lesson.locked) ||
    displayLessons.find((lesson) => !lesson.locked && !completedLessons.includes(lesson.id)) ||
    displayLessons.find((lesson) => !lesson.locked) ||
    null;

  const finished = completedLessons.length;
  const progressValue = progressState.progress;
  const xpValue = finished * 30;

  function openLesson(lesson) {
    sessionStorage.setItem(`${config.id}:scrollY`, String(window.scrollY));
    navigate(`/paket/${config.id}/materi/${lesson.id}`);
  }

  return (
    <div className="rb-page">
      <header className="rb-topbar">
        <div className="rb-brand">
          <div className="rb-brand-icon">N</div>
          <div>
            <h1>Neratix Academy</h1>
            <p className="rb-breadcrumb">Dashboard &gt; {config.name}</p>
          </div>
        </div>
        <div className="rb-topbar-right">
          <p className="rb-user">Halo, {currentUserName || "NeraBot"}</p>
          <button className="rb-btn rb-btn-outline" type="button" onClick={() => navigate("/dashboard")}>Kembali ke Dashboard</button>
        </div>
      </header>

      <main className="rb-main">
        <section className="rb-hero card-soft">
          <div className="rb-hero-left">
            <p className="rb-kicker">Paket Aktif</p>
            <h2>{config.name}</h2>
            <p className="rb-subtitle">Yuk belajar merakit, memprogram, dan menghidupkan robot pertamamu!</p>
            <div className="rb-pill-group">
              <span className="rb-pill">Level: <strong>Beginner</strong></span>
              <span className="rb-pill">{lessons.length} Materi</span>
              <span className="rb-pill">Tema: Robotik Seru</span>
            </div>
            <div className="rb-progress-wrap">
              <div className="rb-progress-label">
                <span>Progress Belajar</span>
                <strong>{progressValue}%</strong>
              </div>
              <div className="rb-progress-bar">
                <div className="rb-progress-fill" style={{ width: `${progressValue}%` }} />
              </div>
            </div>
            <button className="rb-btn rb-btn-primary" type="button" onClick={() => activeLesson && openLesson(activeLesson)}>
              Lanjutkan Belajar
            </button>
          </div>

          <div className="rb-hero-right">
            <div className="rb-float float-1"><SvgIcon html={getUiIconSvg("robot")} /></div>
            <div className="rb-float float-2"><SvgIcon html={getUiIconSvg("rocket")} /></div>
            <div className="rb-float float-3"><SvgIcon html={getUiIconSvg("gear")} /></div>
            <div className="rb-float float-4"><SvgIcon html={getUiIconSvg("spark")} /></div>
          </div>
        </section>

        <section className="rb-content-grid">
          <section className="rb-materials card-soft">
            <div className="rb-section-head">
              <h3>Daftar Materi {config.shortName}</h3>
              <p>Pilih materi yang tersedia dan lanjutkan petualangan robotikmu.</p>
            </div>
            <div className="rb-material-list">
              {displayLessons.map((lesson) => {
                const statusMeta = statusMap[lesson.status] || statusMap.belum;

                return (
                  <article
                    key={lesson.id}
                    className={`material-card ${lesson.locked ? "locked" : "unlocked"}`}
                    onClick={() => !lesson.locked && openLesson(lesson)}
                  >
                    <div className="material-number">{String(lesson.id).padStart(2, "0")}</div>
                    <div className="material-main">
                      <h4 className="material-title">
                        <span className="lesson-icon"><SvgIcon html={getLessonIconSvg(lesson.icon)} /></span>
                        <span>{lesson.title}</span>
                      </h4>
                      <p>{lesson.description}</p>
                      <div className="material-meta">
                        <span className="meta-pill">{lesson.duration}</span>
                        <span className={`meta-pill ${statusMeta.className}`}>{statusMeta.label}</span>
                      </div>
                    </div>
                    <button
                      className="material-action"
                      type="button"
                      disabled={lesson.locked}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (!lesson.locked) openLesson(lesson);
                      }}
                    >
                      {statusMeta.action}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="rb-sidebar">
            <div className="rb-summary card-soft">
              <h3>Ringkasan Belajar</h3>
              <ul>
                <li><span>Progress</span><strong>{progressValue}%</strong></li>
                <li><span>Paket Aktif</span><strong>{config.name}</strong></li>
                <li><span>Materi Selesai</span><strong>{finished} Materi</strong></li>
                <li><span>Status</span><strong>Semangat Belajar</strong></li>
              </ul>
              <p className="rb-motivation">Hebat! Kamu sudah menyelesaikan {finished} materi.</p>
            </div>

            <div className="rb-reward card-soft">
              <h3>Reward Kamu</h3>
              <div className="rb-reward-grid">
                <div className="rb-reward-item">
                  <span className="rb-reward-icon"><SvgIcon html={getUiIconSvg("star")} /></span>
                  <strong>{xpValue} XP</strong>
                  <p>Total Poin</p>
                </div>
                <div className="rb-reward-item">
                  <span className="rb-reward-icon"><SvgIcon html={getUiIconSvg("badge")} /></span>
                  <strong>4 Badge</strong>
                  <p>Terkumpul</p>
                </div>
              </div>
              <p className="rb-target">
                Target berikutnya: selesaikan 1 materi lagi untuk membuka badge <strong>{config.badgeTarget}</strong>.
              </p>
            </div>
          </aside>
        </section>
      </main>

      <footer className="rb-footer card-soft">
        <p>"Belajar robotik itu seperti memberi nyawa pada ide-idemu!"</p>
      </footer>
    </div>
  );
}
