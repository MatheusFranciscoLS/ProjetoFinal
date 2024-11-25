import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // Certifique-se de exportar auth e db do Firebase
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Firestore
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false); // Estado para controlar a exibição dos detalhes do plano
  const [selectedPlan, setSelectedPlan] = useState(""); // Para armazenar o plano selecionado
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
          navigate("/login"); // Redireciona para login se não autenticado
          return;
        }

        setUser(currentUser);

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          setError("Dados do usuário não encontrados.");
        }
      } catch (err) {
        console.error("Erro ao buscar dados do usuário:", err);
        setError("Erro ao carregar perfil.");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleUpgrade = async (newPlan) => {
    try {
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        plano: newPlan,
      });

      alert(`Seu plano foi atualizado para ${newPlan}.`);
      setUserData((prev) => ({ ...prev, plano: newPlan })); // Atualiza o estado local
      setSelectedPlan(""); // Reset the selected plan after upgrade
      setShowDetails(false); // Fecha o painel de detalhes após o upgrade
    } catch (err) {
      console.error("Erro ao atualizar plano:", err);
      setError("Erro ao atualizar plano.");
    }
  };

  const handleCancelPlan = async () => {
    try {
      if (!user) return;

      // Atualiza o plano para o padrão (gratuito)
      await updateDoc(doc(db, "users", user.uid), {
        plano: "gratuito",
      });

      alert("Seu plano foi cancelado e você foi movido para o plano gratuito.");
      setUserData((prev) => ({ ...prev, plano: "gratuito" }));
    } catch (err) {
      console.error("Erro ao cancelar plano:", err);
      setError("Erro ao cancelar plano.");
    }
  };

  const toggleDetails = (plan) => {
    setSelectedPlan(plan);
    setShowDetails(!showDetails); // Alterna a visibilidade dos detalhes do plano
  };

  if (!userData) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="profile-container">
      <h2 className="profile-title">Perfil do Usuário</h2>
      {error && <p className="error">{error}</p>}
      <div className="profile-info">
        <div className="profile-field">
          <strong>Nome:</strong> {userData.nome || user.email}
        </div>
        <div className="profile-field">
          <strong>Email:</strong> {user.email}
        </div>
        <div className="profile-field">
          <strong>Telefone:</strong> {userData.phone || "Não informado"}
        </div>
        <div className="profile-field">
          <strong>Endereço:</strong> {userData.address || "Não informado"}
        </div>
        <div className="profile-field">
          <strong>Plano Atual:</strong> {userData.plano}
        </div>
      </div>

      {/* Descrição dos planos */}
      <div className="plan-description">
        <h3 className="plan-title">Sobre os Planos</h3>
        <p><strong>Plano Essencial:</strong> Oferece acesso a recursos básicos, ideal para quem está começando a usar a plataforma.</p>
        <p><strong>Plano Premium:</strong> Oferece recursos avançados, como suporte prioritário, acesso a funcionalidades exclusivas e mais.</p>
      </div>

      {/* Botões para upgrade de plano */}
      {userData.plano !== "Premium" && (
        <div className="upgrade-container">
          <h3 className="upgrade-title">Faça o Upgrade do Plano</h3>
          {userData.plano === "gratuito" && (
            <button
              onClick={() => toggleDetails("Essencial")}
              className="upgrade-button"
            >
              Upgrade para Essencial
            </button>
          )}
          {userData.plano !== "Premium" && (
            <button
              onClick={() => toggleDetails("Premium")}
              className="upgrade-button"
            >
              Upgrade para Premium
            </button>
          )}
        </div>
      )}

      {/* Exibição dos detalhes do plano */}
      {showDetails && selectedPlan && (
        <div className="plan-details">
          <h4 className="plan-details-title">Detalhes do Plano {selectedPlan}</h4>
          {selectedPlan === "Essencial" && (
            <div>
              <p><strong>Plano Essencial:</strong></p>
              <ul>
                <li>Acesso a recursos básicos</li>
                <li>Sem custos adicionais</li>
                <li>Ideal para iniciantes</li>
              </ul>
            </div>
          )}
          {selectedPlan === "Premium" && (
            <div>
              <p><strong>Plano Premium:</strong></p>
              <ul>
                <li>Acesso a todos os recursos avançados</li>
                <li>Suporte prioritário</li>
                <li>Funcionalidades exclusivas</li>
                <li>Maior capacidade de personalização</li>
                <li>Suporte dedicado e recursos exclusivos</li>
              </ul>
            </div>
          )}
          <button onClick={() => handleUpgrade(selectedPlan)} className="upgrade-button">
            Confirmar Upgrade para {selectedPlan}
          </button>
        </div>
      )}

      {/* Exibir botão para cancelar plano */}
      {userData.plano !== "gratuito" && (
        <div className="cancel-container">
          <button onClick={handleCancelPlan} className="cancel-button">
            Cancelar Plano e Voltar para Gratuito
          </button>
        </div>
      )}

      {userData.plano === "Premium" && (
        <p className="premium-message">Você já está no plano Premium.</p>
      )}
    </div>
  );
};

export default Profile;
