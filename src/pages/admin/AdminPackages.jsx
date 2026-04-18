import { useEffect, useMemo, useState } from "react";
import PackageEditor from "../../components/admin/PackageEditor";
import AdminLayout from "./AdminLayout";
import { watchAuthState } from "../../services/authService";
import { assignStudentsToSession } from "../../services/enrollmentsService";
import { getLiveCourseIds, getLiveSessionsByCourseIds } from "../../services/liveSessions";
import { createInitialProgressForStudent } from "../../services/progressService";
import {
  getUserDataByEmail,
  getUsersByRole,
  updateStudentPackages
} from "../../services/usersService";

export default function AdminPackages() {
  const [adminName, setAdminName] = useState("Admin");
  const [students, setStudents] = useState([]);
  const [searchText, setSearchText] = useState("");

  async function loadStudents() {
    const data = await getUsersByRole("student");
    setStudents(data);
  }

  useEffect(() => {
    const unsub = watchAuthState(async (user) => {
      if (!user?.email) return;
      const profile = await getUserDataByEmail(user.email);
      setAdminName(profile?.name || "Admin");
      await loadStudents();
    });
    return () => unsub();
  }, []);

  async function assignStudentToLatestBatchSessions(studentEmail, packages) {
    if (!studentEmail) return;
    const plusCourseIds = getLiveCourseIds(packages);
    if (plusCourseIds.length === 0) return;

    const sessions = await getLiveSessionsByCourseIds(plusCourseIds);
    if (sessions.length === 0) return;
    const batchSessions = sessions.filter((session) => (session?.sessionType || "batch") === "batch");
    if (batchSessions.length === 0) return;

    const latestBatchByCourse = new Map();
    batchSessions.forEach((session) => {
      const courseId = typeof session?.courseId === "string" ? session.courseId : "";
      if (!courseId) return;
      const batchNumber = Number(session?.batchNumber || 0);
      const prev = latestBatchByCourse.get(courseId);
      if (prev === undefined || batchNumber > prev) {
        latestBatchByCourse.set(courseId, batchNumber);
      }
    });

    const latestBatchSessions = batchSessions.filter((session) => {
      const courseId = typeof session?.courseId === "string" ? session.courseId : "";
      if (!courseId || !latestBatchByCourse.has(courseId)) return false;
      return Number(session?.batchNumber || 0) === latestBatchByCourse.get(courseId);
    });

    await Promise.all(
      latestBatchSessions.map((session) =>
        assignStudentsToSession({
          sessionId: session.id,
          courseId: session.courseId,
          studentEmails: [studentEmail]
        })
      )
    );
  }

  async function handleSavePackages(student, packages) {
    try {
      await updateStudentPackages(student.id, packages);
      await createInitialProgressForStudent(student.email, packages);
      await assignStudentToLatestBatchSessions(student.email, packages);
      await loadStudents();
      console.log("[AdminPackages] packages updated:", student.email, packages);
    } catch (error) {
      console.error("[AdminPackages] gagal update paket:", error);
      if (error?.code === "permission-denied") {
        alert("Gagal update paket: izin Firestore masih ditolak (permission-denied).");
        return;
      }
      alert(error?.message ? `Gagal update paket: ${error.message}` : "Gagal update paket.");
    }
  }

  const filteredStudents = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return students;

    return students.filter((student) => {
      const name = typeof student?.name === "string" ? student.name.toLowerCase() : "";
      const email = typeof student?.email === "string" ? student.email.toLowerCase() : "";
      return name.includes(keyword) || email.includes(keyword);
    });
  }, [students, searchText]);

  return (
    <AdminLayout
      title="Kelola Paket Siswa"
      subtitle="Upgrade/downgrade paket tanpa merusak progress lama"
      adminName={adminName}
    >
      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="text"
          placeholder="Cari nama/email siswa..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        <span>{filteredStudents.length} siswa</span>
      </div>

      <div className="admin-list-grid">
        {filteredStudents.map((student) => (
          <PackageEditor key={student.id} student={student} onSave={handleSavePackages} />
        ))}
        {filteredStudents.length === 0 && <p>Tidak ada siswa yang cocok dengan pencarian.</p>}
      </div>
    </AdminLayout>
  );
}
