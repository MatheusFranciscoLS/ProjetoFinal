import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import '../styles/home.css';

const Home = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories] = useState([
    'Todos',
    'Restaurante',
    'Loja',
    'Serviços',
    'Artesanato',
    'Beleza e Estética',
    'Educação e Cursos',
    'Saúde e Bem-estar',
    'Esportes e Lazer',
    'Outro'
  ]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!db) {
          throw new Error('Erro de conexão com o banco de dados');
        }

        // Query para buscar apenas negócios aprovados
        let businessQuery = query(
          collection(db, 'lojas'),
          where('status', '==', 'aprovado')
        );

        const querySnapshot = await getDocs(businessQuery);
        
        if (!querySnapshot) {
          throw new Error('Erro ao buscar dados dos negócios');
        }

        // Mapeia os documentos e adiciona uma imagem padrão se necessário
        const businessesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Se não houver imagem, usa uma imagem padrão
            imagemUrl: data.imagemUrl || '/placeholder-store.png'
          };
        }).filter(business => business.status === 'aprovado');

        console.log('Negócios carregados:', businessesData); // Debug
        setBusinesses(businessesData);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar negócios:', err);
        setError('Não foi possível carregar os negócios. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business?.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || selectedCategory === '' || 
                          business?.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando negócios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="search-section">
        <input
          type="text"
          placeholder="Buscar negócios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="">Todas as Categorias</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {filteredBusinesses.length === 0 ? (
        <div className="no-results">
          <p>Nenhum negócio encontrado com os critérios de busca atuais.</p>
        </div>
      ) : (
        <div className="businesses-grid">
          {filteredBusinesses.map((business) => (
            <Link to={`/loja/${business.id}`} key={business.id} className="business-card">
              <div className="business-image">
                <img 
                  src={business.imagemUrl} 
                  alt={business.nome}
                  onError={(e) => {
                    e.target.onerror = null; // Previne loop infinito
                    e.target.src = '/placeholder-store.png'; // Imagem padrão
                  }}
                />
              </div>
              <div className="business-info">
                <h2>{business.nome || 'Nome não disponível'}</h2>
                <p className="business-category">{business.categoria || 'Categoria não especificada'}</p>
                <p className="business-description">
                  {business.descricao?.length > 100
                    ? `${business.descricao.substring(0, 100)}...`
                    : business.descricao || 'Descrição não disponível'}
                </p>
                <p className="business-address">{business.endereco || 'Endereço não disponível'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
