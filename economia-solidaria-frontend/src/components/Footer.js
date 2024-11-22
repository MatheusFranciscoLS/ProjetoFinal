import React from "react";
import "../styles/header.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Minha Aplicação. Todos os direitos reservados.</p>
    </footer>
  );
};

export default Footer;
