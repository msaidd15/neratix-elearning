import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";

export default function Navbar({ title = "Neratix Academy", subtitle = "", rightContent = null }) {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logoutUser();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("[Navbar] Gagal logout:", error);
      alert("Gagal logout. Coba lagi.");
    }
  }

  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-mark">N</div>
        <div className="brand-text">
          <h1>{title}</h1>
          <p>{subtitle || "Dashboard NeraBot"}</p>
        </div>
      </div>

      <div className="header-actions">
        {rightContent}
        <button className="btn btn-outline" type="button" onClick={handleLogout}>
          Keluar
        </button>
      </div>
    </header>
  );
}
