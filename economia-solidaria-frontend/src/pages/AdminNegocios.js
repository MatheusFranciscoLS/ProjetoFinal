import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import "../styles/AdminNegocios.css";

const AdminNegocios = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!auth.currentUser) {
        setError("Você precisa estar logado como administrador para acessar esta página");
        setLoading(false);
        return;
      }

      try {
        if (!db) {
          throw new Error("Erro de conexão com o banco de dados");
        }

        const businessesRef = collection(db, "lojas");
        const querySnapshot = await getDocs(businessesRef);
        const businessesList = [];

        querySnapshot.forEach((doc) => {
          try {
            if (!doc.exists()) return;

            const data = doc.data();
            if (!data) return;

            businessesList.push({
              id: doc.id,
              nome: data?.nome || "Nome não disponível",
              status: data?.status || "Status não definido",
              cnpj: data?.cnpj || "CNPJ não informado",
              endereco: data?.endereco || "Endereço não informado",
              telefone: data?.telefone || "Telefone não informado",
              email: data?.email || "Email não informado",
              dataCriacao: data?.dataCriacao?.toDate()?.toLocaleDateString() || "Data não disponível"
            });
          } catch (docError) {
            console.error("Erro ao processar documento:", docError);
          }
        });

        setBusinesses(businessesList);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar negócios:", err);
        setError("Erro ao carregar os dados. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [auth]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando dados dos negócios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="admin-negocios">
      <h1>Gerenciamento de Negócios</h1>
      
      {businesses.length === 0 ? (
        <p className="no-businesses">Nenhum negócio encontrado.</p>
      ) : (
        <div className="businesses-grid">
          {businesses.map((business) => (
            <div key={business.id} className="business-card">
              <h3>{business.nome}</h3>
              <div className="business-info">
                <p><strong>Status:</strong> {business.status}</p>
                <p><strong>CNPJ:</strong> {business.cnpj}</p>
                <p><strong>Endereço:</strong> {business.endereco}</p>
                <p><strong>Telefone:</strong> {business.telefone}</p>
                <p><strong>Email:</strong> {business.email}</p>
                <p><strong>Data de Criação:</strong> {business.dataCriacao}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNegocios;
