import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import "../styles/login.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "", visible: false });

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setNotification({
        message: "Login berhasil, mengarahkan ke dashboard...",
        type: "success",
        visible: true
      });

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 700);
    } catch (err) {
      let message = "Login gagal. Silakan coba lagi.";

      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        message = "Sandi yang dimasukkan salah.";
      } else if (err.code === "auth/user-not-found") {
        message = "Email tidak ditemukan.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Terlalu banyak percobaan login. Coba lagi beberapa saat.";
      }

      setNotification({ message, type: "error", visible: true });
    }
  }

  return (
    <section className="login-section">
      <div className="login-container">
        <div className="login-left">
          <img src="/asset/img/random1.png" className="slide-img" alt="Ilustrasi pembelajaran robotik" />
          <div className="slide-text">
            <h2>Selamat Datang di Neratix Academy</h2>
            <p>Belajar robotik & coding jadi menyenangkan</p>
          </div>
        </div>

        <div className="login-right">
          <form className="login-box" onSubmit={handleSubmit}>
            <img src="/asset/img/NeratixLogo.png" className="login-logo" alt="Neratix Logo" />

            <h2>Selamat Datang, NeraBot</h2>
            <p className="subtitle">Masuk untuk melanjutkan proses belajar kamu</p>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                className="input-field"
                type="email"
                id="email"
                placeholder="nama@email.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="password-box">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Masukkan password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="remember-box">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Ingat Saya</span>
              </label>
            </div>

            <button type="submit" className="login-btn">
              Login
            </button>

            <div
              className={`login-notification ${notification.visible ? "show" : ""} ${notification.type}`}
              role="alert"
              aria-live="polite"
            >
              {notification.message}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
