import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";  // Importa o hook useNavigate para navegação
import "../styles/auth.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();  // Hook de navegação

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Cadastro no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Usuário cadastrado com sucesso
      alert("Cadastro realizado com sucesso!");

      // Após o cadastro, redireciona para a nova página
      navigate("/business-question");  // Redireciona para a página de perguntas
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Cadastro</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nome Completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="E-mail"
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
        <input
          type="tel"
          placeholder="Telefone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Endereço (Opcional)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default Register;
