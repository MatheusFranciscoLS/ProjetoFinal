import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/businessquestion.css";

const BusinessQuestion = () => {
  const navigate = useNavigate();

  const handleYes = () => navigate("/register-business");
  const handleNo = () => navigate("/login");

  return (
    <div className="business-question-container">
      <h2>Você possui um negócio?</h2>
      <p>
        Cadastre-o agora e alcance mais clientes. Não quer cadastrar? Sem
        problemas, continue navegando normalmente.
      </p>
      <div className="button-container">
        <button onClick={handleYes} className="yes-button" aria-label="Cadastrar meu negócio">
          Sim
        </button>
        <button onClick={handleNo} className="no-button" aria-label="Continuar sem cadastrar">
          Não
        </button>
      </div>
    </div>
  );
};

export default BusinessQuestion;
