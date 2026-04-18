import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmailPassword } from "../../services/authService";
import { getUserDataByEmail } from "../../services/usersService";
import "../../styles/login.css";

export default function StudentLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setErrorText("");

    try {
      const credential = await loginWithEmailPassword(email, password);
      const profile = await getUserDataByEmail(credential.user.email || "");

      if (profile?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("[StudentLogin] login gagal:", error);
      setErrorText("Login gagal. Cek email dan password kamu.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="login-section">
      <div className="login-container">
        <div className="login-left">
          <img src="/asset/img/random1.png" className="slide-img" alt="Ilustrasi pembelajaran robotik" />
          <div className="slide-text">
            <h2>Selamat Datang di Neratix Academy</h2>
            <p>Masuk untuk melanjutkan belajar robotikmu.</p>
          </div>
        </div>
        <div className="login-right">
          <form className="login-box" onSubmit={handleSubmit}>
            <img src="/asset/img/NeratixLogo.png" className="login-logo" alt="Neratix Logo" />
            <h2>Login Student</h2>
            <p className="subtitle">Gunakan akun student kamu</p>

            <div className="input-group">
              <label htmlFor="student-email">Email</label>
              <input
                id="student-email"
                className="input-field"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="student-password">Password</label>
              <input
                id="student-password"
                className="input-field"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <button className="login-btn" type="submit" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Login"}
            </button>

            {errorText && <p className="login-notification show error">{errorText}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
