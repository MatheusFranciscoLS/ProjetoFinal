import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { FiPlus, FiEdit2, FiX, FiPackage, FiTag, FiCheck, FiClock, FiTrash2 } from "react-icons/fi";
import "../styles/AdminNegocios.css";

// Componente do Skeleton
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
  const [isDeleting, setIsDeleting] = useState(false); // Controla a visibilidade do modal de exclusão
  const [businessToDelete, setBusinessToDelete] = useState(null); // Armazena o id do negócio a ser excluído
  const [showingCnpj, setShowingCnpj] = useState({});
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("Você precisa estar logado para ver os negócios.");
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          setError("Usuário não encontrado ou sem permissões.");
          setLoading(false);
          return;
        }

        const userData = userDocSnap.data();
        console.log('Dados do usuário:', userData); // Verifique os dados retornados

        const adminRoles = ["admin", "administrador", "adm"];
        if (adminRoles.includes(userData.role?.toLowerCase()) || adminRoles.includes(userData.tipo?.toLowerCase())) {
          setIsAdmin(true);
        } else {
          setError("Você não tem permissão para acessar esta página.");
          setLoading(false);
          return;
        }

        const businessesRef = collection(db, "lojas");
        const querySnapshot = await getDocs(businessesRef);

        if (querySnapshot.empty) {
          setError("Nenhum negócio encontrado.");
        }

        const businessesData = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            const createdAt = data?.createdAt;

            const createdAtDate = createdAt && createdAt.toDate ? createdAt.toDate() : new Date();

            return {
              id: doc.id,
              ...data,
              nome: data?.nome || "Nome não disponível",
              categoria: data?.categoria || "Categoria não definida",
              status: data?.status || "Pendente",
              imagens: data?.imagens || [],
              createdAt: createdAtDate
            };
          })
          .sort((a, b) => b.createdAt - a.createdAt);

        setBusinesses(businessesData);
        setError(null);

      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError(`Erro ao carregar os negócios. Detalhes: ${err.message || err}`);
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

  const handleDelete = async () => {
    try {
      if (businessToDelete) {
        await deleteDoc(doc(db, "lojas", businessToDelete));
        setBusinesses(businesses.filter(business => business.id !== businessToDelete)); // Remove o negócio da lista
        setBusinessToDelete(null); // Reseta a variável após exclusão
        setIsDeleting(false); // Fecha o modal
      }
    } catch (err) {
      setError("Erro ao excluir o negócio. Por favor, tente novamente.");
      console.error("Erro ao excluir o negócio:", err);
    }
  };

  const handleConfirmDelete = (businessId) => {
    setBusinessToDelete(businessId);
    setIsDeleting(true);
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
    setBusinessToDelete(null);
  };

  const handleVerifyCnpj = (businessId) => {
    setShowingCnpj(prev => ({
      ...prev,
      [businessId]: !prev[businessId]
    }));
  };

  const handleStatusChange = (businessId, status) => {
    // Implementação para alterar o status do negócio
  };

  if (loading) {
    return (
      <div className="my-businesses-container">
        <div className="header-section">
          <h1>Gerenciamento de Negócios</h1>
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

  if (!isAdmin) {
    return (
      <div className="my-businesses-container">
        <div className="error-message">
          <h2>Acesso Negado</h2>
          <p>Você não tem permissão para acessar esta página.</p>
          <Link to="/" className="error-button">Voltar para Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-businesses-container">
      <div className="header-section">
        <h1>Gerenciamento de Negócios</h1>
      </div>

      <div className="businesses-grid">
        {businesses.length === 0 ? (
          <div className="no-businesses">
            <p>Não há negócios cadastrados.</p>
          </div>
        ) : (
          businesses.map((business) => (
            <div key={business.id} className={`business-card ${showingCnpj[business.id] ? 'showing-cnpj' : ''}`}>
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
                <div className="button-container">
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(business.id)}
                  >
                    <FiEdit2 /> Editar
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleConfirmDelete(business.id)}
                  >
                    <FiTrash2 /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmação */}
      {isDeleting && (
        <div className="delete-confirmation-modal">
          <div className="modal-content">
            <h2>Tem certeza que deseja excluir este negócio?</h2>
            <div className="modal-actions">
              <button onClick={handleDelete}>Sim, excluir</button>
              <button onClick={handleCancelDelete}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNegocios;