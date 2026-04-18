export default function LiveSessionCard({ session, latestSessionNumber = 0 }) {
  const {
    title,
    sessionNumber,
    description,
    thumbnail,
    date,
    time,
    mentor,
    zoomLink,
    status
  } = session;

  const getDisplayStatus = () => {
    const currentSessionNumber = Number(sessionNumber || 0);
    const isCompletedBySequence =
      latestSessionNumber > 0 &&
      currentSessionNumber > 0 &&
      currentSessionNumber < latestSessionNumber;

    const rawStatus = typeof status === "string" ? status.trim().toLowerCase() : "";
    const isCompletedByStatus =
      rawStatus === "completed" || rawStatus === "complete" || rawStatus === "done" || rawStatus === "finished";

    const isCompletedByDate = (() => {
      if (typeof date !== "string" || !date) return false;
      const parsedDate = new Date(`${date}T00:00:00`);
      if (Number.isNaN(parsedDate.getTime())) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return parsedDate < today;
    })();

    if (isCompletedBySequence || isCompletedByStatus || isCompletedByDate) {
      return {
        label: "Class Complate",
        badgeClass: "live-status-complete"
      };
    }

    if (rawStatus === "upcoming") {
      return {
        label: "Upcoming",
        badgeClass: "live-status-upcoming"
      };
    }

    return {
      label: rawStatus ? rawStatus[0].toUpperCase() + rawStatus.slice(1) : "Upcoming",
      badgeClass: "live-status-upcoming"
    };
  };

  const getSafeZoomLink = () => {
    if (typeof zoomLink !== "string") return "";
    const rawLink = zoomLink.trim();
    if (!rawLink) return "";

    try {
      const directUrl = new URL(rawLink);
      if (directUrl.protocol === "https:" || directUrl.protocol === "http:") {
        return directUrl.toString();
      }
      return "";
    } catch {
      try {
        const prefixedUrl = new URL(`https://${rawLink}`);
        return prefixedUrl.toString();
      } catch {
        return "";
      }
    }
  };

  const safeZoomLink = getSafeZoomLink();

  const displayStatus = getDisplayStatus();

  return (
    <article className="live-session-card">
      {displayStatus.badgeClass === "live-status-complete" && (
        <span className="live-session-stamp">Class Complate</span>
      )}
      <img
        className="live-session-thumb"
        src={
          thumbnail ||
          "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1000&q=80"
        }
        alt={title || "Live Session"}
      />
      <div className="live-session-body">
        <div className="live-session-badge-row">
          <span className="live-session-badge">Live Session ke-{sessionNumber || "-"}</span>
          <span className={`live-session-status ${displayStatus.badgeClass}`}>{displayStatus.label}</span>
        </div>
        <h4 className="live-session-title">{title || "Judul belum tersedia"}</h4>
        <p className="live-session-description">
          {description || "Deskripsi live session belum tersedia."}
        </p>

        <div className="live-session-meta">
          <p>
            <strong>Tanggal:</strong> {date || "-"}
          </p>
          <p>
            <strong>Jam:</strong> {time || "-"}
          </p>
          <p>
            <strong>Mentor:</strong> {mentor || "-"}
          </p>
          <p>
            <strong>Status:</strong> {displayStatus.label}
          </p>
        </div>

        <a
          className="live-session-button"
          href={safeZoomLink || "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => {
            if (!safeZoomLink) {
              event.preventDefault();
              console.warn("[LiveSessionCard] Zoom link tidak valid:", zoomLink);
              return;
            }
            event.stopPropagation();
          }}
        >
          Gabung Zoom
        </a>
      </div>
    </article>
  );
}
