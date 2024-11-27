import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/AdminNegocios.css";

const AdminNegocios = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editBusiness, setEditBusiness] = useState(null);
  const [filterCategory, setFilterCategory] = useState("todos");
  const [sortOrder, setSortOrder] = useState("alfabetica");

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "lojas"));
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

    fetchBusinesses();
  }, []);

  const handleDelete = async (businessId) => {
    const confirm = window.confirm("Tem certeza de que deseja deletar este negócio?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "lojas", businessId));
      setBusinesses((prev) => prev.filter((business) => business.id !== businessId));
      alert("Negócio deletado com sucesso!");
    } catch (err) {
      console.error("Erro ao deletar negócio:", err);
      alert("Erro ao deletar negócio.");
    }
  };

  const handleSave = async (updatedBusiness) => {
    try {
      const businessRef = doc(db, "lojas", updatedBusiness.id);
      await setDoc(businessRef, updatedBusiness);
      setBusinesses((prev) =>
        prev.map((business) =>
          business.id === updatedBusiness.id ? updatedBusiness : business
        )
      );
      setEditBusiness(null);
      alert("Negócio atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar negócio:", err);
      alert("Erro ao atualizar negócio.");
    }
  };

  const sortedAndFilteredBusinesses = () => {
    let filtered = businesses;

    if (filterCategory !== "todos") {
      filtered = filtered.filter((business) => business.categoria === filterCategory);
    }

    return filtered.sort((a, b) => {
      if (sortOrder === "alfabetica") {
        return a.nome.localeCompare(b.nome);
      }
      return a.categoria.localeCompare(b.categoria);
    });
  };

  return (
    <div className="admin-gerenciamento">
      <h1>Administração de Negócios</h1>

      <div className="filter-sort">
        <label>
          Filtrar por Categoria:
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="restaurante">Restaurante</option>
            <option value="loja">Loja</option>
            <option value="servicos">Serviços</option>
            <option value="artesanato">Artesanato</option>
            <option value="beleza">Beleza e Estética</option>
            <option value="educacao">Educação e Cursos</option>
            <option value="saude">Saúde e Bem-estar</option>
            <option value="esportes">Esportes e Lazer</option>
            <option value="outro">Outro</option>
          </select>
        </label>

        <label>
          Ordenar por:
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="alfabetica">Ordem Alfabética</option>
            <option value="categoria">Categoria</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="business-list">
          {sortedAndFilteredBusinesses().map((business) => (
            <div key={business.id} className="business-card">
              {editBusiness?.id === business.id ? (
                <EditBusinessForm
                  business={business}
                  onCancel={() => setEditBusiness(null)}
                  onSave={handleSave}
                />
              ) : (
                <div className="business-details">
                  <h3>{business.nome}</h3>
                  <p><strong>Categoria:</strong> {business.categoria}</p>
                  <p><strong>Descrição:</strong> {business.descricao}</p>
                  <p><strong>Endereço:</strong> {business.endereco}</p>
                  <div className="business-actions">
                    <button onClick={() => setEditBusiness(business)}>Editar</button>
                    <button onClick={() => handleDelete(business.id)}>Deletar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {businesses.length === 0 && <p>Nenhum negócio encontrado.</p>}
        </div>
      )}
    </div>
  );
};

const EditBusinessForm = ({ business, onCancel, onSave }) => {
  const [formData, setFormData] = useState({ ...business });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <label>
        Nome:
        <input
          type="text"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
        />
      </label>
      <label>
        Categoria:
        <input
          type="text"
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
        />
      </label>
      <label>
        Descrição:
        <textarea
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
        />
      </label>
      <label>
        Endereço:
        <input
          type="text"
          name="endereco"
          value={formData.endereco}
          onChange={handleChange}
        />
      </label>
      <div className="edit-form-actions">
        <button type="submit">Salvar</button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default AdminNegocios;
