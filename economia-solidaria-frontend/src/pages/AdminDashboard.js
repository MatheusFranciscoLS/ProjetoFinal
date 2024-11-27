import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [businesses, setBusinesses] = useState([]); // Lista de negócios
  const [loading, setLoading] = useState(true); // Flag de carregamento
  const [selectedBusiness, setSelectedBusiness] = useState(null); // Negócio selecionado
  const [feedbackMessage, setFeedbackMessage] = useState(""); // Feedback para o usuário
  const [feedbackClass, setFeedbackClass] = useState(""); // Classe para o feedback (verde ou vermelho)
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false); // Controla a visibilidade do feedback
  const [isProcessing, setIsProcessing] = useState(null); // Indica qual botão está sendo processado

  useEffect(() => {
    const fetchPendingBusinesses = async () => {
      try {
        setFeedbackMessage(""); // Limpa feedback anterior
        setIsFeedbackVisible(false); // Oculta o feedback
        const q = query(
          collection(db, "negocios_pendentes"),
          where("status", "==", "pendente")
        );
        const querySnapshot = await getDocs(q);

        const businessesList = [];
        querySnapshot.forEach((doc) => {
          businessesList.push({ ...doc.data(), id: doc.id });
        });

        setBusinesses(businessesList);
      } catch (err) {
        setFeedbackMessage("Erro ao buscar negócios: " + err.message);
        setFeedbackClass("feedback-deny"); // Classe para erro (vermelho)
        setIsFeedbackVisible(true);
        console.error("Erro ao buscar negócios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBusinesses();
  }, []);

  // Função para aprovar ou negar um negócio
  const handleApproval = async (businessId, approved) => {
    setIsProcessing(businessId); // Marca o botão como "em processamento"
    try {
      const businessRef = doc(db, "negocios_pendentes", businessId);
      const businessSnapshot = await getDoc(businessRef);

      if (businessSnapshot.exists()) {
        const businessData = businessSnapshot.data();

        // Atualiza o status do negócio
        await setDoc(businessRef, {
          ...businessData,
          status: approved ? "aprovado" : "negado",
        });

        if (approved) {
          const newBusinessRef = doc(db, "lojas", businessId);
          await setDoc(newBusinessRef, {
            ...businessData,
            status: "aprovado",
          });
          await deleteDoc(businessRef);
          setFeedbackMessage("Negócio aprovado e movido para 'lojas'.");
          setFeedbackClass("feedback-approve"); // Classe para aprovação (verde)
        } else {
          setFeedbackMessage("Negócio negado.");
          setFeedbackClass("feedback-deny"); // Classe para negação (vermelho)
        }

        setIsFeedbackVisible(true); // Exibe o feedback
        setBusinesses(
          businesses.filter((business) => business.id !== businessId)
        );
      } else {
        setFeedbackMessage("Negócio não encontrado!");
        setFeedbackClass("feedback-deny"); // Classe para erro (vermelho)
        setIsFeedbackVisible(true);
        console.error("Negócio não encontrado!");
      }
    } catch (err) {
      setFeedbackMessage("Erro ao atualizar status do negócio: " + err.message);
      setFeedbackClass("feedback-deny"); // Classe para erro (vermelho)
      setIsFeedbackVisible(true);
      console.error("Erro ao atualizar status do negócio:", err);
    } finally {
      setIsProcessing(null); // Finaliza o processamento
    }
  };

  return (
    <div className="page-container">
      <div className="admin-dashboard">
        <h2>Cadastro de Negócios Pendentes</h2>

        {/* Feedback visível */}
        {isFeedbackVisible && (
          <div className={`feedback-message ${feedbackClass}`}>
            {feedbackMessage}
          </div>
        )}

        {loading ? (
          <p>Carregando...</p> // Exibe a mensagem de carregamento
        ) : (
          <div>
            {businesses.length === 0 ? (
              <p>Nenhum negócio pendente para aprovação.</p>
            ) : (
              <div className="card-grid">
                {businesses.map((business) => (
                  <div
                    key={business.id}
                    className={`card ${
                      selectedBusiness?.id === business.id ? "expanded" : ""
                    }`}
                  >
                    <div className="card-content">
                      <h3 className="business-name">{business.nome}</h3>
                      <p className="business-status">
                        <strong>Status:</strong> {business.status}
                      </p>
                      <p className="business-description">
                        {business.descricao}
                      </p>
                      <div className="card-buttons">
                        <button onClick={() => setSelectedBusiness(business)}>
                          Ver Detalhes
                        </button>
                        <button
                          className="approve"
                          onClick={() => handleApproval(business.id, true)}
                          disabled={isProcessing === business.id} // Desabilita o botão enquanto processando
                          style={{
                            backgroundColor:
                              isProcessing === business.id ? "#ddd" : "green", // Cor do botão enquanto processando
                            color: "white",
                          }}
                        >
                          {isProcessing === business.id
                            ? "Aprovando..."
                            : "Aprovar"}
                        </button>
                        <button
                          className="deny"
                          onClick={() => handleApproval(business.id, false)}
                          disabled={isProcessing === business.id} // Desabilita o botão enquanto processando
                          style={{
                            backgroundColor:
                              isProcessing === business.id ? "#ddd" : "red", // Cor do botão enquanto processando
                            color: "white",
                          }}
                        >
                          {isProcessing === business.id
                            ? "Negando..."
                            : "Negar"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedBusiness && (
          <div
            className="business-details-overlay"
            onClick={() => setSelectedBusiness(null)}
          >
            <div
              className="business-details"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Detalhes do Negócio</h2>
              <p>
                <strong>Nome:</strong> {selectedBusiness.nome}
              </p>
              <p>
                <strong>Descrição:</strong> {selectedBusiness.descricao}
              </p>
              <p>
                <strong>Categoria:</strong> {selectedBusiness.categoria}
              </p>
              <p>
                <strong>Endereço:</strong> {selectedBusiness.endereco}
              </p>
              <p>
                <strong>Telefone:</strong> {selectedBusiness.telefone}
              </p>
              <p>
                <strong>E-mail:</strong> {selectedBusiness.email}
              </p>
              <p>
                <strong>Horários de Funcionamento:</strong>{" "}
                {selectedBusiness.horarioDeFuncionamento}
              </p>
              <button
                onClick={() => {
                  handleApproval(selectedBusiness.id, true);
                  setSelectedBusiness(null); // Fechar detalhes ao aprovar
                }}
                disabled={isProcessing === selectedBusiness.id} // Desabilita o botão enquanto processando
                style={{
                  backgroundColor:
                    isProcessing === selectedBusiness.id ? "#ddd" : "green",
                  color: "white",
                }}
              >
                {isProcessing === selectedBusiness.id
                  ? "Aprovando..."
                  : "Aprovar"}
              </button>
              <button
                onClick={() => {
                  handleApproval(selectedBusiness.id, false);
                  setSelectedBusiness(null); // Fechar detalhes ao negar
                }}
                disabled={isProcessing === selectedBusiness.id} // Desabilita o botão enquanto processando
                style={{
                  backgroundColor:
                    isProcessing === selectedBusiness.id ? "#ddd" : "red",
                  color: "white",
                }}
              >
                {isProcessing === selectedBusiness.id ? "Negando..." : "Negar"}
              </button>
              <button onClick={() => setSelectedBusiness(null)}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
