import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // Certifique-se de importar o Firebase corretamente

const EditBusinessModal = ({ businessId, businessData, onClose }) => {
  const [businessName, setBusinessName] = useState(businessData.nome || "");
  const [businessCNPJ, setBusinessCNPJ] = useState(businessData.cnpj || "");
  const [businessDescription, setBusinessDescription] = useState(businessData.descricao || "");
  const [category, setCategory] = useState(businessData.categoria || "");
  const [address, setAddress] = useState(businessData.endereco || "");
  const [phone, setPhone] = useState(businessData.telefone || "");
  const [email, setEmail] = useState(businessData.email || "");
  const [workingHours, setWorkingHours] = useState(businessData.horarioDeFuncionamento || "");

  // Função para lidar com o envio do formulário e atualizar os dados
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
      onClose(); // Fecha o modal após a atualização
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
          <label>
            Nome:
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </label>
          <label>
            CNPJ:
            <input
              type="text"
              value={businessCNPJ}
              onChange={(e) => setBusinessCNPJ(e.target.value)}
              required
            />
          </label>
          <label>
            Descrição:
            <textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              required
            />
          </label>
          <label>
            Categoria:
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </label>
          <label>
            Endereço:
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </label>
          <label>
            Telefone:
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>
          <label>
            E-mail:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Horário de Funcionamento:
            <input
              type="text"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              required
            />
          </label>
          <button type="submit">Atualizar</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </form>
      </div>
    </div>
  );
};

export default EditBusinessModal;
