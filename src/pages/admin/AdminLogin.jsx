import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmailPassword } from "../../services/authService";
import { getUserDataByEmail } from "../../services/usersService";
import "../../styles/login.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorText("");
    setLoading(true);

    try {
      const credential = await loginWithEmailPassword(email, password);
      const profile = await getUserDataByEmail(credential.user.email || "");

      if (profile?.role !== "admin") {
        setErrorText("Akses ditolak. Akun ini bukan admin.");
        return;
      }

      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      console.error("[AdminLogin] login gagal:", error);
      setErrorText("Login admin gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="login-section">
      <div className="login-container">
        <div className="login-left">
          <img src="/asset/img/random1.png" className="slide-img" alt="Admin panel" />
          <div className="slide-text">
            <h2>Admin Neratix Panel</h2>
            <p>Kelola siswa, progress, session, dan assignment dari satu tempat.</p>
          </div>
        </div>
        <div className="login-right">
          <form className="login-box" onSubmit={handleSubmit}>
            <h2>Login Admin</h2>
            <p className="subtitle">Gunakan akun admin resmi</p>
            <div className="input-group">
              <label>Email Admin</label>
              <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Memproses..." : "Masuk Admin"}
            </button>
            {errorText && <p className="login-notification show error">{errorText}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
