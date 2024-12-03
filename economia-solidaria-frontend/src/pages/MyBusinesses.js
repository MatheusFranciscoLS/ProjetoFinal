import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import '../styles/myBusinesses.css';

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

const MyBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const fetchBusinesses = async () => {
    if (!user) {
      setError('Você precisa estar logado para ver seus negócios');
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'lojas'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const businessesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBusinesses(businessesData);
    } catch (err) {
      console.error('Erro ao buscar negócios do usuário:', err);
      setError('Ocorreu um erro ao carregar seus negócios. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [user]);

  const handleEdit = (business) => {
    setEditingBusiness(business);
  };

  const handleCloseModal = () => {
    setEditingBusiness(null);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      const businessRef = doc(db, 'lojas', editingBusiness.id);
      await updateDoc(businessRef, {
        ...editingBusiness,
        lastUpdated: new Date().toISOString()
      });
      setEditingBusiness(null);
      await fetchBusinesses();
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      alert('Erro ao salvar as alterações. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="my-businesses-container">
        <div className="header-section">
          <h1>Meus Negócios</h1>
        </div>
        <div className="businesses-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="my-businesses-container">
      <div className="header-section">
        <h1>Meus Negócios</h1>
        <Link to="/register-business" className="add-business-button">
          Adicionar Novo Negócio
        </Link>
      </div>

      <div className="businesses-grid">
        {error ? (
          <div className="error-container">
            <div className="error-message">
              <h2>Erro</h2>
              <p>{error}</p>
              <Link to="/" className="error-button">Voltar para Home</Link>
            </div>
          </div>
        ) : businesses.length > 0 ? (
          businesses.map((business) => (
            <div key={business.id} className="business-card">
              <div className="business-image">
                {business.imagens && business.imagens[0] && (
                  <img src={business.imagens[0]} alt={business.nome} />
                )}
              </div>
              <div className="business-content">
                <h3>{business.nome}</h3>
                <p className="business-category">{business.categoria}</p>
                <p className="business-status">
                  Status: <span className={`status-${business.status}`}>{business.status}</span>
                </p>
                <div className="business-actions">
                  <button className="edit-button" onClick={() => handleEdit(business)}>
                    Editar
                  </button>
                  <Link to={`/loja/${business.id}`} className="view-button">
                    Visualizar
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-businesses">
            <p>Você ainda não cadastrou nenhum negócio.</p>
            <Link to="/registrar-negocio" className="register-link">
              Cadastre seu primeiro negócio
            </Link>
          </div>
        )}
      </div>

      {editingBusiness && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Loja</h2>
            <form onSubmit={handleSaveChanges}>
              <label>
                Nome:
                <input
                  type="text"
                  value={editingBusiness.nome}
                  onChange={(e) =>
                    setEditingBusiness({ ...editingBusiness, nome: e.target.value })
                  }
                />
              </label>
              <label>
                CNPJ:
                <input
                  type="text"
                  value={editingBusiness.cnpj}
                  onChange={(e) =>
                    setEditingBusiness({ ...editingBusiness, cnpj: e.target.value })
                  }
                />
              </label>
              <label>
                Descrição:
                <textarea
                  value={editingBusiness.descricao}
                  onChange={(e) =>
                    setEditingBusiness({
                      ...editingBusiness,
                      descricao: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Categoria:
                <input
                  type="text"
                  value={editingBusiness.categoria}
                  onChange={(e) =>
                    setEditingBusiness({
                      ...editingBusiness,
                      categoria: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Endereço:
                <input
                  type="text"
                  value={editingBusiness.endereco}
                  onChange={(e) =>
                    setEditingBusiness({
                      ...editingBusiness,
                      endereco: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Telefone:
                <input
                  type="text"
                  value={editingBusiness.telefone}
                  onChange={(e) =>
                    setEditingBusiness({
                      ...editingBusiness,
                      telefone: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                E-mail:
                <input
                  type="email"
                  value={editingBusiness.email}
                  onChange={(e) =>
                    setEditingBusiness({ ...editingBusiness, email: e.target.value })
                  }
                />
              </label>
              <label>
                Horário de Funcionamento:
                <input
                  type="text"
                  value={editingBusiness.horarioDeFuncionamento}
                  onChange={(e) =>
                    setEditingBusiness({
                      ...editingBusiness,
                      horarioDeFuncionamento: e.target.value,
                    })
                  }
                />
              </label>
              <div className="modal-buttons">
                <button type="submit">Salvar</button>
                <button type="button" onClick={handleCloseModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBusinesses;
