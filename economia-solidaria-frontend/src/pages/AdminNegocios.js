import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { FiSearch, FiFilter, FiMapPin, FiPhone, FiMail, FiCheck, FiX, FiGrid, FiArrowDown } from 'react-icons/fi';
import '../styles/AdminNegocios.css';

const AdminNegocios = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' ou 'desc'

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const businessesCollection = collection(db, 'lojas');
      const businessesSnapshot = await getDocs(businessesCollection);
      const businessesList = businessesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBusinesses(businessesList);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar os negócios. Por favor, tente novamente mais tarde.');
      console.error('Error fetching businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (businessId) => {
    try {
      const businessRef = doc(db, 'lojas', businessId);
      await updateDoc(businessRef, {
        status: 'ativo'
      });
      await fetchBusinesses();
    } catch (err) {
      setError('Erro ao aprovar o negócio. Por favor, tente novamente.');
      console.error('Error approving business:', err);
    }
  };

  const handleReject = async (businessId) => {
    try {
      const businessRef = doc(db, 'lojas', businessId);
      await updateDoc(businessRef, {
        status: 'inativo'
      });
      await fetchBusinesses();
    } catch (err) {
      setError('Erro ao rejeitar o negócio. Por favor, tente novamente.');
      console.error('Error rejecting business:', err);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  const getFilteredAndSortedBusinesses = () => {
    let filtered = businesses.filter(business => {
      const matchesSearch = business.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          business.cnpj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          business.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || business.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || business.categoria === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Ordenação alfabética
    filtered.sort((a, b) => {
      const nameA = (a.nome || '').toLowerCase();
      const nameB = (b.nome || '').toLowerCase();
      return sortOrder === 'asc' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    return filtered;
  };

  // Lista única de categorias dos negócios
  const categories = ['all', ...new Set(businesses.map(b => b.categoria).filter(Boolean))];

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>Gerenciamento de Negócios</h1>
          <p>Carregando negócios...</p>
        </div>
        <div className="business-grid">
          {[1, 2, 3, 4].map((_, index) => (
            <div key={index} className="skeleton">
              <div className="skeleton-image" />
              <div className="skeleton-content">
                <div className="skeleton-title" />
                <div className="skeleton-text" />
                <div className="skeleton-text" />
                <div className="skeleton-text" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredBusinesses = getFilteredAndSortedBusinesses();

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Gerenciamento de Negócios</h1>
        <p>Gerencie os negócios cadastrados na plataforma</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="admin-controls">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Pesquisar negócios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <FiFilter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os status</option>
              <option value="ativo">Ativos</option>
              <option value="pendente">Pendentes</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>

          <div className="filter-group">
            <FiGrid className="filter-icon" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Todas as categorias</option>
              {categories.map(category => 
                category !== 'all' && (
                  <option key={category} value={category}>
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          <button 
            className="sort-button"
            onClick={toggleSortOrder}
            title={`Ordenar ${sortOrder === 'asc' ? 'Decrescente' : 'Crescente'}`}
          >
            <FiArrowDown 
              className={`sort-icon ${sortOrder === 'desc' ? 'sort-desc' : ''}`}
            />
            {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
        </div>
      </div>

      <div className="business-grid">
        {filteredBusinesses.length === 0 ? (
          <div className="empty-state">
            Nenhum negócio encontrado com os filtros atuais.
          </div>
        ) : (
          filteredBusinesses.map(business => (
            <div key={business.id} className="business-card">
              <div className="business-image">
                <img
                  src={'https://via.placeholder.com/300x200?text=Sem+Imagem'}
                  alt={business.nome}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Sem+Imagem';
                  }}
                />
              </div>
              <div className="business-content">
                <div className="business-header">
                  <h3>{business.nome}</h3>
                  <span className={`status-badge ${business.status}`}>
                    {business.status === 'ativo' && <FiCheck />}
                    {business.status === 'pendente' && <FiFilter />}
                    {business.status === 'inativo' && <FiX />}
                    {business.status === 'ativo' ? 'Ativo' :
                     business.status === 'pendente' ? 'Pendente' :
                     'Inativo'}
                  </span>
                </div>
                
                <div className="business-info">
                  <p><FiGrid />{business.categoria || 'Categoria não informada'}</p>
                  <p><FiMapPin />{business.endereco || 'Endereço não informado'}</p>
                  <p><FiPhone />{business.telefone || 'Telefone não informado'}</p>
                  <p><FiMail />{business.email || 'Email não informado'}</p>
                </div>

                <div className="business-actions">
                  {business.status !== 'ativo' && (
                    <button
                      className="approve-button"
                      onClick={() => handleApprove(business.id)}
                    >
                      <FiCheck /> Aprovar
                    </button>
                  )}
                  {business.status !== 'inativo' && (
                    <button
                      className="reject-button"
                      onClick={() => handleReject(business.id)}
                    >
                      <FiX /> Rejeitar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNegocios;
