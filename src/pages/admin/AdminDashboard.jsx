import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { watchAuthState } from "../../services/authService";
import { getTotalEnrollmentsCount } from "../../services/enrollmentsService";
import { getAllLiveSessions } from "../../services/liveSessionsService";
import { getUserDataByEmail, getUsersByRole } from "../../services/usersService";

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState("Admin");
  const [summary, setSummary] = useState({
    students: 0,
    plusStudents: 0,
    liveSessions: 0,
    enrollments: 0
  });

  useEffect(() => {
    const unsub = watchAuthState(async (user) => {
      if (!user?.email) return;

      try {
        const [profile, students, sessions, enrollments] = await Promise.all([
          getUserDataByEmail(user.email),
          getUsersByRole("student"),
          getAllLiveSessions(),
          getTotalEnrollmentsCount()
        ]);

        setAdminName(profile?.name || "Admin");
        const plusStudents = students.filter((student) =>
          Array.isArray(student.packages) && student.packages.some((pkg) => String(pkg).includes("Plus"))
        ).length;

        setSummary({
          students: students.length,
          plusStudents,
          liveSessions: sessions.length,
          enrollments
        });
      } catch (error) {
        console.error("[AdminDashboard] Failed to load summary:", error);
      }
    });

    return () => unsub();
  }, []);

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Ringkasan operasional elearning robotik"
      adminName={adminName}
    >
      <div className="admin-summary-grid">
        <article className="admin-summary-card">
          <p>Total Siswa</p>
          <h3>{summary.students}</h3>
        </article>
        <article className="admin-summary-card">
          <p>Total Paket Plus</p>
          <h3>{summary.plusStudents}</h3>
        </article>
        <article className="admin-summary-card">
          <p>Total Live Session</p>
          <h3>{summary.liveSessions}</h3>
        </article>
        <article className="admin-summary-card">
          <p>Enrollment Aktif</p>
          <h3>{summary.enrollments}</h3>
        </article>
      </div>

      <div className="admin-quick-links">
        <Link to="/admin/students" className="admin-link-card">Kelola Siswa</Link>
        <Link to="/admin/packages" className="admin-link-card">Kelola Paket</Link>
        <Link to="/admin/progress" className="admin-link-card">Tracker Progress</Link>
        <Link to="/admin/live-sessions" className="admin-link-card">Kelola Live Session</Link>
        <Link to="/admin/enrollments" className="admin-link-card">Enrollment Manager</Link>
      </div>
    </AdminLayout>
  );
}
