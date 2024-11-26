import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // Certifique-se de exportar auth e db do Firebase
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Firestore
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
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

      {/* Todos os planos disponíveis lado a lado */}
      <div className="all-plans">
        <h3 className="plans-title">Todos os Planos Disponíveis</h3>
        <div className="plan-options">
          {/* Exibe o botão de upgrade para o plano Essencial apenas se o usuário não tiver o plano Essencial */}
          {userData.plano !== "Essencial" && (
            <div className="plan-option">
              <h4>Plano Essencial</h4>
              <button
                onClick={() => handleUpgrade("Essencial")}
                className="upgrade-button"
              >
                Fazer Upgrade
              </button>
            </div>
          )}
          {/* Exibe o botão de upgrade para o plano Premium apenas se o usuário não tiver o plano Premium ou Essencial */}
          {userData.plano !== "Premium" && userData.plano !== "Essencial" && (
            <div className="plan-option">
              <h4>Plano Premium</h4>
              <button
                onClick={() => handleUpgrade("Premium")}
                className="upgrade-button"
              >
                Fazer Upgrade
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Se o usuário estiver no plano Essencial, mostra apenas o upgrade para Premium */}
      {userData.plano === "Essencial" && (
        <div className="upgrade-container">
          <button
            onClick={() => handleUpgrade("Premium")}
            className="upgrade-button"
          >
            Upgrade para Premium
          </button>
        </div>
      )}

      {/* Mostrar botão para cancelar plano apenas se o usuário não estiver no plano gratuito */}
      {userData.plano !== "gratuito" && (
        <div className="cancel-container">
          <button onClick={handleCancelPlan} className="cancel-button">
            Cancelar Plano e Voltar para Gratuito
          </button>
        </div>
      )}

      {/* Exibe uma mensagem se o usuário já estiver no plano Premium */}
      {userData.plano === "Premium" && (
        <p className="premium-message">Você já está no plano Premium.</p>
      )}
    </div>
  );
};

export default Profile;
