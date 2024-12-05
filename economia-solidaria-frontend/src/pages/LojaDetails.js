import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import Avaliacao from "../components/Avaliacao";
import "../styles/lojaDetails.css";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebook, FaWhatsapp, FaMapMarkerAlt, FaCrown } from "react-icons/fa";

const LojaDetails = () => {
  const { id } = useParams();
  const [loja, setLoja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const fetchLoja = async () => {
      try {
        const docRef = doc(db, "lojas", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const lojaData = docSnap.data();
          const { comprovante, ...lojaSemComprovante } = lojaData;
          setLoja(lojaSemComprovante);
          
          // Verifica se o usuário atual é o dono da loja
          const currentUser = auth.currentUser;
          if (currentUser) {
            setIsOwner(currentUser.uid === lojaData.userId);
          }
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
  }, [id, auth]);

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

  const openGoogleMaps = (endereco) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
    window.open(mapsUrl, '_blank');
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
        {loja.imagens && loja.imagens.length > 0 ? (
          <>
            {loja.plano !== 'gratuito' && loja.imagens.length > 1 && (
              <button className="carrossel-btn prev-btn" onClick={handlePrevImage}>
                &#10094;
              </button>
            )}

            <div className="carrossel-image-container">
              <img
                src={loja.imagens[currentImageIndex]}
                alt={`Imagem ${currentImageIndex + 1} da loja ${loja.nome}`}
                className="carrossel-image"
              />
            </div>

            {loja.plano !== 'gratuito' && loja.imagens.length > 1 && (
              <button className="carrossel-btn next-btn" onClick={handleNextImage}>
                &#10095;
              </button>
            )}
          </>
        ) : (
          <div className="loja-img-placeholder">
            <span>Sem imagem disponível</span>
          </div>
        )}
      </div>

      {/* Detalhes da Loja */}
      <p>
        <strong>Descrição:</strong> {loja.descricao}
      </p>

      {/* Redes Sociais - Mostrar apenas para planos pagos e quando houver redes sociais cadastradas */}
      {loja.plano !== 'Gratuito' && loja.redesSociais && (
        Object.values(loja.redesSociais).some(value => value) ? (
          <div className="social-media-section">
            <div className="social-media-header">
              <h3>Redes Sociais</h3>
            </div>
            <div className="social-links">
              {loja.redesSociais?.instagram && (
                <a
                  href={loja.redesSociais.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram size={30} />
                </a>
              )}
              {loja.redesSociais?.facebook && (
                <a
                  href={loja.redesSociais.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebook size={30} />
                </a>
              )}
              {loja.redesSociais?.whatsapp && (
                <a
                  href={
                    loja.redesSociais.whatsapp.startsWith("https://wa.me/")
                      ? loja.redesSociais.whatsapp
                      : `https://api.whatsapp.com/send/?phone=${loja.redesSociais.whatsapp
                          .replace(/\D/g, "")
                          .replace(/^1/, "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp size={30} />
                </a>
              )}
            </div>
          </div>
        ) : null
      )}
      {loja.plano === 'Gratuito' && isOwner && (
        <div className="upgrade-message">
          <FaCrown className="crown-icon" />
          <p>Atualize para um plano mais avançado e mostre suas redes sociais para pessoas interessadas no seu negócio!</p>
          <Link to="/plans-details" className="upgrade-button">
            Ver Planos
          </Link>
        </div>
      )}

      <div className="endereco-container">
        <strong>Endereço:</strong>
        <div
          className="endereco-link"
          onClick={() => openGoogleMaps(loja.endereco)}
        >
          <FaMapMarkerAlt className="map-icon" />
          <span>{loja.endereco}</span>
        </div>
      </div>

      <p>
        <strong>Telefone:</strong> {loja.telefoneFixo}
      </p>
      <p>
        <strong>Celular:</strong> {loja.telefoneCelular}
      </p>
      <p>
        <strong>Email:</strong> {loja.email}
      </p>
      <p>
        <strong>Horário de Funcionamento:</strong>
      </p>
      <div className="horarios-funcionamento">
        {loja.horarioDeFuncionamento ? (
          <>
            <p>
              <strong>Segunda a Sexta:</strong>{" "}
              {loja.horarioDeFuncionamento.segundaAsexta?.open && 
               loja.horarioDeFuncionamento.segundaAsexta?.close ? (
                `${loja.horarioDeFuncionamento.segundaAsexta.open} às ${loja.horarioDeFuncionamento.segundaAsexta.close}`
              ) : "Não disponível"}
            </p>
            <p>
              <strong>Sábado:</strong>{" "}
              {loja.horarioDeFuncionamento.sabado?.open && 
               loja.horarioDeFuncionamento.sabado?.close ? (
                `${loja.horarioDeFuncionamento.sabado.open} às ${loja.horarioDeFuncionamento.sabado.close}`
              ) : "Não disponível"}
            </p>
            <p>
              <strong>Domingo:</strong>{" "}
              {loja.horarioDeFuncionamento.domingo?.open && 
               loja.horarioDeFuncionamento.domingo?.close ? (
                `${loja.horarioDeFuncionamento.domingo.open} às ${loja.horarioDeFuncionamento.domingo.close}`
              ) : "Não disponível"}
            </p>
          </>
        ) : (
          <p>Não disponível</p>
        )}
      </div>

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
