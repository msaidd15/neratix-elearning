import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";

export default function AdminHeader({ title, subtitle = "", adminName = "Admin" }) {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logoutUser();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("[AdminHeader] Gagal logout:", error);
    }
  }

  return (
    <header className="admin-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="admin-header-actions">
        <span>Halo, {adminName}</span>
        <button type="button" className="btn btn-outline" onClick={handleLogout}>
          Keluar
        </button>
      </div>
    </header>
  );
}
