function getDisplayStatus(session) {
  const rawStatus = typeof session?.status === "string" ? session.status.trim().toLowerCase() : "";
  const labels = {
    upcoming: "Upcoming",
    completed: "Class Complete",
    done: "Class Complete",
    finished: "Class Complete"
  };

  return labels[rawStatus] || (rawStatus ? rawStatus[0].toUpperCase() + rawStatus.slice(1) : "Upcoming");
}

function isComplete(session) {
  const rawStatus = typeof session?.status === "string" ? session.status.trim().toLowerCase() : "";
  if (["completed", "done", "finished"].includes(rawStatus)) return true;
  if (!session?.date) return false;

  const parsed = new Date(`${session.date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed < today;
}

export default function AssignedLiveSessionCard({ session }) {
  const statusLabel = getDisplayStatus(session);
  const complete = isComplete(session);
  const safeZoomLink = typeof session.zoomLink === "string" ? session.zoomLink.trim() : "";
  const isOneOnOne = (session?.sessionType || "batch") === "one_on_one";

  return (
    <article className="live-session-card">
      {complete && <span className="live-session-stamp">Class Complete</span>}
      <img
        className="live-session-thumb"
        src={
          session.thumbnail ||
          "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1000&q=80"
        }
        alt={session.title || "Live Session"}
      />

      <div className="live-session-body">
        <div className="live-session-badge-row">
          <span className="live-session-badge">
            {isOneOnOne
              ? `One-on-One • Live Session ke-${session.sessionNumber || "-"}`
              : `Batch ${session.batchNumber || "-"} • Live Session ke-${session.sessionNumber || "-"}`}
          </span>
          <span className={`live-session-status ${complete ? "live-status-complete" : "live-status-upcoming"}`}>
            {statusLabel}
          </span>
        </div>
        <h4 className="live-session-title">{session.title || "Judul belum tersedia"}</h4>
        <p className="live-session-description">{session.description || "Deskripsi sesi belum tersedia."}</p>

        <div className="live-session-meta">
          <p><strong>Tanggal:</strong> {session.date || "-"}</p>
          <p><strong>Jam:</strong> {session.time || "-"}</p>
          <p><strong>Mentor:</strong> {session.mentor || "-"}</p>
          <p><strong>Tipe:</strong> {session.sessionType || "batch"}</p>
        </div>

        <a
          className="live-session-button"
          href={safeZoomLink || "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => {
            if (!safeZoomLink) event.preventDefault();
          }}
        >
          Gabung Zoom
        </a>
      </div>
    </article>
  );
}
