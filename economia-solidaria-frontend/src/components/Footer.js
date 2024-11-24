import React from "react";
import "../styles/footer.css";  // Certifique-se de que o caminho do CSS está correto

const Footer = ({ className }) => {
  return (
    <footer className={`footer ${className}`}>
<p>&copy; {new Date().getFullYear()} Plataforma de Divulgação de Negócios Locais em Limeira. Todos os direitos reservados.</p>
    </footer>
  );
};

export default Footer;
