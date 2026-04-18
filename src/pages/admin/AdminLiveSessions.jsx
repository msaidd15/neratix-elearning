import { useEffect, useState } from "react";
import LiveSessionForm from "../../components/admin/LiveSessionForm";
import AdminLayout from "./AdminLayout";
import { watchAuthState } from "../../services/authService";
import {
  createLiveSession,
  deleteLiveSession,
  getAllLiveSessions,
  updateLiveSession
} from "../../services/liveSessionsService";
import { getLiveSessionCourseLabel } from "../../lib/liveSessionLabels";
import { getUserDataByEmail } from "../../services/usersService";

export default function AdminLiveSessions() {
  const [adminName, setAdminName] = useState("Admin");
  const [sessions, setSessions] = useState([]);
  const [editingSession, setEditingSession] = useState(null);
  const [popupState, setPopupState] = useState({ visible: false, title: "", message: "", type: "success" });

  function showPopup({ title, message, type = "success" }) {
    setPopupState({ visible: true, title, message, type });
  }

  async function loadSessions() {
    const data = await getAllLiveSessions();
    setSessions(data);
  }

  useEffect(() => {
    const unsub = watchAuthState(async (user) => {
      if (!user?.email) return;
      const profile = await getUserDataByEmail(user.email);
      setAdminName(profile?.name || "Admin");
      await loadSessions();
    });
    return () => unsub();
  }, []);

  async function handleSubmit(payload) {
    try {
      if (editingSession?.id) {
        await updateLiveSession(editingSession.id, payload);
        showPopup({
          title: "Live Session Diperbarui",
          message: "Perubahan live session berhasil disimpan.",
          type: "success"
        });
      } else {
        await createLiveSession(payload);
        showPopup({
          title: "Live Session Ditambahkan",
          message: "Live session baru berhasil ditambahkan.",
          type: "success"
        });
      }
      setEditingSession(null);
      await loadSessions();
    } catch (error) {
      console.error("[AdminLiveSessions] gagal simpan:", error);
      if (error?.code === "permission-denied") {
        showPopup({
          title: "Gagal Menyimpan",
          message: "Akun ini belum punya izin admin Firestore.",
          type: "warning"
        });
        return;
      }

      showPopup({
        title: "Gagal Menyimpan",
        message: error?.message ? `Gagal menyimpan live session: ${error.message}` : "Gagal menyimpan live session.",
        type: "warning"
      });
    }
  }

  return (
    <AdminLayout title="Kelola Live Sessions" subtitle="Buat, edit, dan hapus live session" adminName={adminName}>
      <div className="admin-layout-grid">
        <section className="admin-card">
          <h3>{editingSession ? "Edit Live Session" : "Tambah Live Session"}</h3>
          <LiveSessionForm
            initialValues={editingSession}
            onSubmit={handleSubmit}
            submitLabel={editingSession ? "Update Session" : "Tambah Session"}
          />
        </section>

        <section className="admin-card">
          <h3>Daftar Live Session</h3>
          <ul className="admin-list">
            {sessions.map((session) => (
              <li key={session.id}>
                <div>
                  <strong>{session.title}</strong>
                  {(session.sessionType || "batch") === "one_on_one" ? (
                    <p>
                      {getLiveSessionCourseLabel(session.courseId)} • One-on-One • Session {session.sessionNumber || "-"} • {session.date} • {session.time}
                    </p>
                  ) : (
                    <p>
                      {getLiveSessionCourseLabel(session.courseId)} • Batch {session.batchNumber || "-"} • Session {session.sessionNumber || "-"} • {session.date} • {session.time} • {session.sessionType || "batch"}
                    </p>
                  )}
                </div>
                <div className="admin-actions-row">
                  <button type="button" className="btn btn-outline" onClick={() => setEditingSession(session)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={async () => {
                      await deleteLiveSession(session.id);
                      if (editingSession?.id === session.id) setEditingSession(null);
                      await loadSessions();
                    }}
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
            {sessions.length === 0 && <li>Belum ada live session.</li>}
          </ul>
        </section>
      </div>

      {popupState.visible && (
        <div className="admin-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="live-session-popup-title">
          <div className="admin-popup-card">
            <div
              className={`admin-popup-icon ${popupState.type === "warning" ? "admin-popup-icon-danger" : ""}`}
              aria-hidden="true"
            >
              {popupState.type === "warning" ? "!" : "OK"}
            </div>
            <h3 id="live-session-popup-title">{popupState.title}</h3>
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
    </AdminLayout>
  );
}
