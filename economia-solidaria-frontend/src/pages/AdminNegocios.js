import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/AdminNegocios.css";

const AdminNegocios = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("todos");
  const [sortOrder, setSortOrder] = useState("alfabetica");
  const [editBusiness, setEditBusiness] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 4x3 grid
  const [editSuccess, setEditSuccess] = useState(false); // Novo estado para controle de sucesso de edição

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
  }, [editSuccess]); // Adicionando editSuccess para refazer o fetch após edição

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
      setEditSuccess(true); // Marcar como sucesso após edição
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

  // Pagination Logic
  const displayedBusinesses = sortedAndFilteredBusinesses().slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedAndFilteredBusinesses().length / itemsPerPage);

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

      <div className="business-list">
        {loading
          ? Array.from({ length: itemsPerPage }).map((_, index) => (
              <div key={index} className="skeleton-card"></div>
            ))
          : displayedBusinesses.map((business) => (
              <div key={business.id} className="business-card">
                <h3>{business.nome || "Nome do negócio"}</h3>
                <p><strong>Categoria:</strong> {business.categoria || "Sem categoria"}</p>
                <div className="business-actions">
                  <button onClick={() => setEditBusiness(business)}>Editar</button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(business.id)}
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
        {displayedBusinesses.length === 0 && !loading && <p>Nenhum negócio encontrado.</p>}
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Próxima
        </button>
      </div>

      {editBusiness && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Aviso de sucesso de edição */}
            {editSuccess && <div className="edit-success-message">Negócio editado com sucesso!</div>}

            <EditBusinessForm
              business={editBusiness}
              onCancel={() => setEditBusiness(null)}
              onSave={handleSave}
            />
          </div>
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
          placeholder="Nome do negócio"
        />
      </label>
      <label>
        Categoria:
        <input
          type="text"
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          placeholder="Categoria"
        />
      </label>
      <label>
        Descrição:
        <textarea
          name="descricao"
          value={formData.descricao || ""}
          onChange={handleChange}
          placeholder="Descrição do negócio"
        ></textarea>
      </label>
      <label>
        Endereço:
        <input
          type="text"
          name="endereco"
          value={formData.endereco || ""}
          onChange={handleChange}
          placeholder="Endereço"
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
