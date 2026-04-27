function formatDateTime(timestampMs) {
  if (!timestampMs) return "-";
  return new Date(timestampMs).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function QuizResultTable({ rows = [], onViewHistory }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Course</th>
            <th>Percobaan</th>
            <th>Skor Terakhir</th>
            <th>Skor Terbaik</th>
            <th>Materi Terakhir</th>
            <th>Waktu Terakhir</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.email || "-"}</td>
              <td>{row.courseId || "-"}</td>
              <td>{row.attempts || 0}</td>
              <td>{`${row.latestScore || 0}/${row.totalQuestions || 10}`}</td>
              <td>{`${row.bestScore || 0}/${row.totalQuestions || 10}`}</td>
              <td>{row.latestLessonTitle || `Materi ${row.latestLessonId || "-"}`}</td>
              <td>{formatDateTime(row.latestSubmittedAtMs)}</td>
              <td className="admin-actions-cell">
                <button type="button" className="btn btn-outline" onClick={() => onViewHistory(row)}>
                  History
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="admin-empty-cell">Belum ada hasil quiz.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
