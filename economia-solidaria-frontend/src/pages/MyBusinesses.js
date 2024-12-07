import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { FaEye } from "react-icons/fa";
import "../styles/myBusinesses.css";

const SkeletonCard = () => (
  <div className="business-card skeleton">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-title"></div>
      <div className="skeleton-text"></div>
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
    const fetchBusinesses = async () => {
      const user = auth.currentUser;
      
      if (!user) {
        setError("Você precisa estar logado para ver seus negócios");
        setLoading(false);
        return;
      }

      try {
        const businessesRef = collection(db, "lojas");
        const q = query(businessesRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        const businessesData = [];
        querySnapshot.forEach((doc) => {
          if (doc.exists()) {
            const data = doc.data();
            businessesData.push({
              id: doc.id,
              nome: data?.nome || "Nome não disponível",
              categoria: data?.categoria || "Categoria não definida",
              status: data?.status || "Pendente",
              imagens: data?.imagens || []
            });
          }
        });
        
        setBusinesses(businessesData);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar negócios:", err);
        setError("Erro ao carregar seus negócios");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserPlan = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserPlan(userData.plano);
        }
      }
    };

    fetchBusinesses();
    fetchUserPlan();
  }, [auth]);

  const isPremiumUser = userPlan === "Premium";

  const handleEdit = (businessId) => {
    navigate(`/edit-business/${businessId}`);
  };

  if (loading) {
    return (
      <div className="my-businesses-container">
        <h1>Meus Negócios</h1>
        <div className="businesses-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
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

  return (
    <div className="my-businesses-container">
      <div className="header-section">
        <h1>Meus Negócios</h1>
        {isPremiumUser && (
          <Link to="/register-business" className="add-business-button">
            Adicionar Novo Negócio
          </Link>
        )}
      </div>

      <div className="businesses-grid">
        {businesses.length === 0 ? (
          <div className="no-businesses">
            <p>Você ainda não cadastrou nenhum negócio.</p>
            <Link to="/register-business" className="register-link">
              Cadastre seu primeiro negócio
            </Link>
          </div>
        ) : (
          businesses.map((business) => (
            <div key={business.id} className="business-card">
              <div className="business-image">
                {business.imagens?.[0] && (
                  <img src={business.imagens[0]} alt={business.nome} />
                )}
              </div>
              <div className="business-content">
                <h3>{business.nome}</h3>
                <p className="business-category">{business.categoria}</p>
                <p className="business-status">
                  Status: <span className={`status-${business.status}`}>
                    {business.status}
                  </span>
                </p>
                <div className="business-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(business.id)}
                  >
                    Editar
                  </button>
                  <button
                    className="view-button"
                    onClick={() => navigate(`/loja/${business.id}`)}
                  >
                    <FaEye style={{ marginRight: '5px' }} /> Visualizar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cta-section">
        <h2>Junte-se a Nós!</h2>
        <p>Descubra como você pode contribuir para a economia solidária.</p>
        <Link to="/register-business">Comece Agora</Link>
      </div>
    </div>
  );
};

export default MyBusinesses;