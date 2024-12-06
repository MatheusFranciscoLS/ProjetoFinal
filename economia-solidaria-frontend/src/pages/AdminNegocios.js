import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import "../styles/AdminNegocios.css";

const AdminNegocios = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    fetchBusinesses();
  }, [auth]);

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

  const handleEdit = (business) => {
    setEditingBusiness(business);
    setShowModal(true);
  };

  const handleDelete = async (businessId) => {
    if (window.confirm("Tem certeza que deseja excluir este negócio?")) {
      try {
        const businessRef = doc(db, "lojas", businessId);
        await deleteDoc(businessRef);
        setBusinesses(businesses.filter(b => b.id !== businessId));
      } catch (error) {
        console.error("Erro ao excluir negócio:", error);
        alert("Erro ao excluir o negócio. Por favor, tente novamente.");
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const businessRef = doc(db, "lojas", editingBusiness.id);
      await updateDoc(businessRef, {
        nome: editingBusiness.nome,
        status: editingBusiness.status,
        cnpj: editingBusiness.cnpj,
        endereco: editingBusiness.endereco,
        telefone: editingBusiness.telefone,
        email: editingBusiness.email
      });

      setBusinesses(businesses.map(b => 
        b.id === editingBusiness.id ? editingBusiness : b
      ));
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao atualizar negócio:", error);
      alert("Erro ao atualizar o negócio. Por favor, tente novamente.");
    }
  };

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
    <div className="admin-gerenciamento">
      <div className="container">
        <h1>Gerenciamento de Negócios</h1>
        
        {businesses.length === 0 ? (
          <p className="no-businesses">Nenhum negócio encontrado.</p>
        ) : (
          <div className="business-list">
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
                <div className="business-actions">
                  <button 
                    className="edit"
                    onClick={() => handleEdit(business)}
                  >
                    Editar
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDelete(business.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Negócio</h2>
            <form className="edit-form" onSubmit={handleUpdate}>
              <label>
                Nome:
                <input
                  type="text"
                  value={editingBusiness.nome}
                  onChange={(e) => setEditingBusiness({
                    ...editingBusiness,
                    nome: e.target.value
                  })}
                />
              </label>
              <label>
                Status:
                <input
                  type="text"
                  value={editingBusiness.status}
                  onChange={(e) => setEditingBusiness({
                    ...editingBusiness,
                    status: e.target.value
                  })}
                />
              </label>
              <label>
                CNPJ:
                <input
                  type="text"
                  value={editingBusiness.cnpj}
                  onChange={(e) => setEditingBusiness({
                    ...editingBusiness,
                    cnpj: e.target.value
                  })}
                />
              </label>
              <label>
                Endereço:
                <input
                  type="text"
                  value={editingBusiness.endereco}
                  onChange={(e) => setEditingBusiness({
                    ...editingBusiness,
                    endereco: e.target.value
                  })}
                />
              </label>
              <label>
                Telefone:
                <input
                  type="text"
                  value={editingBusiness.telefone}
                  onChange={(e) => setEditingBusiness({
                    ...editingBusiness,
                    telefone: e.target.value
                  })}
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  value={editingBusiness.email}
                  onChange={(e) => setEditingBusiness({
                    ...editingBusiness,
                    email: e.target.value
                  })}
                />
              </label>
              <div className="edit-form-actions">
                <button type="submit">Salvar</button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNegocios;
