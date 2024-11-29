import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Certifique-se de que o Firebase está configurado corretamente
import Avaliacao from "./Avaliacao"; // Componente de avaliação
import "../styles/lojaDetails.css"; // Importar estilos
import { Link } from "react-router-dom";

const LojaDetails = () => {
  const { id } = useParams(); // Obtém o ID da loja da URL
  const [loja, setLoja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Estado para controlar a imagem atual do carrossel

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

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? loja.imagens.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === loja.imagens.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) {
    return (
      <div className="loja-details-overlay">
        <div className="loja-details skeleton-card"></div>
        <div className="skeleton-img"></div>
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
      </div>
    );
  }

  if (!loja) {
    return <p>Loja não encontrada</p>;
  }

  return (
    <div className="loja-details">
      <h2>{loja.nome}</h2>

      {/* Carrossel de Imagens */}
      <div className="carrossel">
        {loja.imagens?.length > 1 && (
          <button className="carrossel-btn" onClick={handlePrevImage}>
            &#10094;
          </button>
        )}

        {/* Exibe a imagem atual do carrossel ou o placeholder */}
        <img
          src={loja.imagens?.[currentImageIndex] || "default-image.jpg"}
          alt={`Imagem da loja ${loja.nome}`}
          className="loja-img"
        />

        {loja.imagens?.length > 1 && (
          <button className="carrossel-btn" onClick={handleNextImage}>
            &#10095;
          </button>
        )}
      </div>

     {/* Detalhes da Loja */}
<p><strong>Descrição:</strong> {loja.descricao}</p>
<p>
  <strong>Endereço:</strong>{" "}
  <Link to={`/rota-endereco/${encodeURIComponent(loja.endereco)}`}>
    {loja.endereco}
  </Link>
</p>
<p><strong>Telefone:</strong> {loja.telefone}</p>
<p><strong>Email:</strong> {loja.email}</p>
<p><strong>Horário de Funcionamento:</strong> {loja.horarioDeFuncionamento}</p>
      {/* Espaço para avaliações */}
      <div style={{ marginTop: "50px" }}></div>

      {/* Seção de avaliação */}
      <div className="avaliacao-section">
        <Avaliacao lojaId={id} />
      </div>
    </div>
  );
};

export default LojaDetails;
