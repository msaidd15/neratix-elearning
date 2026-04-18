import { useMemo, useState } from "react";
import { getLiveSessionCourseLabel } from "../../lib/liveSessionLabels";

export default function EnrollmentManager({
  sessions = [],
  students = [],
  sessionParticipants = [],
  onSelectSession,
  onAssign,
  onRemoveEnrollment
}) {
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) || null,
    [sessions, selectedSessionId]
  );

  function toggleEmail(email) {
    setSelectedEmails((prev) => {
      const set = new Set(prev);
      if (set.has(email)) set.delete(email);
      else set.add(email);
      return [...set];
    });
  }

  return (
    <div className="admin-layout-grid enrollment-layout-grid">
      <section className="admin-card enrollment-session-card">
        <h3>Pilih Live Session</h3>
        <select
          className="enrollment-session-select"
          value={selectedSessionId}
          onChange={(event) => {
            const nextSessionId = event.target.value;
            setSelectedSessionId(nextSessionId);
            setSelectedEmails([]);
            onSelectSession(nextSessionId);
          }}
        >
          <option value="">Pilih Session</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {(session.sessionType || "batch") === "one_on_one"
                ? `${getLiveSessionCourseLabel(session.courseId)} - One-on-One - Sesi ${session.sessionNumber || "-"} - ${session.title} - ${session.date}`
                : `${getLiveSessionCourseLabel(session.courseId)} - Batch ${session.batchNumber || "-"} - Sesi ${session.sessionNumber || "-"} - ${session.title} - ${session.date} (${session.sessionType || "batch"})`}
            </option>
          ))}
        </select>

        {selectedSession && (
          <>
            <h4>Assign Siswa</h4>
            <div className="assign-students-list-wrap">
              <div className="admin-checkbox-grid">
                {students.map((student) => (
                  <label key={student.id} className="admin-check-item">
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(student.email)}
                      onChange={() => toggleEmail(student.email)}
                    />
                    <span>{student.name || student.email}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={isSaving}
              onClick={async () => {
                setIsSaving(true);
                try {
                  await onAssign({
                    sessionId: selectedSession.id,
                    courseId: selectedSession.courseId,
                    studentEmails: selectedEmails
                  });
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              {isSaving ? "Menyimpan..." : "Simpan Enrollment"}
            </button>
          </>
        )}
      </section>

      <section className="admin-card participant-session-card">
        <h3>Peserta Session</h3>
        {sessionParticipants.length === 0 ? (
          <p>Belum ada peserta di session ini.</p>
        ) : (
          <div className="participant-session-list-wrap">
            <ul className="admin-list admin-list-compact">
              {sessionParticipants.map((participant) => (
                <li key={participant.id}>
                  <span>{participant.studentEmail}</span>
                  <button type="button" className="btn btn-outline" onClick={() => onRemoveEnrollment(participant)}>
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
