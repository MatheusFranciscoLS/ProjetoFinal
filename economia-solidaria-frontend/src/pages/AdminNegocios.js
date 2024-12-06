import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FiPlus, FiEdit2, FiX, FiPackage, FiTag, FiCheck, FiClock } from "react-icons/fi";
import "../styles/AdminNegocios.css";

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
  const [userPlan, setUserPlan] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all businesses (without filtering by userId)
        const businessesRef = collection(db, "lojas");
        const querySnapshot = await getDocs(businessesRef);

        const businessesData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            nome: doc.data()?.nome || "Nome não disponível",
            categoria: doc.data()?.categoria || "Categoria não definida",
            status: doc.data()?.status || "Pendente",
            imagens: doc.data()?.imagens || []
          }))
          .sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());

        setBusinesses(businessesData);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("Erro ao carregar os negócios. Por favor, tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'aprovado':
        return <FiCheck className="status-icon" />;
      case 'pendente':
        return <FiClock className="status-icon" />;
      case 'negado':
        return <FiX className="status-icon" />;
      default:
        return null;
    }
  };

  const handleEdit = (businessId) => {
    navigate(`/edit-business/${businessId}`);
  };

  const handleDelete = async (businessId) => {
    try {
      await deleteDoc(doc(db, "lojas", businessId));
      setBusinesses(businesses.filter(business => business.id !== businessId)); // Remove o negócio da lista localmente
    } catch (err) {
      setError("Erro ao excluir o negócio. Por favor, tente novamente.");
      console.error("Erro ao excluir o negócio:", err);
    }
  };

  if (loading) {
    return (
      <div className="my-businesses-container">
        <div className="header-section">
          <h1>Todas as Lojas</h1>
        </div>
        <div className="businesses-grid">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-businesses-container">
        <div className="error-message">
          <h2>Erro</h2>
          <p>{error}</p>
          <Link to="/" className="error-button">Voltar para Home</Link>
        </div>
      </div>
    );
  }

  const isPremiumUser = userPlan === "Premium";

  return (
    <div className="my-businesses-container">
      <div className="header-section">
        <h1>Todas as Lojas</h1>
        {isPremiumUser && (
          <Link to="/register-business" className="add-business-button">
            <FiPlus /> Adicionar Novo Negócio
          </Link>
        )}
      </div>

      <div className="businesses-grid">
        {businesses.length === 0 ? (
          <div className="no-businesses">
            <p>Não há negócios cadastrados.</p>
            <Link to="/register-business" className="register-link">
              <FiPlus /> Cadastre seu primeiro negócio
            </Link>
          </div>
        ) : (
          businesses.map((business) => (
            <div key={business.id} className="business-card">
              <div className="business-image">
                {business.imagens?.[0] ? (
                  <img 
                    src={business.imagens[0]} 
                    alt={business.nome}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-business.png";
                    }}
                  />
                ) : (
                  <div className="placeholder-image">
                    <FiPackage size={40} />
                  </div>
                )}
              </div>
              <div className="business-content">
                <h3>{business.nome}</h3>
                <p className="business-category">
                  <FiTag />
                  {business.categoria}
                </p>
                <p className="business-status">
                  Status: 
                  <span className={`status-${business.status.toLowerCase()}`}>
                    {getStatusIcon(business.status)}
                    {business.status}
                  </span>
                </p>
                <div className="business-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(business.id)}
                  >
                    <FiEdit2 /> Editar
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(business.id)}
                  >
                    <FiX /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!isPremiumUser && businesses.length > 0 && (
        <div className="cta-section">
          <h2>Expanda seus Negócios!</h2>
          <p>Atualize para o plano Premium e cadastre mais negócios na plataforma.</p>
          <Link to="/planos">Conhecer Planos</Link>
        </div>
      )}
    </div>
  );
};

export default AdminNegocios;
