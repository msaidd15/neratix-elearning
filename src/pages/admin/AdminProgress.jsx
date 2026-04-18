import { useEffect, useState } from "react";
import ProgressTable from "../../components/admin/ProgressTable";
import AdminLayout from "./AdminLayout";
import { watchAuthState } from "../../services/authService";
import { deleteProgress, getAllProgress, resetProgress, updateProgress } from "../../services/progressService";
import { getUserDataByEmail } from "../../services/usersService";

export default function AdminProgress() {
  const [adminName, setAdminName] = useState("Admin");
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingDeleteRow, setPendingDeleteRow] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadRows(keyword = "") {
    setLoading(true);
    const data = await getAllProgress(keyword);
    setRows(data);
    setLoading(false);
  }

  useEffect(() => {
    const unsub = watchAuthState(async (user) => {
      if (!user?.email) return;
      const profile = await getUserDataByEmail(user.email);
      setAdminName(profile?.name || "Admin");
      await loadRows();
    });
    return () => unsub();
  }, []);

  async function confirmDeleteProgress() {
    const row = pendingDeleteRow;
    if (!row?.id) return;

    setIsDeleting(true);
    try {
      await deleteProgress(row.id);
      await loadRows(searchText);
      setPendingDeleteRow(null);
    } catch (error) {
      console.error("[AdminProgress] gagal hapus progress:", error);
      const message = typeof error?.message === "string" && error.message.trim()
        ? error.message
        : "Gagal menghapus progress.";
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AdminLayout title="Tracker Progress Siswa" subtitle="Pantau dan reset progress course siswa" adminName={adminName}>
      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="text"
          placeholder="Cari email/course..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        <button type="button" className="btn btn-outline" onClick={() => loadRows(searchText)}>Cari</button>
      </div>

      {loading ? (
        <p>Memuat progress...</p>
      ) : (
        <ProgressTable
          rows={rows}
          onReset={async (row) => {
            await resetProgress(row.id);
            await loadRows(searchText);
          }}
          onUpdate={async (row, nextProgress) => {
            await updateProgress(row.id, { progress: nextProgress });
            await loadRows(searchText);
          }}
          onDelete={(row) => setPendingDeleteRow(row)}
        />
      )}

      {pendingDeleteRow && (
        <div className="admin-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-progress-title">
          <div className="admin-popup-card">
            <div className="admin-popup-icon admin-popup-icon-danger" aria-hidden="true">!</div>
            <h3 id="delete-progress-title">Hapus Progress</h3>
            <p>
              Hapus data progress untuk {pendingDeleteRow.email || "-"} ({pendingDeleteRow.courseId || "-"})?
            </p>
            <div className="admin-popup-actions">
              <button
                type="button"
                className="btn btn-outline"
                disabled={isDeleting}
                onClick={() => setPendingDeleteRow(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={isDeleting}
                onClick={confirmDeleteProgress}
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
