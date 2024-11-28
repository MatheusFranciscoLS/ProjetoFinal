import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // Certifique-se de importar o Firebase corretamente
import "../styles/EditBusiness.css";
const EditBusinessModal = ({ businessId, businessData, onClose }) => {
  const [businessName, setBusinessName] = useState(businessData.nome || "");
  const [businessCNPJ, setBusinessCNPJ] = useState(businessData.cnpj || "");
  const [businessDescription, setBusinessDescription] = useState(businessData.descricao || "");
  const [category, setCategory] = useState(businessData.categoria || "");
  const [address, setAddress] = useState(businessData.endereco || "");
  const [phone, setPhone] = useState(businessData.telefone || "");
  const [email, setEmail] = useState(businessData.email || "");
  const [workingHours, setWorkingHours] = useState(businessData.horarioDeFuncionamento || "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newBusinessRef = doc(db, "lojas", businessId);

    try {
      await updateDoc(newBusinessRef, {
        nome: businessName,
        cnpj: businessCNPJ,
        descricao: businessDescription,
        categoria: category,
        endereco: address,
        telefone: phone,
        email: email,
        horarioDeFuncionamento: workingHours,
      });
      alert("Loja atualizada com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar loja: ", error);
      alert("Ocorreu um erro ao atualizar a loja.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Loja</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nome:</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>CNPJ:</label>
            <input
              type="text"
              value={businessCNPJ}
              onChange={(e) => setBusinessCNPJ(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Descrição:</label>
            <textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Categoria:</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Endereço:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Telefone:</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>E-mail:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Horário de Funcionamento:</label>
            <input
              type="text"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              required
            />
          </div>
          <div className="buttons">
            <button type="submit" className="btn primary">Atualizar</button>
            <button type="button" onClick={onClose} className="btn secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBusinessModal;
