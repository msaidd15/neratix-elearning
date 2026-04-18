import { useEffect, useMemo, useState } from "react";
import EnrollmentManager from "../../components/admin/EnrollmentManager";
import { getLiveSessionCourseLabel } from "../../lib/liveSessionLabels";
import AdminLayout from "./AdminLayout";
import { watchAuthState } from "../../services/authService";
import {
  assignStudentsToSession,
  getAllEnrollments,
  getEnrollmentsBySessionId,
  removeEnrollment,
  removeEnrollmentBySessionAndEmail
} from "../../services/enrollmentsService";
import { getAllLiveSessions } from "../../services/liveSessionsService";
import { getUserDataByEmail, getUsersByRole } from "../../services/usersService";

export default function AdminEnrollments() {
  const [adminName, setAdminName] = useState("Admin");
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [popupState, setPopupState] = useState({ visible: false, title: "", message: "", type: "success" });
  const [pendingDeleteHistoryRow, setPendingDeleteHistoryRow] = useState(null);
  const [isDeletingHistory, setIsDeletingHistory] = useState(false);

  async function loadBaseData() {
    const [allSessions, allStudents, enrollments] = await Promise.all([
      getAllLiveSessions(),
      getUsersByRole("student"),
      getAllEnrollments()
    ]);
    setSessions(allSessions);
    setStudents(allStudents);
    setAllEnrollments(enrollments);
  }

  useEffect(() => {
    const unsub = watchAuthState(async (user) => {
      if (!user?.email) return;
      const profile = await getUserDataByEmail(user.email);
      setAdminName(profile?.name || "Admin");
      await loadBaseData();
    });
    return () => unsub();
  }, []);

  async function handleSelectSession(sessionId) {
    setSelectedSessionId(sessionId);
    if (!sessionId) {
      setParticipants([]);
      return;
    }

    const enrollments = await getEnrollmentsBySessionId(sessionId);
    setParticipants(enrollments);
  }

  function showPopup({ title, message, type = "success" }) {
    setPopupState({ visible: true, title, message, type });
  }

  function formatEnrollTimeWIB(value) {
    if (typeof value !== "string" || !value.trim()) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";

    const parts = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta"
    }).formatToParts(parsed);

    const hh = parts.find((item) => item.type === "hour")?.value || "00";
    const mm = parts.find((item) => item.type === "minute")?.value || "00";
    return `${hh}:${mm} WIB`;
  }

  const enrollmentHistory = useMemo(() => {
    const sessionMap = new Map(sessions.map((session) => [session.id, session]));
    const studentMap = new Map(
      students.map((student) => [String(student?.email || "").toLowerCase(), student])
    );

    const rows = allEnrollments.map((enrollment) => {
      const session = sessionMap.get(enrollment.sessionId) || null;
      const student = studentMap.get(String(enrollment.studentEmail || "").toLowerCase()) || null;
      return {
        id: enrollment.id,
        sessionId: enrollment.sessionId || "",
        studentName: student?.name || "-",
        studentEmail: enrollment.studentEmail || "-",
        courseLabel: getLiveSessionCourseLabel(enrollment.courseId || session?.courseId),
        sessionTitle: session?.title || "(Session dihapus)",
        sessionType: session?.sessionType || "batch",
        batchNumber: session?.batchNumber,
        sessionNumber: session?.sessionNumber,
        sessionDate: session?.date || "-",
        enrolledAt: enrollment?.enrolledAt || "-",
        enrolledTimeText: formatEnrollTimeWIB(enrollment?.enrolledAt)
      };
    });

    const keyword = searchText.trim().toLowerCase();
    const filtered = keyword
      ? rows.filter((row) => {
          const name = String(row.studentName || "").toLowerCase();
          const email = String(row.studentEmail || "").toLowerCase();
          const title = String(row.sessionTitle || "").toLowerCase();
          const course = String(row.courseLabel || "").toLowerCase();
          return (
            name.includes(keyword) ||
            email.includes(keyword) ||
            title.includes(keyword) ||
            course.includes(keyword)
          );
        })
      : rows;

    return filtered.sort((a, b) => {
      const enrolledA = Date.parse(a.enrolledAt || "");
      const enrolledB = Date.parse(b.enrolledAt || "");
      const enrolledSort = (Number.isNaN(enrolledB) ? 0 : enrolledB) - (Number.isNaN(enrolledA) ? 0 : enrolledA);
      if (enrolledSort !== 0) return enrolledSort;

      const sessionA = Date.parse(`${a.sessionDate}T00:00:00`);
      const sessionB = Date.parse(`${b.sessionDate}T00:00:00`);
      return (Number.isNaN(sessionB) ? 0 : sessionB) - (Number.isNaN(sessionA) ? 0 : sessionA);
    });
  }, [allEnrollments, sessions, students, searchText]);

  async function handleDeleteHistoryEnrollment(row) {
    if (!row?.id) return;
    setPendingDeleteHistoryRow(row);
  }

  async function confirmDeleteHistoryEnrollment() {
    const row = pendingDeleteHistoryRow;
    if (!row?.id) return;

    setIsDeletingHistory(true);
    try {
      await removeEnrollment(row.id);
      await loadBaseData();
      if (selectedSessionId) await handleSelectSession(selectedSessionId);
      setPendingDeleteHistoryRow(null);
      showPopup({
        title: "Enrollment Dihapus",
        message: `${row.studentEmail || "Peserta"} berhasil dihapus dari riwayat enrollment.`,
        type: "success"
      });
    } finally {
      setIsDeletingHistory(false);
    }
  }

  return (
    <AdminLayout
      title="Enrollment Manager"
      subtitle="Assign siswa ke live session batch atau one-on-one"
      adminName={adminName}
    >
      <EnrollmentManager
        sessions={sessions}
        students={students}
        sessionParticipants={participants}
        onSelectSession={handleSelectSession}
        onAssign={async ({ sessionId, courseId, studentEmails }) => {
          if (!Array.isArray(studentEmails) || studentEmails.length === 0) {
            showPopup({
              title: "Belum Ada Siswa Dipilih",
              message: "Pilih minimal 1 siswa sebelum menyimpan enrollment.",
              type: "warning"
            });
            return;
          }

          const result = await assignStudentsToSession({ sessionId, courseId, studentEmails });
          await loadBaseData();
          await handleSelectSession(sessionId);
          if (result.addedCount > 0) {
            showPopup({
              title: "Enrollment Tersimpan",
              message: `${result.addedCount} siswa berhasil ditambahkan. ${result.skippedCount > 0 ? `${result.skippedCount} siswa sudah terdaftar sebelumnya.` : ""}`,
              type: "success"
            });
          } else {
            showPopup({
              title: "Tidak Ada Perubahan",
              message: "Semua siswa yang dipilih sudah pernah di-enroll ke session ini.",
              type: "warning"
            });
          }
        }}
        onRemoveEnrollment={async (enrollment) => {
          const deletedCount = await removeEnrollmentBySessionAndEmail(selectedSessionId, enrollment.studentEmail);
          await loadBaseData();
          if (selectedSessionId) await handleSelectSession(selectedSessionId);
          showPopup({
            title: "Enrollment Dihapus",
            message: `${enrollment.studentEmail || "Peserta"} berhasil dihapus dari session. ${deletedCount > 1 ? `(${deletedCount} data duplikat dibersihkan)` : ""}`,
            type: "success"
          });
        }}
      />

      <section className="admin-card">
        <div className="admin-toolbar">
          <h3>Riwayat Enrollment</h3>
          <input
            className="admin-search"
            type="text"
            placeholder="Cari siswa, email, materi..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Siswa</th>
                <th>Materi / Session</th>
                <th>Paket</th>
                <th>Tipe</th>
                <th>Batch/Sesi</th>
                <th>Tanggal Session</th>
                <th>Waktu Enroll</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {enrollmentHistory.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.studentName}</strong>
                    <br />
                    <span>{row.studentEmail}</span>
                  </td>
                  <td>{row.sessionTitle}</td>
                  <td>{row.courseLabel}</td>
                  <td>{row.sessionType}</td>
                  <td>
                    {row.sessionType === "one_on_one"
                      ? `Sesi ${row.sessionNumber || "-"}`
                      : `Batch ${row.batchNumber || "-"} / Sesi ${row.sessionNumber || "-"}`}
                  </td>
                  <td>{row.sessionDate}</td>
                  <td>{row.enrolledTimeText}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleDeleteHistoryEnrollment(row)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {enrollmentHistory.length === 0 && (
                <tr>
                  <td colSpan={8} className="admin-empty-cell">Belum ada data enrollment.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {popupState.visible && (
        <div className="admin-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="enrollment-popup-title">
          <div className="admin-popup-card">
            <div
              className={`admin-popup-icon ${popupState.type === "warning" ? "admin-popup-icon-danger" : ""}`}
              aria-hidden="true"
            >
              {popupState.type === "warning" ? "!" : "OK"}
            </div>
            <h3 id="enrollment-popup-title">{popupState.title}</h3>
            <p>{popupState.message}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setPopupState({ visible: false, title: "", message: "", type: "success" })}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {pendingDeleteHistoryRow && (
        <div className="admin-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-enrollment-title">
          <div className="admin-popup-card">
            <div className="admin-popup-icon admin-popup-icon-danger" aria-hidden="true">!</div>
            <h3 id="delete-enrollment-title">Hapus Enrollment</h3>
            <p>
              Hapus enrollment {pendingDeleteHistoryRow.studentEmail || "-"} pada "{pendingDeleteHistoryRow.sessionTitle || "-"}"?
            </p>
            <div className="admin-popup-actions">
              <button
                type="button"
                className="btn btn-outline"
                disabled={isDeletingHistory}
                onClick={() => setPendingDeleteHistoryRow(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={isDeletingHistory}
                onClick={confirmDeleteHistoryEnrollment}
              >
                {isDeletingHistory ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
