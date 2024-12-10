import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FiSearch } from "react-icons/fi";
import "../styles/lojasList.css";

const defaultLojaImage = "default-image.jpg";

const LojasList = () => {
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const lojasPorPagina = 12;

  useEffect(() => {
    const fetchLojas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "lojas"));
        const lojasData = querySnapshot.docs.map(docSnapshot => {
          const lojaData = { id: docSnapshot.id, ...docSnapshot.data() };
          return {
            ...lojaData,
            plano: lojaData.plano || "gratuito" // Use plan from business data or default to "gratuito"
          };
        });

        // Sort businesses by plan priority
        const lojasOrdenadas = lojasData.sort((a, b) => {
          const prioridadePlano = {
            premium: 1,
            essencial: 2,
            gratuito: 3
          };

          const prioridadeA = prioridadePlano[a.plano?.toLowerCase() || "gratuito"];
          const prioridadeB = prioridadePlano[b.plano?.toLowerCase() || "gratuito"];

          if (prioridadeA !== prioridadeB) {
            return prioridadeA - prioridadeB;
          }

          return a.nome?.localeCompare(b.nome || "");
        });

        setLojas(lojasOrdenadas);
      } catch (error) {
        console.error("Erro ao carregar lojas:", error);
        setLojas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLojas();
  }, []);

  const filtrarLojas = () => {
    return lojas
      .filter((loja) => {
        const nomeFiltrado = loja.nome?.toLowerCase().includes(filtroNome.toLowerCase());
        const categoriaFiltrada = loja.categoria?.toLowerCase().includes(filtroNome.toLowerCase());
        const servicoFiltrado = loja.servicos?.some(servico => servico.toLowerCase().includes(filtroNome.toLowerCase()));
        const categoriaFiltradaSelect = filtroCategoria
          ? loja.categoria?.toLowerCase().includes(filtroCategoria.toLowerCase())
          : true;
        return (nomeFiltrado || categoriaFiltrada || servicoFiltrado) && categoriaFiltradaSelect;
      })
      .sort((a, b) => {
        // Definir prioridade dos planos (Premium > Essencial > Gratuito)
        const prioridadePlano = {
          premium: 0,    // Mudando para 0 para ter maior prioridade
          essencial: 1,  // Mudando para 1 para ser segundo
          gratuito: 2    // Mudando para 2 para ser último
        };

        // Obter prioridade de cada loja (default para gratuito se não tiver plano)
        const prioridadeA = prioridadePlano[a.plano?.toLowerCase() || "gratuito"];
        const prioridadeB = prioridadePlano[b.plano?.toLowerCase() || "gratuito"];

        // Ordenar primeiro por plano
        if (prioridadeA !== prioridadeB) {
          return prioridadeA - prioridadeB;
        }

        // Se planos forem iguais, ordenar por nome
        return a.nome?.localeCompare(b.nome || "");
      });
  };

  const lojasFiltradas = filtrarLojas();
  const indexOfLastLoja = paginaAtual * lojasPorPagina;
  const indexOfFirstLoja = indexOfLastLoja - lojasPorPagina;
  const lojasPaginas = lojasFiltradas.slice(indexOfFirstLoja, indexOfLastLoja);

  const handleChangePage = (novaPagina) => {
    setPaginaAtual(novaPagina);
  };

  const renderLoja = (loja) => {
    const planoClass = loja.plano ? `loja-${loja.plano.toLowerCase()}` : 'loja-gratuito';
    const planoBadgeText = {
      'premium': 'Premium',
      'essencial': 'Essencial',
      'gratuito': 'Gratuito'
    }[loja.plano?.toLowerCase() || 'gratuito'];

    return (
      <Link to={`/loja/${loja.id}`} key={loja.id} className={`loja-card ${planoClass}`}>
        {planoBadgeText && <span className="plano-badge">{planoBadgeText}</span>}
        <img 
          src={loja.imagens?.[0] || defaultLojaImage} 
          alt={loja.nome} 
          className="loja-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultLojaImage;
          }}
        />
        <div className="loja-info">
          <h3>{loja.nome}</h3>
          <p className="loja-categoria">Categoria: {loja.categoria || 'Não especificada'}</p>
          <p className="loja-nome">
            {loja.nome || 'Nome não disponível'}
          </p>
        </div>
      </Link>
    );
  };

  const renderLoadingSkeletons = () => {
    return Array(6).fill().map((_, index) => (
      <div key={`skeleton-${index}`} className="loja-card skeleton">
        <div className="loja-img-placeholder"></div>
        <div className="loja-info-placeholder">
          <div className="loja-title-placeholder"></div>
          <div className="loja-description-placeholder"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="container">
      <h2>Lista de Lojas</h2>

      <div className="filters">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Pesquisar por nome de empresa ou serviço"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
          <FiSearch className="search-icon" />
        </div>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="filter-select"
        >
          <option value="">Todas as Categorias</option>
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
      </div>

      <div className="lojas-list">
        {loading ? (
          renderLoadingSkeletons()
        ) : lojasPaginas.length === 0 ? (
          <p>Não há lojas que correspondem aos filtros.</p>
        ) : (
          lojasPaginas.map((loja) => renderLoja(loja))
        )}
      </div>

      {lojasFiltradas.length > lojasPorPagina && (
        <div className="pagination">
          <button
            onClick={() => handleChangePage(paginaAtual - 1)}
            disabled={paginaAtual === 1}
          >
            Anterior
          </button>
          <span>Página {paginaAtual}</span>
          <button
            onClick={() => handleChangePage(paginaAtual + 1)}
            disabled={paginaAtual * lojasPorPagina >= lojasFiltradas.length}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};

export default LojasList;
