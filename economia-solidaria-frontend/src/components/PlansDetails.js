import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase"; // Certifique-se de exportar auth e db do Firebase
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../styles/plansDetails.css"; // Estilo para a página de planos

const PlansDetails = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPlan, setCurrentPlan] = useState(""); // Armazena o plano atual do usuário
  const [businessCount, setBusinessCount] = useState(0); // Armazena o número de negócios do usuário
  const navigate = useNavigate();

  const plans = [
    {
      name: "Gratuito",
      description:
        "O plano Gratuito é a versão básica da plataforma, com recursos limitados. Perfeito para quem está começando a utilizar a plataforma.",
      price: "0",
      period: "Gratuito",
      maxBusinesses: 1,
      maxImages: 1,
      showSocial: false,
    },
    {
      name: "Essencial",
      description:
        "O plano Essencial oferece recursos básicos para utilizar a plataforma sem custos adicionais. Ideal para usuários iniciantes ou para quem deseja uma solução simples e prática.",
      price: "39",
      period: "/mês",
      maxBusinesses: 1,
      maxImages: 6,
      showSocial: true,
    },
    {
      name: "Premium",
      description:
        "O plano Premium inclui funcionalidades avançadas, suporte prioritário e acesso a todos os recursos da plataforma. Ideal para quem busca mais eficiência e benefícios exclusivos.",
      price: "89",
      period: "/mês",
      maxBusinesses: "Ilimitado*",
      maxImages: 6,
      showSocial: true,
    },
  ];

  useEffect(() => {
    const fetchCurrentPlan = async () => {
      try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
          setError("Usuário não autenticado. Faça login para continuar.");
          return;
        }

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentPlan(userData.plano || ""); // Obtém o plano atual do usuário
          setBusinessCount(userData.businessCount || 0); // Obtém o número de negócios do usuário
        } else {
          setError("Erro ao carregar informações do usuário.");
        }
      } catch (err) {
        console.error("Erro ao buscar plano atual:", err);
        setError("Erro ao carregar informações do plano.");
      }
    };

    fetchCurrentPlan();
  }, []);

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

      setCurrentPlan(selectedPlan); // Atualiza o plano atual no estado
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
          <div
            key={index}
            className={`pack_card ${
              currentPlan === plan.name ? "active-plan" : ""
            }`} // Adiciona uma classe CSS para destacar o plano ativo
          >
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
              {currentPlan === plan.name ? (
                <button className="btn active-button" disabled>
                  Plano Ativo
                </button>
              ) : (
                <button
                  className="btn"
                  onClick={() => handleSelectPlan(plan.name)}
                >
                  Escolher {plan.name}
                </button>
              )}
            </div>
            <div className="features">
              <p>Negócios permitidos: {plan.maxBusinesses}</p>
              <p>Imagens permitidas: {plan.maxImages}</p>
              <p>Redes sociais exibidas: {plan.showSocial ? "Sim" : "Não"}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Nota em letras miúdas */}
      <div className="premium-note">
        <p>
          * O plano <strong>Premium</strong> aplica o valor mensal por cada CNPJ
          cadastrado. Consulte os Termos de Serviço para mais detalhes.
        </p>
      </div>

      <button onClick={() => navigate("/perfil")} className="back-button">
        Voltar ao Perfil
      </button>
    </div>
  );
};

export default PlansDetails;
