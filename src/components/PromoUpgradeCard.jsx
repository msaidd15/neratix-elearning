export default function PromoUpgradeCard() {
  return (
    <section className="promo-upgrade-card">
      <div className="promo-upgrade-visual" aria-hidden="true">
        <img
          className="promo-upgrade-hero-image"
          src="https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=500&q=80"
          alt=""
        />
        <span className="promo-upgrade-live-pill">Live Class</span>
        <div className="promo-upgrade-icon-wrap promo-upgrade-icon-wrap-chat">
          <span className="promo-upgrade-icon">CHAT</span>
        </div>
      </div>

      <div className="promo-upgrade-content">
        <span className="promo-upgrade-badge">Upgrade Plus</span>
        <h3 className="promo-upgrade-title">Aktifkan Paket Plus</h3>
        <p className="promo-upgrade-description">
          Buka akses Class Live Session setiap minggu dan belajar langsung bersama mentor Neratix.
        </p>

        <ul className="promo-upgrade-benefits">
          <li>Live Session mingguan</li>
          <li>Belajar langsung dengan mentor</li>
          <li>Jadwal sesuai paket belajar</li>
        </ul>

        <a
          className="promo-upgrade-button"
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noopener noreferrer"
        >
          Hubungi Admin
        </a>

        <p className="promo-upgrade-note">
          Upgrade paketmu untuk mendapatkan pengalaman belajar yang lebih seru dan interaktif.
        </p>
      </div>
    </section>
  );
}
