import React from "react";
import "../styles/footer.css";  // Corrigi o nome para "footer.css" caso o arquivo seja de estilo para o footer

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Minha Aplicação. Todos os direitos reservados.</p>
    </footer>
  );
};

export default Footer;
