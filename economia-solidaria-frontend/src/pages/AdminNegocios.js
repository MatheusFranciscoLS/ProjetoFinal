import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  deleteDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import "../styles/AdminNegocios.css";

const SkeletonCard = () => (
  <div className="business-card skeleton">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-title"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-actions">
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  </div>
);

const AdminNegocios = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("todos");
  const [sortOrder, setSortOrder] = useState("alfabetica");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();

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
    const confirm = window.confirm(
      "Tem certeza de que deseja deletar este negócio?"
    );
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "lojas", businessId));
      setBusinesses((prev) =>
        prev.filter((business) => business.id !== businessId)
      );
      alert("Negócio deletado com sucesso!");
    } catch (err) {
      console.error("Erro ao deletar negócio:", err);
      alert("Erro ao deletar negócio.");
    }
  };

  const handleEdit = (businessId) => {
    // Redireciona para a página de edição do negócio
    navigate(`/edit-business/${businessId}`);
  };

  const sortedAndFilteredBusinesses = () => {
    let filtered = businesses;

    if (filterCategory !== "todos") {
      filtered = filtered.filter(
        (business) => business.categoria === filterCategory
      );
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

  const totalPages = Math.ceil(
    sortedAndFilteredBusinesses().length / itemsPerPage
  );

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
              <SkeletonCard key={index} />
            ))
          : displayedBusinesses.map((business) => (
              <div key={business.id} className="business-card">
                <div className="card-header">
                  <h3>{business.nome || "Nome do negócio"}</h3>
                  <p className="category">
                    <strong>Categoria:</strong>{" "}
                    {business.categoria || "Sem categoria"}
                  </p>
                </div>
                <div className="card-body">

                </div>
                <div className="card-footer">
                  <button onClick={() => handleEdit(business.id)}>
                    Editar
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(business.id)}
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
        {displayedBusinesses.length === 0 && !loading && (
          <p>Nenhum negócio encontrado.</p>
        )}
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
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Próxima
        </button>
      </div>
    </div>
  );
};

export default AdminNegocios;
