import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { FiPlus, FiEdit2, FiTrash2, FiPackage } from "react-icons/fi";
import "../styles/AdminNegocios.css";

// Componente SkeletonCard para loading
const SkeletonCard = () => (
  <div className="business-card skeleton">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-title"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text" style={{ width: "40%" }}></div>
    </div>
  </div>
);

const AdminNegocios = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Você precisa estar logado para acessar esta página.");

        setUser(currentUser);

        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) throw new Error("Usuário não encontrado ou sem permissões.");

        const userData = userDocSnap.data();
        const adminRoles = ["admin", "administrador", "adm"];
        if (!adminRoles.includes(userData.role?.toLowerCase())) throw new Error("Acesso negado.");

        setIsAdmin(true);

        const businessesRef = collection(db, "lojas");
        const querySnapshot = await getDocs(businessesRef);

        const businessesData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          }))
          .sort((a, b) => b.createdAt - a.createdAt);

        setBusinesses(businessesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth]);

  const handleEdit = (businessId) => navigate(`/edit-business/${businessId}`);

  const handleDelete = async () => {
    try {
      if (businessToDelete) {
        await deleteDoc(doc(db, "lojas", businessToDelete));
        setBusinesses(businesses.filter((business) => business.id !== businessToDelete));
        setBusinessToDelete(null);
        setIsDeleting(false);
      }
    } catch (err) {
      console.error("Erro ao excluir:", err);
      setError("Erro ao excluir o negócio.");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h1>Carregando...</h1>
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Erro</h2>
        <p>{error}</p>
        <Link to="/" className="error-button">Voltar</Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta página.</p>
        <Link to="/" className="error-button">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="admin-negocios-container">
      <div className="header-section">
        <h1>Meus Negócios</h1>
        <button className="add-business-button" onClick={() => navigate("/add-business")}>
          <FiPlus /> Adicionar Negócio
        </button>
      </div>
      <div className="business-grid">
        {businesses.length === 0 ? (
          <div className="no-businesses">
            <p>Não há negócios cadastrados.</p>
          </div>
        ) : (
          businesses.map((business) => (
            <div key={business.id} className="business-card">
              <div className="business-image">
                {business.imagens?.[0] ? (
                  <img src={business.imagens[0]} alt={business.nome} />
                ) : (
                  <div className="placeholder-image">
                    <FiPackage size={40} />
                  </div>
                )}
              </div>
              <div className="business-content">
                <h3>{business.nome}</h3>
                <p>{business.categoria}</p>
                <button className="edit-button" onClick={() => handleEdit(business.id)}>
                  <FiEdit2 /> Editar
                </button>
                <button
                  className="delete-button"
                  onClick={() => {
                    setBusinessToDelete(business.id);
                    setIsDeleting(true);
                  }}
                >
                  <FiTrash2 /> Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {isDeleting && (
        <div className="modal">
          <h2>Confirmar Exclusão?</h2>
          <button onClick={handleDelete}>Sim</button>
          <button onClick={() => setIsDeleting(false)}>Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default AdminNegocios;
