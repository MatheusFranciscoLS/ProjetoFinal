import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Certifique-se de que o Firebase está configurado corretamente

const LojaDetails = () => {
  const { id } = useParams(); // Obtém o ID da loja da URL
  const [loja, setLoja] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoja = async () => {
      try {
        const docRef = doc(db, "lojas", id); // Altere para a coleção correta "lojas"
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setLoja(docSnap.data()); // Define os dados da loja no estado
        } else {
          console.log("Loja não encontrada");
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes da loja:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoja();
  }, [id]);

  if (loading) {
    return <p>Carregando detalhes da loja...</p>;
  }

  if (!loja) {
    return <p>Loja não encontrada</p>;
  }

  return (
    <div className="loja-details">
      <h2>{loja.nome}</h2>
      <img
        src={loja.foto || "default-image.jpg"} // Certifique-se de que o campo 'foto' está armazenado corretamente
        alt={loja.nome}
        style={{ width: "300px", height: "300px" }}
      />
      <p>{loja.descricao}</p>
      <p><strong>Endereço:</strong> {loja.endereco}</p>
    </div>
  );
};

export default LojaDetails;
