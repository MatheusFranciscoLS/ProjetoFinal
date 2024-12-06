import React from "react";
import { Link } from "react-router-dom";
import "../styles/footer.css";
import { FaHome, FaInfoCircle, FaEnvelope, FaFileAlt } from "react-icons/fa";

const Footer = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`footer ${className || ""}`}>
      <div className="footer-content">
        <div className="footer-section">
          <h3>Navegação</h3>
          <div className="footer-links">
            <Link to="/" className="footer-link">
              <FaHome /> Início
            </Link>
            <Link to="/sobre" className="footer-link">
              <FaInfoCircle /> Sobre
            </Link>
            <Link to="/contato" className="footer-link">
              <FaEnvelope /> Contato
            </Link>
            <Link to="/terms" className="footer-link">
              <FaFileAlt /> Termos
            </Link>
          </div>
        </div>

        <div className="footer-section">
          <h3>Sobre a Plataforma</h3>
          <p className="footer-description">
            A Plataforma de Divulgação de Negócios Locais em Limeira é um projeto dedicado
            a fortalecer a economia local e promover o desenvolvimento sustentável da nossa comunidade.
          </p>
        </div>

        <div className="footer-section">
          <h3>Contato</h3>
          <div className="footer-contact">
            <p>Limeira, São Paulo</p>
            <p>Email: contato@economiasolidaria.com.br</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {currentYear} Economia Solidária Limeira. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
