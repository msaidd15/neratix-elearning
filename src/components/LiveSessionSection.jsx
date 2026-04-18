import { useRef } from "react";
import LiveSessionCard from "./LiveSessionCard";

export default function LiveSessionSection({ sessions, isLoading, error }) {
  const shouldUseHorizontalSlider = sessions.length > 2;
  const latestSessionNumber = sessions.reduce((max, session) => {
    const current = Number(session?.sessionNumber || 0);
    return current > max ? current : max;
  }, 0);
  const sliderRef = useRef(null);

  const scrollByCard = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const scrollAmount = Math.max(280, Math.floor(slider.clientWidth * 0.55));
    slider.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  return (
    <section className="live-session-section">
      <div className="live-session-head-row">
        <div className="section-head">
          <h3>Live Session Kamu</h3>
          <p>Jadwal mentoring live sesuai paket Plus kamu</p>
        </div>

        {shouldUseHorizontalSlider && (
          <div className="live-session-nav" aria-label="Navigasi live session">
            <button
              type="button"
              className="live-session-nav-btn"
              onClick={() => scrollByCard("left")}
              aria-label="Geser ke kiri"
            >
              &#8592;
            </button>
            <button
              type="button"
              className="live-session-nav-btn"
              onClick={() => scrollByCard("right")}
              aria-label="Geser ke kanan"
            >
              &#8594;
            </button>
          </div>
        )}
      </div>

      {isLoading && <div className="live-session-state">Memuat live session...</div>}

      {!isLoading && error && (
        <div className="live-session-state live-session-state-error">
          Gagal memuat live session. Coba refresh halaman.
        </div>
      )}

      {!isLoading && !error && sessions.length === 0 && (
        <div className="live-session-state">Belum ada live session terjadwal minggu ini.</div>
      )}

      {!isLoading && !error && sessions.length > 0 && (
        <div
          ref={sliderRef}
          className={`live-session-grid ${shouldUseHorizontalSlider ? "is-scrollable" : "is-static"}`}
        >
          {sessions.map((session) => (
            <LiveSessionCard
              key={session.id}
              session={session}
              latestSessionNumber={latestSessionNumber}
            />
          ))}
        </div>
      )}
    </section>
  );
}
