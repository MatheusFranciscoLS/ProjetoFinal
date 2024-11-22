import React from "react";
import { Link } from "react-router-dom";
import "../styles/header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="logo">EconomiaSolidaria</div>
      <nav className="nav">
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
        avaliacao
        </Link>
        
      </nav>
    </header>
  );
};

export default Header;
