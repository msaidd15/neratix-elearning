import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { DASHBOARD_COURSES } from "../data/courseData";
import { getUiIconSvg } from "../data/icons";
import { SvgIcon } from "../components/SvgIcon";
import LiveSessionSection from "../components/LiveSessionSection";
import PromoUpgradeCard from "../components/PromoUpgradeCard";
import { auth } from "../services/firebase";
import { getUserDataByEmail } from "../services/users";
import {
  getLiveCourseIds,
  getLiveSessionsByCourseIds,
  hasPlusPackage
} from "../services/liveSessions";
import "../styles/dashboard.css";

const PLUS_TO_REGULAR_PACKAGE = {
  "Neratix RoboExplorer Plus": "Neratix RoboExplorer",
  "Neratix RoboBuilder Plus": "Neratix RoboBuilder",
  "Neratix RoboEngineer Plus": "Neratix RoboEngineer"
};

function normalizePackages(userPackages) {
  const packages = Array.isArray(userPackages) ? userPackages : [];
  const normalized = [...packages];

  packages.forEach((pkg) => {
    const regularPackage = PLUS_TO_REGULAR_PACKAGE[pkg];
    if (regularPackage) {
      normalized.push(regularPackage);
    }
  });

  return [...new Set(normalized)];
}

function canAccessCourse(course, userPackages) {
  const normalizedPackages = normalizePackages(userPackages);
  return (
    course.package === "Semua Paket" ||
    normalizedPackages.includes(course.package)
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userError, setUserError] = useState(null);
  const [liveSessions, setLiveSessions] = useState([]);
  const [isLoadingLiveSessions, setIsLoadingLiveSessions] = useState(false);
  const [liveSessionsError, setLiveSessionsError] = useState(null);

  useEffect(() => {
    let isActive = true;

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isActive) return;

      if (!firebaseUser) {
        navigate("/login", { replace: true });
        return;
      }

      console.log("[Dashboard] User login:", {
        uid: firebaseUser.uid,
        email: firebaseUser.email
      });

      try {
        setUserError(null);
        setLiveSessionsError(null);
        setIsLoadingUser(true);

        const data = await getUserDataByEmail(firebaseUser.email || "");

        if (!data) {
          alert("Data user tidak ditemukan di Firestore (collection: users). Hubungi admin.");
          await signOut(auth);
          navigate("/login", { replace: true });
          return;
        }

        if (!isActive) return;
        setUserData(data);

        const userPackages = Array.isArray(data.packages) ? data.packages : [];
        console.log("[Dashboard] Packages user:", userPackages);

        if (hasPlusPackage(userPackages)) {
          setIsLoadingLiveSessions(true);

          const courseIds = getLiveCourseIds(userPackages);
          console.log("[Dashboard] Hasil mapping courseId:", courseIds);

          const sessionList = await getLiveSessionsByCourseIds(courseIds);
          console.log("[Dashboard] Hasil live session Firestore:", sessionList);

          if (!isActive) return;
          setLiveSessions(sessionList);
          setLiveSessionsError(null);
        } else {
          console.log("[Dashboard] User tidak memiliki paket Plus.");
          if (!isActive) return;
          setLiveSessions([]);
          setLiveSessionsError(null);
        }
      } catch (error) {
        console.error("[Dashboard] Gagal mengambil data dashboard:", error);
        if (!isActive) return;
        setUserError("Terjadi kesalahan saat mengambil data user.");
        setLiveSessionsError("Terjadi kesalahan saat mengambil live session.");
      } finally {
        if (!isActive) return;
        setIsLoadingLiveSessions(false);
        setIsLoadingUser(false);
      }
    });

    return () => {
      isActive = false;
      unsub();
    };
  }, [navigate]);

  const displayName = userData?.name || "";
  const userPackages = Array.isArray(userData?.packages) ? userData.packages : [];
  const showLiveSessionSection = hasPlusPackage(userPackages);

  const activePackageText = useMemo(() => {
    return userPackages.length > 0
      ? userPackages.join(", ")
      : "Belum ada paket aktif";
  }, [userPackages]);

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Gagal logout:", error);
      alert("Gagal logout. Coba lagi.");
    }
  }

  if (isLoadingUser) {
    return <div className="app-shell" />;
  }

  if (userError) {
    return (
      <div className="app-shell">
        <div className="section-card live-session-state live-session-state-error">
          {userError}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">N</div>
          <div className="brand-text">
            <h1>Neratix Academy</h1>
            <p>Dashboard NeraBot</p>
          </div>
        </div>
        <div className="header-actions">
          <span className="user-greeting">Halo, {displayName}</span>
          <button className="btn btn-outline" type="button" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="summary-row">
          <section className="welcome-section section-card">
            <p className="section-label">Selamat Datang Kembali</p>
            <h2>Halo, {displayName}</h2>
            <p className="section-subtitle">Siap untuk sesi belajar robotik hari ini?</p>
          </section>

          <section className="package-section section-card">
            <p className="section-label">Paket Aktif</p>
            <div className="package-badge">{activePackageText}</div>
          </section>
        </div>

        {showLiveSessionSection ? (
          <LiveSessionSection
            sessions={liveSessions}
            isLoading={isLoadingLiveSessions}
            error={liveSessionsError}
          />
        ) : (
          <PromoUpgradeCard />
        )}

        <section className="courses-section">
          <div className="section-head">
            <h3>Kursus Kamu</h3>
            <p>Pilih kelas untuk melanjutkan belajar</p>
          </div>
          <div className="course-grid">
            {DASHBOARD_COURSES.map((course) => {
              const unlocked = canAccessCourse(course, userPackages);
              const statusText = unlocked ? "Terbuka" : "Terkunci";
              const iconHtml = unlocked ? getUiIconSvg("play") : getUiIconSvg("lock");

              return (
                <article
                  key={course.id}
                  className={`course-card ${unlocked ? "unlocked" : "locked"}`}
                  onClick={() => unlocked && navigate(course.route)}
                >
                  <img className="course-thumb" src={course.thumbnail} alt={course.title} />
                  <div className="course-body">
                    <h4 className="course-title">{course.title}</h4>
                    <div className="course-status">
                      <span className={`status-badge ${unlocked ? "status-unlocked" : "status-locked"}`}>
                        {statusText}
                      </span>
                      <button
                        className="course-action"
                        type="button"
                        disabled={!unlocked}
                        aria-label={`Kursus ${statusText}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (unlocked) navigate(course.route);
                        }}
                      >
                        <SvgIcon html={iconHtml} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
