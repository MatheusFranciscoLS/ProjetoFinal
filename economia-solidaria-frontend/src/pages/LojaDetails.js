import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Certifique-se de que o Firebase está configurado corretamente
import Avaliacao from "./Avaliacao"; // Componente de avaliação
import "../styles/lojaDetails.css"; // Importar estilos

const LojaDetails = () => {
  const { id } = useParams(); // Obtém o ID da loja da URL
  const [loja, setLoja] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoja = async () => {
      try {
        // Referência ao documento no Firestore
        const docRef = doc(db, "lojas", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const lojaData = docSnap.data();

          // Remover o campo 'comprovante', se existir
          const { comprovante, ...lojaSemComprovante } = lojaData;
          setLoja(lojaSemComprovante);
        } else {
          console.log("Loja não encontrada.");
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
        src={loja.foto || loja.imagens?.[0] || "default-image.jpg"} // Usa a primeira imagem disponível ou uma imagem padrão
        alt={`Imagem da loja ${loja.nome}`}
        className="loja-img" // Classe para estilos da imagem
      />
      <p><strong>Descrição:</strong> {loja.descricao}</p>
      <p><strong>Endereço:</strong> {loja.endereco}</p>
      <p><strong>Telefone:</strong> {loja.telefone}</p>
      <p><strong>Email:</strong> {loja.email}</p>
      <p><strong>Horário de Funcionamento:</strong> {loja.horarioDeFuncionamento}</p>

      {/* Espaço para avaliações */}
      <div style={{ marginTop: "50px" }}></div> {/* Espaço entre os detalhes e avaliações */}

      {/* Seção de avaliação */}
      <div className="avaliacao-section">
        <Avaliacao lojaId={id} />
      </div>
    </div>
  );
};

export default LojaDetails;
