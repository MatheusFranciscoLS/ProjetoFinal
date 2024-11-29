import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase"; // Certifique-se de exportar auth e db do Firebase
import { doc, updateDoc } from "firebase/firestore";
import "../styles/plansDetails.css"; // Estilo para a página de planos

const PlansDetails = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const plans = [
    {
      name: "Essencial",
      description:
        "O plano Essencial oferece recursos básicos para utilizar a plataforma sem custos adicionais. Ideal para usuários iniciantes ou para quem deseja uma solução simples e prática.",
      price: "0",
      period: "Gratuito",
    },
    {
      name: "Premium",
      description:
        "O plano Premium inclui funcionalidades avançadas, suporte prioritário e acesso a todos os recursos da plataforma. Ideal para quem busca mais eficiência e benefícios exclusivos.",
      price: "29",
      period: "/mês",
    },
    {
      name: "Gratuito",
      description:
        "O plano Gratuito é a versão básica da plataforma, com recursos limitados. Perfeito para quem está começando a utilizar a plataforma.",
      price: "0",
      period: "Gratuito",
    },
  ];

  const handleSelectPlan = async (selectedPlan) => {
    setError("");
    setSuccess("");

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setError("Usuário não autenticado. Faça login para continuar.");
        return;
      }

      await updateDoc(doc(db, "users", currentUser.uid), {
        plano: selectedPlan,
      });

      setSuccess(`Plano ${selectedPlan} selecionado com sucesso!`);
    } catch (err) {
      console.error("Erro ao atualizar o plano:", err);
      setError("Erro ao selecionar o plano. Tente novamente.");
    }
  };

  return (
    <div className="plans-details-container">
      <h2>Detalhes dos Planos</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="plans-cards">
        {plans.map((plan, index) => (
          <div key={index} className="pack_card">
            <div className="banner">
              {plan.name === "Premium" && (
                <span className="banner_tag">Mais popular</span>
              )}
            </div>
            <div className="pack_name">{plan.name}</div>
            <p className="description">{plan.description}</p>
            <div className="bottom">
              <div className="price_container">
                <span className="devise">R$</span>
                <span className="price">{plan.price}</span>
                <span className="date">{plan.period}</span>
              </div>
              <button
                className="btn"
                onClick={() => handleSelectPlan(plan.name)}
              >
                Escolher {plan.name}
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => navigate("/perfil")} className="back-button">
        Voltar ao Perfil
      </button>
    </div>
  );
};

export default PlansDetails;
