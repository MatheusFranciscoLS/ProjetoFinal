// src/pages/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const AdminDashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      const querySnapshot = await getDocs(collection(db, "lojas"));
      const businessesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBusinesses(businessesList);
      setLoading(false);
    };
    fetchBusinesses();
  }, []);

  const handleApproval = async (businessId, status, message = "") => {
    const docRef = doc(db, "lojas", businessId);
    await updateDoc(docRef, {
      status,
      mensagemNegada: status === "negado" ? message : "",
    });
    alert(status === "aprovado" ? "Negócio aprovado!" : "Negócio negado!");
    setBusinesses(businesses.filter((business) => business.id !== businessId)); // Atualiza a lista
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="admin-dashboard">
      <h2>Aprovação de Negócios</h2>
      <div className="business-list">
        {businesses.filter((business) => business.status === "pendente").map((business) => (
          <div key={business.id} className="business-item">
            <p><strong>Nome:</strong> {business.nome}</p>
            <p><strong>Descrição:</strong> {business.descricao}</p>
            <p><strong>Categoria:</strong> {business.categoria}</p>
            <button onClick={() => handleApproval(business.id, "aprovado")}>Aprovar</button>
            <button onClick={() => {
              const message = prompt("Digite a mensagem de negação:");
              handleApproval(business.id, "negado", message);
            }}>Negar</button>
          </div>
        ))}
AdminDashboard       </div>
    </div>
  );
};

export default AdminDashboard;
