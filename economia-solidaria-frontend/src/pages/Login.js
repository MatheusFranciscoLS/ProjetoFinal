import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importar o hook useNavigate
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Estado para exibir mensagens de erro

  const navigate = useNavigate(); // Inicializar o hook useNavigate

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login realizado com sucesso!");
      navigate("/home"); // Redirecionar para a página Home
    } catch (err) {
      // Exibir uma mensagem de erro simples e profissional
      setError("Credenciais inválidas. Tente novamente.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        {/* Mensagem de erro simples e profissional */}
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
