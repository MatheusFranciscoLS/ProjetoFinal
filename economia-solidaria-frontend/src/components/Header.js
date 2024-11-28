import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importe useNavigate
import { auth, db } from "../firebase"; // Importe a configuração do Firebase
import { signOut } from "firebase/auth"; // Para realizar o logout
import { doc, getDoc } from "firebase/firestore"; // Para acessar dados do Firestore
import "../styles/header.css";

const Header = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para controlar o menu hambúrguer
  const navigate = useNavigate(); // Hook para navegação

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user); // Quando o usuário está autenticado

        // Verificar se o usuário é admin, buscando o campo 'tipo' no Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid)); // Supondo que o usuário esteja na coleção 'users'
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.tipo === "admin");
          }
        } catch (error) {
          console.error("Erro ao verificar o papel do usuário:", error);
        }
      } else {
        setUser(null); // Quando o usuário não está autenticado
        setIsAdmin(false); // Resetar se o usuário não estiver autenticado
      }
    });

    return unsubscribe; // Limpeza do listener quando o componente for desmontado
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Realiza o logout
      setUser(null); // Limpa o estado do usuário
      setIsAdmin(false); // Limpa o estado de administrador
      navigate("/"); // Redireciona para a página "Home"
    } catch (error) {
      console.error("Erro ao sair", error);
    }
  };

  return (
    <header className="header">
      <Link to="/" className="nav-link">
        <img
          src={require("../assets/brabo.jpg")}
          alt="Economia Solidária"
          className="logo"
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </Link>

      <div className="hamburger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
        <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
        <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
      </div>

      <nav className={`nav ${isMenuOpen ? "open" : ""}`}>
        <Link to="/lojas" className="nav-link">
          Página da Loja
        </Link>
        {!user && (
          <>
            <Link to="/register" className="nav-link">
              Cadastro
            </Link>
            <Link to="/login" className="nav-link">
              Login
            </Link>
          </>
        )}
        {user && (
          <>
            <Link to="/register-business" className="nav-link">
              Cadastrar Loja
            </Link>
            <Link to="/meus-negocios" className="nav-link">
              Meus Negócios
            </Link>
          </>
        )}
        {isAdmin && (
          <>
            <Link to="/admin-dashboard" className="nav-link">
              Painel Administrativo
            </Link>
            <Link to="/admin-gerenciamento" className="nav-link">
              Gerenciamento
            </Link>
          </>
        )}
        {user && (
          <div className="user-info">
            <span className="user-name">
              Olá, {user.displayName || user.email}
            </span>
            <div className="user-actions">
              <Link to="/perfil" className="nav-link">
                Perfil
              </Link>
              <button className="logout-button" onClick={handleLogout}>
                Sair
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
