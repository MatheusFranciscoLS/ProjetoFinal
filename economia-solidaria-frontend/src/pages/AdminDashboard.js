import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc, doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  useEffect(() => {
    const fetchPendingBusinesses = async () => {
      try {
        const q = query(collection(db, "negocios_pendentes"), where("status", "==", "pendente"));
        const querySnapshot = await getDocs(q);
        const businessesList = [];
        querySnapshot.forEach((doc) => {
          businessesList.push({ ...doc.data(), id: doc.id });
        });
        setBusinesses(businessesList);
      } catch (err) {
        console.error("Erro ao buscar negócios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBusinesses();
  }, []);

  const handleApproval = async (businessId, approved) => {
    try {
      const businessRef = doc(db, "negocios_pendentes", businessId);
      const businessSnapshot = await getDoc(businessRef);

      if (businessSnapshot.exists()) {
        const businessData = businessSnapshot.data();

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
          alert("Negócio aprovado e movido para 'lojas'.");  // Aviso de sucesso
        } else {
          alert("Negócio negado.");  // Aviso de recusa
        }

        setBusinesses(businesses.filter((business) => business.id !== businessId));
      } else {
        console.error("Negócio não encontrado!");
      }
    } catch (err) {
      console.error("Erro ao atualizar status do negócio:", err);
    }
  };

  return (
    <div className="page-container">  {/* Contêiner flexível */}
      <div className="admin-dashboard">
        <h2>Cadastro de Negócios Pendentes</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div>
            {businesses.length === 0 ? (
              <p>Nenhum negócio pendente para aprovação.</p>
            ) : (
              <div className="card-grid">
                {businesses.map((business) => (
                  <div
                    key={business.id}
                    className={`card ${selectedBusiness?.id === business.id ? "expanded" : ""}`}
                  >
                    <div className="card-content">
                      <h3 className="business-name">{business.nome}</h3>
                      <p className="business-status">
                        <strong>Status:</strong> {business.status}
                      </p>
                      <p className="business-description">{business.descricao}</p>
                      <div className="card-buttons">
                        <button onClick={() => setSelectedBusiness(business)}>Ver Detalhes</button>
                        <button
                          className="approve"
                          onClick={() => handleApproval(business.id, true)}
                          style={{ backgroundColor: "green", color: "white" }}
                        >
                          Aprovar
                        </button>
                        <button
                          className="deny"
                          onClick={() => handleApproval(business.id, false)}
                          style={{ backgroundColor: "red", color: "white" }}
                        >
                          Negar
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
          <div className="business-details-overlay" onClick={() => setSelectedBusiness(null)}>
            <div className="business-details" onClick={(e) => e.stopPropagation()}>
              <h2>Detalhes do Negócio</h2>
              <p><strong>Nome:</strong> {selectedBusiness.nome}</p>
              <p><strong>Descrição:</strong> {selectedBusiness.descricao}</p>
              <p><strong>Categoria:</strong> {selectedBusiness.categoria}</p>
              <p><strong>Endereço:</strong> {selectedBusiness.endereco}</p>
              <p><strong>Telefone:</strong> {selectedBusiness.telefone}</p>
              <p><strong>E-mail:</strong> {selectedBusiness.email}</p>
              <p><strong>Horários de Funcionamento:</strong> {selectedBusiness.horarioDeFuncionamento}</p>
              <button
                onClick={() => {
                  handleApproval(selectedBusiness.id, true);
                  setSelectedBusiness(null);  // Fechar detalhes ao aprovar
                }}
                style={{ backgroundColor: "green", color: "white" }}
              >
                Aprovar
              </button>
              <button
                onClick={() => {
                  handleApproval(selectedBusiness.id, false);
                  setSelectedBusiness(null);  // Fechar detalhes ao negar
                }}
                style={{ backgroundColor: "red", color: "white" }}
              >
                Negar
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
