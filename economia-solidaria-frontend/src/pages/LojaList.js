import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/lojasList.css";

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
        const lojasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLojas(lojasData);
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
    return lojas.filter((loja) => {
      const nomeFiltrado = loja.nome.toLowerCase().includes(filtroNome.toLowerCase());
      const categoriaFiltrada = filtroCategoria
        ? loja.categoria?.toLowerCase().includes(filtroCategoria.toLowerCase())
        : true;
      return nomeFiltrado && categoriaFiltrada;
    });
  };

  const lojasFiltradas = filtrarLojas();

  const indexOfLastLoja = paginaAtual * lojasPorPagina;
  const indexOfFirstLoja = indexOfLastLoja - lojasPorPagina;
  const lojasPaginas = lojasFiltradas.slice(indexOfFirstLoja, indexOfLastLoja);

  const handleChangePage = (novaPagina) => {
    setPaginaAtual(novaPagina);
  };

  return (
    <div className="container">
      <h2>Lista de Lojas</h2>

      {/* Filtros */}
      <div className="filters">
        <input
          type="text"
          placeholder="Filtrar por nome"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          className="filter-input"
        />
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
          Array(12).fill().map((_, idx) => (
            <div className="loja-card" key={idx}>
              <div className="loja-img-placeholder"></div>
              <div className="loja-info-placeholder">
                <div className="loja-title-placeholder"></div>
                <div className="loja-description-placeholder"></div>
              </div>
            </div>
          ))
        ) : lojasPaginas.length === 0 ? (
          <p>Não há lojas que correspondem aos filtros.</p>
        ) : (
          lojasPaginas.map((loja) => (
            <div className="loja-card" key={loja.id}>
              <img
                src={loja.imagens?.[0] || "default-image.jpg"}
                alt={loja.nome}
                className="loja-img"
              />
              <h3>{loja.nome}</h3>
              <p>{loja.descricao}</p>
              <Link to={`/loja/${loja.id}`} className="btn-ver-mais">
                Ver mais
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Controles de paginação */}
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
    </div>
  );
};

export default LojasList;
