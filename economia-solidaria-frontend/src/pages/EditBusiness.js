import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const BusinessList = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "lojas"));
        const businessList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBusinesses(businessList);
      } catch (err) {
        console.error("Erro ao buscar as lojas:", err);
        setError("Erro ao buscar as lojas. Tente novamente.");
      }
    };

    fetchBusinesses();
  }, []);

  return (
    <div>
      <h2>Lista de Lojas</h2>
      {error && <div className="error">{error}</div>}
      {businesses.length === 0 ? (
        <p>Nenhuma loja cadastrada.</p>
      ) : (
        <ul>
          {businesses.map((business) => (
            <li key={business.id}>
              <h3>{business.nome}</h3>
              <p>{business.descricao}</p>
              <p>Categoria: {business.categoria}</p>
              <p>Endereço: {business.endereco}</p>
              <p>Telefone: {business.telefone}</p>
              <p>Email: {business.email}</p>
              <button onClick={() => navigate(`/edit-business/${business.id}`)}>
                Editar
              </button>
              <button onClick={() => navigate(`/loja/${business.id}`)}>
                Ver Detalhes
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BusinessList;
