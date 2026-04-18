import { useState } from "react";

export default function ProgressTable({ rows = [], onReset, onUpdate }) {
  const [editingRowId, setEditingRowId] = useState("");
  const [draftProgress, setDraftProgress] = useState(0);

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Course</th>
            <th>Current Lesson</th>
            <th>Progress</th>
            <th>Completed</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isEditing = editingRowId === row.id;
            return (
              <tr key={row.id}>
                <td>{row.email || "-"}</td>
                <td>{row.courseId || "-"}</td>
                <td>{row.currentLesson || 1}</td>
                <td>
                  {isEditing ? (
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={draftProgress}
                      onChange={(event) => setDraftProgress(Number(event.target.value))}
                    />
                  ) : (
                    `${row.progress || 0}%`
                  )}
                </td>
                <td>{Array.isArray(row.completedLessons) ? row.completedLessons.length : 0}</td>
                <td className="admin-actions-cell">
                  {!isEditing ? (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setEditingRowId(row.id);
                        setDraftProgress(Number(row.progress || 0));
                      }}
                    >
                      Edit
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={async () => {
                        await onUpdate(row, draftProgress);
                        setEditingRowId("");
                      }}
                    >
                      Simpan
                    </button>
                  )}
                  <button type="button" className="btn btn-outline" onClick={() => onReset(row)}>
                    Reset
                  </button>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="admin-empty-cell">Belum ada progress.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
