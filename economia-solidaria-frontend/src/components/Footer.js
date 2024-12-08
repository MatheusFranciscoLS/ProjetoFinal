import React from "react";
import { Link } from "react-router-dom";
import "../styles/footer.css";
import { FaHome, FaInfoCircle, FaEnvelope, FaFileAlt, FaFacebook, FaInstagram, FaWhatsapp, FaLinkedin } from "react-icons/fa";

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

        <div className="footer-section">
          <h3>Mídias Sociais</h3>
          <div className="social-links">
            <a href="https://facebook.com/economiasolidaria" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaFacebook />
            </a>
            <a href="https://instagram.com/economiasolidaria" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaInstagram />
            </a>
            <a href="https://wa.me/5519999214155" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaWhatsapp />
            </a>
            <a href="https://linkedin.com/economiasolidaria" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaLinkedin />
            </a>
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
