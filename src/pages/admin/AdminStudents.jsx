import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentTable from "../../components/admin/StudentTable";
import AdminLayout from "./AdminLayout";
import { watchAuthState } from "../../services/authService";
import { deleteStudentData, getUserDataByEmail, getStudents } from "../../services/usersService";

export default function AdminStudents() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin");
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [pendingDeleteStudent, setPendingDeleteStudent] = useState(null);

  async function loadStudents(keyword = "") {
    setLoading(true);
    try {
      const students = await getStudents(keyword);
      setRows(students);
    } catch (error) {
      console.error("[AdminStudents] gagal memuat siswa:", error);
      setRows([]);
      alert("Gagal memuat data siswa. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const unsub = watchAuthState(async (user) => {
      if (!user?.email) {
        setLoading(false);
        navigate("/admin/login", { replace: true });
        return;
      }
      const profile = await getUserDataByEmail(user.email);
      setAdminName(profile?.name || "Admin");
      await loadStudents();
    });
    return () => unsub();
  }, []);

  function handleDeleteStudent(row) {
    if (!row?.id || deletingId) return;
    setPendingDeleteStudent(row);
  }

  async function confirmDeleteStudent() {
    const row = pendingDeleteStudent;
    if (!row?.id) return;

    setDeletingId(row.id);
    try {
      const result = await deleteStudentData(row);
      await loadStudents(searchText);
      if (result?.mode === "soft-delete") {
        alert("Siswa diarsipkan (soft delete), karena rules Firestore belum mengizinkan delete.");
      }
    } catch (error) {
      console.error("[AdminStudents] gagal hapus siswa:", error);
      const message = typeof error?.message === "string" && error.message.trim()
        ? error.message
        : "Gagal menghapus siswa.";
      alert(message);
    } finally {
      setDeletingId("");
      setPendingDeleteStudent(null);
    }
  }

  return (
    <AdminLayout title="Kelola Siswa" subtitle="List dan edit data siswa" adminName={adminName}>
      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="text"
          placeholder="Cari nama/email siswa..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        <button type="button" className="btn btn-outline" onClick={() => loadStudents(searchText)}>
          Cari
        </button>
        <button type="button" className="btn btn-primary" onClick={() => navigate("/admin/students/new")}>
          Tambah Siswa
        </button>
      </div>

      {loading ? (
        <p>Memuat data siswa...</p>
      ) : (
        <StudentTable
          rows={rows}
          onEdit={(row) => navigate(`/admin/students/new?edit=${row.id}`)}
          onDelete={handleDeleteStudent}
          deletingId={deletingId}
        />
      )}

      {pendingDeleteStudent && (
        <div className="admin-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-popup-title">
          <div className="admin-popup-card">
            <div className="admin-popup-icon admin-popup-icon-danger" aria-hidden="true">
              !
            </div>
            <h3 id="delete-popup-title">Hapus Siswa</h3>
            <p>
              Hapus {pendingDeleteStudent.name || pendingDeleteStudent.email || "siswa ini"}?
              Data paket, progress, dan enrollment terkait akan ikut dihapus.
            </p>
            <div className="admin-popup-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPendingDeleteStudent(null)}
                disabled={Boolean(deletingId)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDeleteStudent}
                disabled={Boolean(deletingId)}
              >
                {deletingId ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
