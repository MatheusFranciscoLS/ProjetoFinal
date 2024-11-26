import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase"; // Certifique-se de importar o 'db'
import { getAuth } from "firebase/auth";

const MyBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        if (user) {
          const q = query(collection(db, "lojas"), where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const userBusinesses = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setBusinesses(userBusinesses);
        }
      } catch (error) {
        console.error("Erro ao buscar negócios do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [user]);

  return (
    <div>
      <h2>Meus Negócios</h2>
      {loading ? (
        <p>Carregando seus negócios...</p>
      ) : (
        <div>
          {businesses.length === 0 ? (
            <p>Você ainda não tem negócios cadastrados.</p>
          ) : (
            <ul>
              {businesses.map((business) => (
                <li key={business.id}>
                  <h3>{business.nome}</h3>
                  <p>Status: {business.status === "pendente" ? "Aguardando aprovação" : business.status === "aprovado" ? "Aprovado" : "Negado"}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBusinesses;
