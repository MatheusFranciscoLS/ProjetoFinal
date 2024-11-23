import React from "react";
import { useNavigate } from "react-router-dom"; // Para navegação
import "../styles/businessquestion.css"; // Importando o novo arquivo de estilos específico

const BusinessQuestion = () => {
  const navigate = useNavigate(); // Hook de navegação

  const handleYes = () => {
    // Lógica para quando o usuário clicar em "Sim"
    alert("Você será redirecionado para o cadastro de negócio.");
    // Navega para a página de cadastro do negócio
    navigate("/register-business");
  };

  const handleNo = () => {
    // Lógica para quando o usuário clicar em "Não"
    alert("Você pode continuar sem cadastrar seu negócio.");
    // Navega de volta para a página principal ou para onde preferir
    navigate("/");
  };

  return (
    <div className="business-question-container">
      <h2>Você é proprietário de um negócio?</h2>
      <p>Clique abaixo para cadastrar seu negócio, ou siga sem cadastrar.</p>
      <button onClick={handleYes}>Sim</button>
      <button onClick={handleNo}>Não</button>
    </div>
  );
};

export default BusinessQuestion;
