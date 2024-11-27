import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // Alterado para useNavigate
import "../styles/MyBusinesses.css";

// Componente para renderizar cada negócio
const BusinessItem = ({ business, onEdit }) => (
  <li className="business-item">
    <h3 className="business-name">{business.nome}</h3>
    <p className="business-status">
      Status: 
      {business.status === "pendente"
        ? "Aguardando aprovação"
        : business.status === "aprovado"
        ? "Aprovado"
        : "Negado"}
    </p>
    {/* Botão de editar */}
    <button className="edit-button" onClick={() => onEdit(business)}>Editar</button>
  </li>
);

// Componente Modal de Edição
const EditBusinessModal = ({ business, onClose, onSave }) => {
  const [businessName, setBusinessName] = useState(business.nome);
  const [businessCNPJ, setBusinessCNPJ] = useState(business.cnpj);
  const [businessDescription, setBusinessDescription] = useState(business.descricao);
  const [category, setCategory] = useState(business.categoria);
  const [address, setAddress] = useState(business.endereco);
  const [phone, setPhone] = useState(business.telefone);
  const [email, setEmail] = useState(business.email);
  const [workingHours, setWorkingHours] = useState(business.horarioDeFuncionamento);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const businessRef = doc(db, "lojas", business.id);
      await updateDoc(businessRef, {
        nome: businessName,
        cnpj: businessCNPJ,
        descricao: businessDescription,
        categoria: category,
        endereco: address,
        telefone: phone,
        email: email,
        horarioDeFuncionamento: workingHours,
      });
      onSave(); // Salva as mudanças e fecha o modal
    } catch (error) {
      console.error("Erro ao atualizar loja:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Loja</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Nome:
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </label>
          <label>
            CNPJ:
            <input
              type="text"
              value={businessCNPJ}
              onChange={(e) => setBusinessCNPJ(e.target.value)}
            />
          </label>
          <label>
            Descrição:
            <textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
            />
          </label>
          <label>
            Categoria:
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </label>
          <label>
            Endereço:
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
          <label>
            Telefone:
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label>
            E-mail:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Horário de Funcionamento:
            <input
              type="text"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
            />
          </label>
          <button type="submit">Salvar</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </form>
      </div>
    </div>
  );
};

const MyBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBusiness, setEditingBusiness] = useState(null); // Novo estado para controle do modal
  const navigate = useNavigate(); // Alterado para useNavigate

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, "lojas"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const userBusinesses = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBusinesses(userBusinesses);
      } catch (error) {
        console.error("Erro ao buscar negócios do usuário:", error);
        setError("Ocorreu um erro ao carregar seus negócios. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [user]);

  const handleEdit = (business) => {
    setEditingBusiness(business); // Abre o modal com os dados do negócio
  };

  const handleCloseModal = () => {
    setEditingBusiness(null); // Fecha o modal
  };

  const handleSaveChanges = () => {
    // Recarrega os dados dos negócios após salvar
    setEditingBusiness(null);
    fetchBusinesses(); // Atualiza a lista de negócios
  };

  if (loading) {
    return <p className="loading-text">Carregando seus negócios...</p>;
  }

  return (
    <div className="businesses-container">
      <h2>Meus Negócios</h2>
      {error ? (
        <p className="error-text">{error}</p>
      ) : (
        <div>
          {businesses.length === 0 ? (
            <p className="no-businesses-text">Você ainda não tem negócios cadastrados.</p>
          ) : (
            <ul className="business-list">
              {businesses.map((business) => (
                <BusinessItem
                  key={business.id}
                  business={business}
                  onEdit={handleEdit}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modal de Edição */}
      {editingBusiness && (
        <EditBusinessModal
          business={editingBusiness}
          onClose={handleCloseModal}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
};

export default MyBusinesses;
