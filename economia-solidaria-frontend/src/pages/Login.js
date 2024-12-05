import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  const validateForm = () => {
    if (!email.trim()) {
      setError("Por favor, insira seu email");
      return false;
    }
    if (!password.trim()) {
      setError("Por favor, insira sua senha");
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
      await signInWithEmailAndPassword(auth, email, password);
      const redirectUrl = sessionStorage.getItem('redirectUrl') || '/home';
      sessionStorage.removeItem('redirectUrl'); // Limpa o URL armazenado
      navigate(redirectUrl);
    } catch (err) {
      console.error('Erro no login:', err);
      switch (err.code) {
        case 'auth/invalid-email':
          setError("Email inválido");
          break;
        case 'auth/user-disabled':
          setError("Esta conta foi desativada");
          break;
        case 'auth/user-not-found':
          setError("Usuário não encontrado");
          break;
        case 'auth/wrong-password':
          setError("Senha incorreta");
          break;
        case 'auth/too-many-requests':
          setError("Muitas tentativas de login. Tente novamente mais tarde");
          break;
        default:
          setError("Erro ao fazer login. Por favor, tente novamente");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {message && <p className="info-message">{message}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(""); // Limpa o erro quando o usuário começa a digitar
          }}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(""); // Limpa o erro quando o usuário começa a digitar
          }}
          required
          disabled={loading}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};

export default Login;
