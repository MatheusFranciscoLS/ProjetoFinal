import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { FiPlus, FiEdit2, FiEye, FiPackage, FiTag, FiCheck, FiClock, FiX } from "react-icons/fi";
import "../styles/myBusinesses.css";

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

const MyBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      
      if (!user) {
        setError("Você precisa estar logado para ver seus negócios");
        setLoading(false);
        return;
      }

      try {
        // Fetch user plan
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserPlan(userData.plano);
        }

        // Fetch businesses
        const businessesRef = collection(db, "lojas");
        const q = query(businessesRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
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
        setError("Erro ao carregar seus negócios. Por favor, tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth]);

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

  if (loading) {
    return (
      <div className="my-businesses-container">
        <div className="header-section">
          <h1>Meus Negócios</h1>
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
        <h1>Meus Negócios</h1>
        {isPremiumUser && (
          <Link to="/register-business" className="add-business-button">
            <FiPlus /> Adicionar Novo Negócio
          </Link>
        )}
      </div>

      <div className="businesses-grid">
        {businesses.length === 0 ? (
          <div className="no-businesses">
            <p>Você ainda não cadastrou nenhum negócio.</p>
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
                  <Link to={`/loja/${business.id}`} className="view-button">
                    <FiEye /> Visualizar
                  </Link>
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
          <Link to="/plans-details">Conhecer Planos</Link>
        </div>
      )}
    </div>
  );
};

export default MyBusinesses;
