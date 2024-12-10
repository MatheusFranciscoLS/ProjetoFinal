import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import "../styles/auth.css";
import { Google } from "@mui/icons-material";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    setError("");
    const emailInput = document.getElementById("email");
    if (emailInput) emailInput.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.trim() }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.email) {
      setError("Por favor, insira seu email");
      document.getElementById("email").focus();
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor, insira um email válido");
      document.getElementById("email").focus();
      return false;
    }
    if (!formData.password) {
      setError("Por favor, insira sua senha");
      document.getElementById("password").focus();
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const redirectUrl = sessionStorage.getItem("redirectUrl") || "/home";
      sessionStorage.removeItem("redirectUrl");
      navigate(redirectUrl);
    } catch (err) {
      console.error("Erro no login:", err);
      setError("Erro ao fazer login. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Criar ou atualizar o documento do usuário no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString()
      }, { merge: true });

      console.log("Usuário autenticado:", user);
      navigate("/home");
    } catch (err) {
      console.error("Erro no login com Google:", err);
      setError("Erro ao fazer login com Google. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <h2>Login</h2>
        {message && (
          <div className="info-message">
            <FiAlertCircle size={20} />
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Seu email"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div className="input-with-icon">
              <FiLock className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Sua senha"
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <p className="error-message">
              <FiAlertCircle />
              {error}
            </p>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="google-login">
          <button
            onClick={handleGoogleLogin}
            className="btn-google-register"
            disabled={loading}
          >
            <Google />
            {loading ? "Conectando..." : "Entrar com Google"}
          </button>

        </div>

        <p className="auth-link">
          Não tem uma conta? <Link to="/register">Registre-se</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
