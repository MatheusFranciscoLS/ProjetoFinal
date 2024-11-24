import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Para navegação
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/lojasList.css"; // Importação do CSS para estilos

const LojasList = () => {
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNome, setFiltroNome] = useState(""); // Estado para o filtro de nome
  const [filtroCategoria, setFiltroCategoria] = useState(""); // Estado para o filtro de categoria

  // Função que busca os dados das lojas
  useEffect(() => {
    const fetchLojas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "lojas")); // Certifique-se de que a coleção é 'lojas'
        const lojasData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLojas(lojasData);
      } catch (error) {
        console.error("Erro ao carregar lojas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLojas();
  }, []);

  // Função para filtrar as lojas com base nos filtros definidos
  const filtrarLojas = () => {
    return lojas.filter((loja) => {
      const nomeFiltrado = loja.nome.toLowerCase().includes(filtroNome.toLowerCase());
      const categoriaFiltrada = filtroCategoria
        ? loja.categoria?.toLowerCase().includes(filtroCategoria.toLowerCase())
        : true; // Se não houver filtro de categoria, retorna todas
      return nomeFiltrado && categoriaFiltrada;
    });
  };

  // Se os dados ainda estão carregando
  if (loading) {
    return <p>Carregando lojas...</p>;
  }

  const lojasFiltradas = filtrarLojas();

  return (
    <div className="container">
      <h2>Lista de Lojas</h2>
      
      {/* Filtros */}
      <div className="filters">
        <input
          type="text"
          placeholder="Filtrar por nome"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)} // Atualiza o filtro de nome
          className="filter-input"
        />
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)} // Atualiza o filtro de categoria
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
        {lojasFiltradas.length === 0 ? (
          <p>Não há lojas que correspondem aos filtros.</p> // Caso não haja lojas que correspondam aos filtros
        ) : (
          lojasFiltradas.map((loja) => (
            <div className="loja-card" key={loja.id}>
              <img
                src={loja.imagens?.[0] || "default-image.jpg"} // Exibe a primeira imagem ou uma imagem padrão
                alt={loja.nome}
                className="loja-img" // Classe para a imagem
              />
              <h3>{loja.nome}</h3> {/* Nome da loja */}
              <p>{loja.descricao}</p> {/* Descrição da loja */}
              <Link to={`/loja/${loja.id}`} className="btn-ver-mais">
                Ver mais
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LojasList;
