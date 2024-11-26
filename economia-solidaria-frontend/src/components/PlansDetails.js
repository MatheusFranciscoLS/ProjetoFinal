import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/plansDetails.css"; // Estilo para a página de planos

const PlansDetails = () => {
  const navigate = useNavigate();

  return (
    <div className="plans-details-container">
      <h2>Detalhes dos Planos</h2>

      <div className="plan-detail">
        <h3>Plano Essencial</h3>
        <p>
          O plano Essencial oferece recursos básicos para utilizar a plataforma
          sem custos adicionais. Ideal para usuários iniciantes ou para quem
          deseja uma solução simples e prática.
        </p>
      </div>

      <div className="plan-detail">
        <h3>Plano Premium</h3>
        <p>
          O plano Premium inclui funcionalidades avançadas, suporte prioritário
          e acesso a todos os recursos da plataforma. Ideal para quem busca
          mais eficiência e benefícios exclusivos.
        </p>
      </div>

      <div className="plan-detail">
        <h3>Plano Gratuito</h3>
        <p>
          O plano Gratuito é a versão básica da plataforma, com recursos limitados.
          Perfeito para quem está começando a utilizar a plataforma.
        </p>
      </div>

      {/* Botão para voltar ao perfil */}
      <button onClick={() => navigate("/perfil")} className="back-button">
        Voltar ao Perfil
      </button>
    </div>
  );
};

export default PlansDetails;
