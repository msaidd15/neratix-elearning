import AssignedLiveSessionCard from "./AssignedLiveSessionCard";

export default function AssignedLiveSessionSection({ sessions, isLoading, error }) {
  const shouldUseHorizontalSlider = sessions.length > 2;

  return (
    <section className="live-session-section">
      <div className="section-head">
        <h3>Live Session Kamu</h3>
        <p>Sesi yang di-assign khusus untuk akun kamu</p>
      </div>

      {isLoading && <div className="live-session-state">Memuat live session...</div>}

      {!isLoading && error && (
        <div className="live-session-state live-session-state-error">
          Gagal memuat live session. Coba refresh halaman.
        </div>
      )}

      {!isLoading && !error && sessions.length === 0 && (
        <div className="live-session-state">Belum ada live session terjadwal untukmu.</div>
      )}

      {!isLoading && !error && sessions.length > 0 && (
        <div className={`live-session-grid ${shouldUseHorizontalSlider ? "is-scrollable" : "is-static"}`}>
          {sessions.map((session) => (
            <AssignedLiveSessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </section>
  );
}
