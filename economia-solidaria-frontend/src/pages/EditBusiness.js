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

  const checkIfAdmin = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError("Você precisa estar logado para editar um negócio.");
      setLoading(false);
      return false;
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const adminRoles = ["admin", "administrador", "adm"];
        const isAdmin = adminRoles.includes(userData.role?.toLowerCase()) || adminRoles.includes(userData.tipo?.toLowerCase());
        return isAdmin;
      } else {
        setError("Usuário não encontrado ou sem permissões.");
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error("Erro ao verificar administrador:", err);
      setError("Erro ao verificar permissões. Por favor, tente novamente mais tarde.");
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    const fetchBusiness = async () => {
      const isAdmin = await checkIfAdmin();
      if (!isAdmin) {
        setError("Você não tem permissão para acessar esta página.");
        setLoading(false);
        return;
      }

      if (!id) {
        setError("ID do negócio não fornecido");
        setLoading(false);
        return;
      }

      try {
        const businessDocRef = doc(db, "lojas", id);
        const businessDocSnap = await getDoc(businessDocRef);

        if (businessDocSnap.exists()) {
          setFormData(businessDocSnap.data());
          setError(null);
        } else {
          setError("Negócio não encontrado.");
        }
      } catch (err) {
        console.error("Erro ao buscar dados do negócio:", err);
        setError("Erro ao carregar os dados do negócio. Por favor, tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [auth, id]);

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
      const businessDocRef = doc(db, "lojas", id);
      await updateDoc(businessDocRef, formData);
      
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
        <button className="back-button" onClick={() => navigate(-1)}>
          Voltar
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
            onClick={() => navigate(-1)} // Voltar para a página anterior
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
