import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Para navegação
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/lojasList.css"; // Importação do CSS para estilos

const LojasList = () => {
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Se os dados ainda estão carregando
  if (loading) {
    return <p>Carregando lojas...</p>;
  }

  return (
    <div className="container"> {/* Adicionando uma classe container */}
      <h2>Lista de Lojas</h2>
      <div className="lojas-list">
        {lojas.map((loja) => (
          <div className="loja-card" key={loja.id}>
            <img
              src={loja.foto || "default-image.jpg"} // Exibe a foto ou uma imagem padrão
              alt={loja.nome}
              className="loja-img" // Classe para a imagem
            />
            <h3>{loja.nome}</h3> {/* Nome da loja */}
            <p>{loja.descricao}</p> {/* Descrição da loja */}
            <Link to={`/loja/${loja.id}`} className="btn-ver-mais">
              Ver mais
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LojasList;
