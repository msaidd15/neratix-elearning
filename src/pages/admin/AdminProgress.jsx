import { useEffect, useState } from "react";
import ProgressTable from "../../components/admin/ProgressTable";
import AdminLayout from "./AdminLayout";
import { watchAuthState } from "../../services/authService";
import { getAllProgress, resetProgress, updateProgress } from "../../services/progressService";
import { getUserDataByEmail } from "../../services/usersService";

export default function AdminProgress() {
  const [adminName, setAdminName] = useState("Admin");
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

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
        />
      )}
    </AdminLayout>
  );
}
