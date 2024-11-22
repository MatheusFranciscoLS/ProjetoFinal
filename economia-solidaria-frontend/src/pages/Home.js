// src/pages/Home.js
import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./auth.css";

const Home = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logout realizado com sucesso!");
      // Redirecionar para a página de login (substituir por react-router-dom se necessário)
      window.location.href = "/login";
    } catch (err) {
      console.error("Erro ao sair:", err.message);
    }
  };

  return (
    <div className="home-container">
      <h1>Bem-vindo à Home</h1>
      <p>Você está autenticado!</p>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
};

export default Home;
