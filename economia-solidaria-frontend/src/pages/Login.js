import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import "../styles/auth.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  useEffect(() => {
    // Limpa a mensagem de erro quando o componente é montado
    setError("");
    // Foca no campo de email quando o componente carrega
    const emailInput = document.getElementById("email");
    if (emailInput) emailInput.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
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
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const redirectUrl = sessionStorage.getItem('redirectUrl') || '/home';
      sessionStorage.removeItem('redirectUrl');
      navigate(redirectUrl);
    } catch (err) {
      console.error('Erro no login:', err);
      switch (err.code) {
        case 'auth/invalid-email':
          setError("Email inválido");
          document.getElementById("email").focus();
          break;
        case 'auth/user-disabled':
          setError("Esta conta foi desativada. Entre em contato com o suporte.");
          break;
        case 'auth/user-not-found':
          setError("Usuário não encontrado. Verifique seu email ou registre-se.");
          document.getElementById("email").focus();
          break;
        case 'auth/wrong-password':
          setError("Senha incorreta. Tente novamente.");
          document.getElementById("password").focus();
          break;
        case 'auth/too-many-requests':
          setError("Muitas tentativas de login. Por favor, tente novamente mais tarde.");
          break;
        default:
          setError("Erro ao fazer login. Por favor, tente novamente ou entre em contato com o suporte.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin(e);
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
                onKeyPress={handleKeyPress}
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
                onKeyPress={handleKeyPress}
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
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="auth-link">
            Não tem uma conta? <Link to="/register">Registre-se</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
