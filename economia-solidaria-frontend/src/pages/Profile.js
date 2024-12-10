import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // Certifique-se de exportar auth e db do Firebase
import { doc, getDoc } from "firebase/firestore"; // Firestore
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Carrega dados do usuário
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

  // Função para formatar o número de telefone
  const formatPhone = (phone) => {
    if (!phone) return "Não informado";
    const cleanPhone = phone.replace(/[^\d]+/g, "");
    if (cleanPhone.length === 10) {
      // Formato fixo: (XX) XXXX-XXXX
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else if (cleanPhone.length === 11) {
      // Formato móvel: (XX) XXXXX-XXXX
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return phone; // Retorna o número sem formatação se for inválido
  };

  if (!userData) {
    return (
      <div className="profile-container">
        <div className="skeleton-profile">
          <div className="skeleton-header"></div>
          <div className="skeleton-item"></div>
          <div className="skeleton-item"></div>
          <div className="skeleton-item"></div>
          <div className="skeleton-item"></div>
          <div className="skeleton-item"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2 className="profile-title">Perfil do Usuário</h2>
      {error && <p className="error">{error}</p>}
      <div className="profile-info">
        <div className="profile-field">
          <strong>Nome:</strong> {userData.name || user.name}
        </div>
        <div className="profile-field">
          <strong>Email:</strong> {user.email}
        </div>
        <div className="profile-field">
          <strong>Telefone:</strong> {formatPhone(userData.phone)}
        </div>
        <div className="profile-field">
          <strong>Endereço:</strong> {userData.address || "Não informado"}
        </div>
        <div className="profile-field">
          <strong>Plano Atual:</strong> {userData.plano || "Não especificado"}
        </div>
      </div>

      <div className="plans-info-link">
        <button
          onClick={() => navigate("/plans-details")}
          className="info-button"
        >
          Saiba Mais sobre os Planos
        </button>
      </div>
    </div>
  );
};

export default Profile;
