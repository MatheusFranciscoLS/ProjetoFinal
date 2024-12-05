import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import "../styles/EditBusiness.css";

const EditBusiness = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    descricao: "",
    categoria: "",
    endereco: "",
    telefone: "",
    email: "",
    status: ""
  });

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!auth.currentUser) {
        setError("Você precisa estar logado para editar um negócio");
        setLoading(false);
        return;
      }

      if (!id) {
        setError("ID do negócio não fornecido");
        setLoading(false);
        return;
      }

      try {
        if (!db) {
          throw new Error("Erro de conexão com o banco de dados");
        }

        const docRef = doc(db, "lojas", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("Negócio não encontrado");
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        if (!data) {
          setError("Dados do negócio não encontrados");
          setLoading(false);
          return;
        }

        // Verifica se o usuário atual é o dono do negócio
        if (data.userId !== auth.currentUser.uid) {
          setError("Você não tem permissão para editar este negócio");
          setLoading(false);
          return;
        }

        setFormData({
          nome: data?.nome || "",
          cnpj: data?.cnpj || "",
          descricao: data?.descricao || "",
          categoria: data?.categoria || "",
          endereco: data?.endereco || "",
          telefone: data?.telefone || "",
          email: data?.email || "",
          status: data?.status || "pendente"
        });

        setError(null);
      } catch (err) {
        console.error("Erro ao carregar negócio:", err);
        setError("Erro ao carregar dados do negócio. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id, auth.currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!db) {
        throw new Error("Erro de conexão com o banco de dados");
      }

      const docRef = doc(db, "lojas", id);
      await updateDoc(docRef, formData);
      
      navigate("/meus-negocios");
    } catch (err) {
      console.error("Erro ao atualizar negócio:", err);
      setError("Erro ao salvar alterações. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando dados do negócio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="back-button" onClick={() => navigate("/meus-negocios")}>
          Voltar para Meus Negócios
        </button>
      </div>
    );
  }

  return (
    <div className="edit-business">
      <h1>Editar Negócio</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nome">Nome do Negócio</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cnpj">CNPJ</label>
          <input
            type="text"
            id="cnpj"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="categoria">Categoria</label>
          <select
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required
          >
            <option value="">Selecione uma categoria</option>
            <option value="Restaurante">Restaurante</option>
            <option value="Loja">Loja</option>
            <option value="Serviços">Serviços</option>
            <option value="Artesanato">Artesanato</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="endereco">Endereço</label>
          <input
            type="text"
            id="endereco"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/meus-negocios")}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBusiness;