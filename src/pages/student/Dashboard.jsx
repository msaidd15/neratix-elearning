import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/shared/Navbar";
import CourseCard from "../../components/student/CourseCard";
import ProgressCard from "../../components/student/ProgressCard";
import AssignedLiveSessionSection from "../../components/student/AssignedLiveSessionSection";
import PromoUpgradeCard from "../../components/PromoUpgradeCard";
import { DASHBOARD_COURSES } from "../../data/courseData";
import { watchAuthState } from "../../services/authService";
import { getProgressByStudentEmail } from "../../services/progressService";
import { getAssignedLiveSessionsForStudentByCourseIds } from "../../services/liveSessionsService";
import { getUserDataByEmail } from "../../services/usersService";
import { getLiveCourseIds, hasPlusPackage } from "../../services/liveSessions";
import "../../styles/dashboard.css";

const PLUS_TO_REGULAR_PACKAGE = {
  "Neratix RoboExplorer Plus": "Neratix RoboExplorer",
  "Neratix RoboBuilder Plus": "Neratix RoboBuilder",
  "Neratix RoboEngineer Plus": "Neratix RoboEngineer"
};

function normalizePackages(packages) {
  const list = Array.isArray(packages) ? packages : [];
  const normalized = [...list];
  list.forEach((pkg) => {
    const regular = PLUS_TO_REGULAR_PACKAGE[pkg];
    if (regular) normalized.push(regular);
  });
  return [...new Set(normalized)];
}

function canAccessCourse(course, packages) {
  const normalized = normalizePackages(packages);
  return course.package === "Semua Paket" || normalized.includes(course.package);
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [progressRows, setProgressRows] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState(null);

  useEffect(() => {
    const unsub = watchAuthState(async (authUser) => {
      if (!authUser?.email) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setIsLoading(true);
        setSessionError(null);
        const profile = await getUserDataByEmail(authUser.email);
        if (!profile) {
          navigate("/login", { replace: true });
          return;
        }

        console.log("[StudentDashboard] user:", profile.email, profile.role);
        const progress = await getProgressByStudentEmail(profile.email);
        setUserData(profile);
        setProgressRows(progress);

        if (hasPlusPackage(profile.packages || [])) {
          setIsLoadingSession(true);
          const plusCourseIds = getLiveCourseIds(profile.packages || []);
          const assignedSessions = await getAssignedLiveSessionsForStudentByCourseIds(profile.email, plusCourseIds);
          console.log("[StudentDashboard] assigned sessions:", assignedSessions);
          setSessions(assignedSessions);
        } else {
          setSessions([]);
        }
      } catch (error) {
        console.error("[StudentDashboard] gagal memuat dashboard:", error);
        setSessionError("Terjadi kesalahan saat memuat data live session.");
      } finally {
        setIsLoadingSession(false);
        setIsLoading(false);
      }
    });

    return () => unsub();
  }, [navigate]);

  const packages = Array.isArray(userData?.packages) ? userData.packages : [];
  const plusUser = hasPlusPackage(packages);

  const packageText = useMemo(
    () => (packages.length > 0 ? packages.join(", ") : "Belum ada paket aktif"),
    [packages]
  );

  if (isLoading) return <div className="app-shell" />;

  return (
    <div className="app-shell">
      <Navbar
        title="Neratix Academy"
        subtitle="Dashboard Student"
        rightContent={<span className="user-greeting">Halo, {userData?.name || "NeraBot"}</span>}
      />

      <main className="dashboard-content">
        <div className="summary-row">
          <section className="welcome-section section-card">
            <p className="section-label">Selamat Datang Kembali</p>
            <h2>Halo, {userData?.name || "NeraBot"}</h2>
            <p className="section-subtitle">Siap untuk sesi belajar robotik hari ini?</p>
          </section>
          <section className="package-section section-card">
            <p className="section-label">Paket Aktif</p>
            <div className="package-badge">{packageText}</div>
          </section>
        </div>

        <ProgressCard progressRows={progressRows} />

        {plusUser ? (
          <AssignedLiveSessionSection
            sessions={sessions}
            isLoading={isLoadingSession}
            error={sessionError}
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
            {DASHBOARD_COURSES.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                unlocked={canAccessCourse(course, packages)}
                onOpen={(selectedCourse) => {
                  const courseId = selectedCourse.route.split("/").pop();
                  navigate(`/course/${courseId}`);
                }}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
