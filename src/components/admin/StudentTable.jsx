export default function StudentTable({ rows = [], onEdit, onDelete, deletingId = "" }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Paket</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.name || "-"}</td>
              <td>{row.email || "-"}</td>
              <td>{Array.isArray(row.packages) && row.packages.length > 0 ? row.packages.join(", ") : "-"}</td>
              <td className="admin-actions-cell">
                <button type="button" className="btn btn-outline" onClick={() => onEdit(row)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => onDelete?.(row)}
                  disabled={deletingId === row.id}
                >
                  {deletingId === row.id ? "Menghapus..." : "Hapus"}
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="admin-empty-cell">Belum ada data siswa.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
