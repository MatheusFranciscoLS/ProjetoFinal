import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Para navegação
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const LojasList = () => {
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLojas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "lojas"));
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

  if (loading) {
    return <p>Carregando lojas...</p>;
  }

  return (
    <div>
      <h2>Lista de Lojas</h2>
      <div className="lojas-list">
        {lojas.map((loja) => (
          <div className="loja-card" key={loja.id}>
            <img src={loja.foto} alt={loja.nome} style={{ width: "200px", height: "200px" }} />
            <h3>{loja.nome}</h3>
            <p>{loja.descricao}</p>
            <Link to={`/loja/${loja.id}`}>Ver mais</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LojasList;
