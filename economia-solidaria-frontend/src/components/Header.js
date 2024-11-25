import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importe useNavigate
import { auth, db } from "../firebase"; // Importe a configuração do Firebase
import { signOut } from "firebase/auth"; // Para realizar o logout
import { doc, getDoc } from "firebase/firestore"; // Para acessar dados do Firestore
import "../styles/header.css";

const Header = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
        <div className="logo">EconomiaSolidaria</div>
      </Link>
      <nav className="nav">
        {/* Links de navegação públicos visíveis apenas para usuários não autenticados */}
        {!user && (
          <>
            <Link to="/register" className="nav-link">Cadastro</Link>
            <Link to="/login" className="nav-link">Login</Link>
          </>
        )}

        {/* Links sempre visíveis */}
        <Link to="/lojas" className="nav-link">Página da Loja</Link>

        {/* Links visíveis apenas para usuários autenticados */}
        {user && (
          <>
            <Link to="/register-business" className="nav-link">Cadastrar Loja</Link>
            <Link to="/meus-negocios" className="nav-link">Meus Negócios</Link>
          </>
        )}

        {/* Link visível apenas para administradores */}
        {isAdmin && (
          <Link to="/admin-dashboard" className="nav-link">Painel Administrativo</Link>
        )}

        {/* Mostrar o nome do usuário, link de perfil e o botão de logout */}
        {user && (
          <div className="user-info">
            <span className="user-name">Olá, {user.displayName || user.email}</span>
            <div className="user-actions">
              {/* Link para o perfil */}
              <Link to="/perfil" className="nav-link">Perfil</Link>
              {/* Botão de logout */}
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
