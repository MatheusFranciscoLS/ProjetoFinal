import React from "react";
import { Link } from "react-router-dom";
import "../styles/header.css";

const Header = () => {
  return (
    <header className="header">
      <Link to="/" className="nav-link">
        <div className="logo">EconomiaSolidaria</div>
      </Link>
      <nav className="nav">
        {/* Links de navegação públicos */}
        <Link to="/register" className="nav-link">
          Cadastro
        </Link>
        <Link to="/login" className="nav-link">
          Login
        </Link>
        <Link to="/sobre" className="nav-link">
          Sobre
        </Link>
        <Link to="/contato" className="nav-link">
          Contato
        </Link>
        <Link to="/avaliacao" className="nav-link">
          Avaliação
        </Link>
        <Link to="/produto" className="nav-link">
          Produto
        </Link>
        <Link to="/register-business" className="nav-link">
          Cadastrar Loja
        </Link>
        <Link to="/lojas" className="nav-link">
          Página da Loja
        </Link>
        
        {/* Links para o painel administrativo (visíveis apenas para administradores ou usuários com acesso) */}
        <Link to="/admin-dashboard" className="nav-link">
          Painel Administrativo
        </Link>
        <Link to="/edit-business/:id" className="nav-link">
          Editar Loja
        </Link>
        <Link to="/business-status/:id" className="nav-link">
          Status da Loja
        </Link>
      </nav>
    </header>
  );
};

export default Header;
