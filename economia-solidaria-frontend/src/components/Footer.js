import React from "react";
import { Link } from "react-router-dom";
import "../styles/footer.css";  // Certifique-se de que o caminho do CSS está correto

const Footer = ({ className }) => {
  return (
    <footer className={`footer ${className}`}>
      <div className="footer-nav">
        <Link to="/sobre" className="footer-link">Sobre</Link>
        <Link to="/contato" className="footer-link">Contato</Link>
      </div>
      <p>&copy; {new Date().getFullYear()} Plataforma de Divulgação de Negócios Locais em Limeira. Todos os direitos reservados.</p>
    </footer>
  );
};

export default Footer;
