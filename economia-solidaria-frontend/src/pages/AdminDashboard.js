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
import axios from "axios"; // Importa axios para fazer requisições HTTP
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [businesses, setBusinesses] = useState([]); // Lista de negócios
  const [loading, setLoading] = useState(true); // Flag de carregamento
  const [selectedBusiness, setSelectedBusiness] = useState(null); // Negócio selecionado
  const [feedbackMessage, setFeedbackMessage] = useState(""); // Feedback para o usuário
  const [feedbackClass, setFeedbackClass] = useState(""); // Classe para o feedback (verde ou vermelho)
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false); // Controla a visibilidade do feedback
  const [isProcessing, setIsProcessing] = useState(null); // Indica qual botão está sendo processado
  const [selectedImage, setSelectedImage] = useState(null); // Imagem selecionada para exibição em grande

  // Função para formatar o CNPJ
  const formatCNPJ = (cnpj) => {
    // Remove qualquer caractere não numérico
    const cleanCNPJ = cnpj.replace(/[^\d]+/g, "");

    // Verifica se o CNPJ tem 14 caracteres (tamanho válido)
    if (cleanCNPJ.length === 14) {
      return cleanCNPJ.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
      );
    }

    return cnpj; // Retorna o CNPJ original caso não tenha 14 dígitos
  };

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
    setIsProcessing(businessId);
    try {
      const businessRef = doc(db, "negocios_pendentes", businessId);
      const businessSnapshot = await getDoc(businessRef);

      if (businessSnapshot.exists()) {
        const businessData = businessSnapshot.data();

        // Buscar o plano do usuário
        const userDoc = await getDoc(doc(db, "users", businessData.userId));
        const userPlan = userDoc.exists()
          ? userDoc.data().plano || "gratuito"
          : "gratuito";

        if (approved) {
          // Se aprovado, move para a coleção de lojas com status aprovado
          const newBusinessRef = doc(db, "lojas", businessId);
          await setDoc(newBusinessRef, {
            ...businessData,
            status: "aprovado",
            plano: userPlan,
            dataAprovacao: new Date().toISOString()
          });
          
          // Remove da coleção de pendentes após mover para lojas
          await deleteDoc(businessRef);
        } else {
          // Se negado, apenas atualiza o status e mantém em pendentes
          await setDoc(businessRef, {
            ...businessData,
            status: "negado",
            dataNegacao: new Date().toISOString()
          });
        }

        setFeedbackMessage(
          approved
            ? "Negócio aprovado com sucesso!"
            : "Negócio negado com sucesso!"
        );
        setFeedbackClass(approved ? "feedback-approve" : "feedback-deny");
        setIsFeedbackVisible(true);
        setBusinesses((prev) => prev.filter((b) => b.id !== businessId));
      } else {
        setFeedbackMessage("Negócio não encontrado!");
        setFeedbackClass("feedback-deny");
        setIsFeedbackVisible(true);
        console.error("Negócio não encontrado!");
      }
    } catch (err) {
      setFeedbackMessage("Erro ao atualizar negócio: " + err.message);
      setFeedbackClass("feedback-deny");
      setIsFeedbackVisible(true);
      console.error("Erro ao atualizar negócio:", err);
    } finally {
      setIsProcessing(null);
    }
  };

  // Função para verificar CNPJ
  const verifyCNPJ = async (cnpj, businessId) => {
    if (!cnpj) {
      console.error("CNPJ não informado");
      return;
    }

    const cleanCNPJ = cnpj.replace(/[^\d]+/g, "");
    if (cleanCNPJ.length !== 14) {
      console.error("CNPJ inválido");
      return;
    }

    try {
      setIsProcessing(businessId); // Indica que está processando
      const response = await axios.get(
        `http://127.0.0.1:8000/api/cnpj/${cleanCNPJ}`
      );
      console.log("Resposta da API:", response.data);

      // Atualiza o estado apenas para o negócio específico
      setBusinesses((prevBusinesses) =>
        prevBusinesses.map((business) =>
          business.id === businessId
            ? { ...business, cnpjInfo: response.data }
            : business
        )
      );
    } catch (error) {
      console.error("Erro ao verificar CNPJ:", error);
      // Limpa as informações do CNPJ em caso de erro
      setBusinesses((prevBusinesses) =>
        prevBusinesses.map((business) =>
          business.id === businessId
            ? { ...business, cnpjInfo: null }
            : business
        )
      );
    } finally {
      setIsProcessing(null); // Finaliza o processamento
    }
  };

  // Função para limpar informações do CNPJ
  const clearCnpjInfo = (businessId) => {
    setBusinesses((prevBusinesses) =>
      prevBusinesses.map((business) =>
        business.id === businessId ? { ...business, cnpjInfo: null } : business
      )
    );
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
          <div className="skeleton-grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-text skeleton-title"></div>
                <div className="skeleton-text skeleton-line"></div>
                <div className="skeleton-text skeleton-line"></div>
              </div>
            ))}
          </div>
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
                      {/* Nome do Negócio */}
                      <h3 className="business-name">{business.nome}</h3>

                      {/* CNPJ do Negócio */}
                      <p className="business-cnpj">
                        <strong>CNPJ:</strong>{" "}
                        {formatCNPJ(business.cnpj) || "Não informado"}
                      </p>

                      {/* Imagens do Negócio */}
                      <div className="business-images">
                        {business.imagens && business.imagens.length > 0 && (
                          <div className="image-thumbnails">
                            {business.imagens
                              .slice(0, 6)
                              .map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Imagem ${index + 1}`}
                                  className="image-thumbnail"
                                  onClick={() => setSelectedImage(image)}
                                />
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Botões de Aprovar/Negar */}
                      <div className="card-buttons">
                        <button onClick={() => setSelectedBusiness(business)}>
                          Ver Detalhes
                        </button>
                        <button
                          className="approve"
                          onClick={() => handleApproval(business.id, true)}
                          disabled={isProcessing === business.id}
                          style={{
                            backgroundColor:
                              isProcessing === business.id ? "#ddd" : "green",
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
                          disabled={isProcessing === business.id}
                          style={{
                            backgroundColor:
                              isProcessing === business.id ? "#ddd" : "red",
                            color: "white",
                          }}
                        >
                          {isProcessing === business.id
                            ? "Negando..."
                            : "Negar"}
                        </button>
                        {/* Botão de Verificar CNPJ */}
                        <button
                          className="verify-cnpj"
                          onClick={() => verifyCNPJ(business.cnpj, business.id)}
                          disabled={isProcessing === business.id}
                        >
                          {isProcessing === business.id
                            ? "Verificando..."
                            : "Verificar CNPJ"}
                        </button>

                        {/* Exibe as informações do CNPJ */}
                        {business.cnpjInfo && (
                          <div className="cnpj-info">
                            <div className="cnpj-header">
                              <h4>Informações do CNPJ</h4>
                              <button
                                className="close-button"
                                onClick={() => clearCnpjInfo(business.id)}
                                aria-label="Fechar informações"
                              >
                                ×
                              </button>
                            </div>
                            <div className="cnpj-details">
                              <p>
                                <strong>Razão Social:</strong>{" "}
                                {business.cnpjInfo.nome}
                              </p>
                              <p>
                                <strong>Nome Fantasia:</strong>{" "}
                                {business.cnpjInfo.fantasia}
                              </p>
                              <p>
                                <strong>Situação:</strong>{" "}
                                {business.cnpjInfo.situacao_cadastral}
                              </p>
                              <p>
                                <strong>Simples Nacional:</strong>{" "}
                                {business.cnpjInfo.opcao_pelo_simples
                                  ? "Sim"
                                  : "Não"}
                              </p>
                              <p>
                                <strong>MEI:</strong>{" "}
                                {business.cnpjInfo.opcao_pelo_mei
                                  ? "Sim"
                                  : "Não"}
                              </p>
                              <p>
                                <strong>Natureza Jurídica:</strong>{" "}
                                {business.cnpjInfo.natureza_juridica}
                              </p>
                              <p>
                                <strong>Porte:</strong>{" "}
                                {business.cnpjInfo.porte}
                              </p>
                              <p>
                                <strong>Capital Social:</strong> R${" "}
                                {business.cnpjInfo.capital_social?.toLocaleString(
                                  "pt-BR",
                                  { minimumFractionDigits: 2 }
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Exibindo a imagem grande */}
        {selectedImage && (
          <div
            className="image-overlay"
            onClick={() => setSelectedImage(null)} // Fecha ao clicar fora da imagem
          >
            <div
              className="image-modal"
              onClick={(e) => e.stopPropagation()} // Impede o fechamento ao clicar dentro da modal
            >
              <img
                src={selectedImage}
                alt="Imagem grande"
                className="modal-image"
              />
            </div>
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

              {/* Nome do Negócio */}
              <p>
                <strong>Nome:</strong> {selectedBusiness.nome}
              </p>

              {/* CNPJ do Negócio */}
              <p>
                <strong>CNPJ:</strong>{" "}
                {selectedBusiness.cnpj || "Não informado"}
              </p>

              {/* Outros detalhes */}
              <p>
                <strong>Descrição:</strong> {selectedBusiness.descricao}
              </p>
              <p>
                <strong>Categoria:</strong> {selectedBusiness.categoria}
              </p>
              <p>
                <strong>Endereço:</strong>{" "}
                {selectedBusiness.endereco
                  ? `${selectedBusiness.endereco.rua}, ${selectedBusiness.endereco.numero} - ${selectedBusiness.endereco.bairro}, ${selectedBusiness.endereco.cidade}/${selectedBusiness.endereco.estado}`
                  : "Não informado"}
              </p>
              <p>
                <strong>Telefone Fixo:</strong>{" "}
                {selectedBusiness.telefone || "Não informado"}
              </p>
              <p>
                <strong>Celular:</strong>{" "}
                {selectedBusiness.cellphone || "Não informado"}
              </p>
              <p>
                <strong>E-mail:</strong> {selectedBusiness.email}
              </p>

              {/* Horário de Funcionamento */}
              <div>
                <strong>Horário de Funcionamento:</strong>
                {selectedBusiness.horarioDeFuncionamento ? (
                  <div>
                    <p>
                      <strong>Segunda a Sexta:</strong>{" "}
                      {selectedBusiness.horarioDeFuncionamento.weekdays?.open ||
                        "Não disponível"}{" "}
                      -{" "}
                      {selectedBusiness.horarioDeFuncionamento.weekdays
                        ?.close || "Não disponível"}
                    </p>
                    <p>
                      <strong>Sábado:</strong>{" "}
                      {selectedBusiness.horarioDeFuncionamento.saturday?.closed
                        ? "Fechado"
                        : `${
                            selectedBusiness.horarioDeFuncionamento.saturday
                              ?.open || "Não disponível"
                          } - 
                           ${
                             selectedBusiness.horarioDeFuncionamento.saturday
                               ?.close || "Não disponível"
                           }`}
                    </p>
                    <p>
                      <strong>Domingo:</strong>{" "}
                      {selectedBusiness.horarioDeFuncionamento.sunday?.closed
                        ? "Fechado"
                        : `${
                            selectedBusiness.horarioDeFuncionamento.sunday
                              ?.open || "Não disponível"
                          } - 
                           ${
                             selectedBusiness.horarioDeFuncionamento.sunday
                               ?.close || "Não disponível"
                           }`}
                    </p>
                    {selectedBusiness.horarioDeFuncionamento.lunch?.enabled && (
                      <p>
                        <strong>Horário de Almoço:</strong>{" "}
                        {selectedBusiness.horarioDeFuncionamento.lunch.start ||
                          "Não disponível"}{" "}
                        -{" "}
                        {selectedBusiness.horarioDeFuncionamento.lunch.end ||
                          "Não disponível"}
                      </p>
                    )}
                  </div>
                ) : (
                  <p>Não informado</p>
                )}
              </div>

              {/* Botões de ação */}
              {/* Botão de Verificar CNPJ */}
              <button
                className="verify-cnpj"
                onClick={() =>
                  verifyCNPJ(selectedBusiness.cnpj, selectedBusiness.id)
                }
              >
                Verificar CNPJ
              </button>
              <button
                onClick={() => {
                  handleApproval(selectedBusiness.id, true);
                  setSelectedBusiness(null); // Fechar detalhes ao aprovar
                }}
                disabled={isProcessing === selectedBusiness.id} // Desabilita enquanto processando
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
                disabled={isProcessing === selectedBusiness.id} // Desabilita enquanto processando
                style={{
                  backgroundColor:
                    isProcessing === selectedBusiness.id ? "#ddd" : "red",
                  color: "white",
                }}
              >
                {isProcessing === selectedBusiness.id ? "Negando..." : "Negar"}
              </button>
              <button
                className="close"
                onClick={() => setSelectedBusiness(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
