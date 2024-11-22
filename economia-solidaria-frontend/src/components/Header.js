import React from "react";
import { Link } from "react-router-dom";
import "../styles/header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="logo">Eco-Link</div>
      <nav className="nav">
        <Link to="/register" className="nav-link">
          Cadastro
        </Link>
        <Link to="/login" className="nav-link">
          Login
        </Link>
      </nav>
    </header>
  );
};

export default Header;
