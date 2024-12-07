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

  const openGoogleMaps = (endereco) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
    window.open(mapsUrl, '_blank');
  };

  const handleImageError = (event) => {
    event.target.src = "/path/to/placeholder.jpg"; // Substitua pelo caminho de sua imagem de fallback
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
          loja.plano === 'gratuito' ? (
            // Exibe apenas a primeira imagem para plano gratuito, sem navegação
            <div className="carrossel-image-container">
              <img
                src={loja.imagens[0]}
                alt={`Imagem 1 da loja ${loja.nome}`}
                className="carrossel-image"
                onError={handleImageError}
              />
            </div>
          ) : (
            // Exibe o carrossel completo para planos pagos com navegação
            <>
              <div className="carrossel-image-container">
                <img
                  src={loja.imagens[currentImageIndex]}
                  alt={`Imagem ${currentImageIndex + 1} da loja ${loja.nome}`}
                  className="carrossel-image"
                  onError={handleImageError}
                />
              </div>
            </>
          )
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

      {/* Redes Sociais */}
      {loja.plano !== 'Gratuito' && loja.redesSociais && (
        Object.values(loja.redesSociais).some(value => value) ? (
          <div className="social-media-section">
            <h3>Redes Sociais</h3>
            <div className="social-links">
              {loja.redesSociais.instagram && (
                <a
                  href={loja.redesSociais.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram size={30} />
                </a>
              )}
              {loja.redesSociais.facebook && (
                <a
                  href={loja.redesSociais.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebook size={30} />
                </a>
              )}
              {loja.redesSociais.whatsapp && (
                <a
                  href={`https://wa.me/${loja.redesSociais.whatsapp.replace(/\D/g, "")}`}
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
          <p>Atualize para um plano mais avançado e mostre suas redes sociais!</p>
          <Link to="/plans-details" className="upgrade-button">
            Ver Planos
          </Link>
        </div>
      )}

      {/* Endereço */}
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
              {loja.horarioDeFuncionamento.segundaAsexta?.open ? 
              `${loja.horarioDeFuncionamento.segundaAsexta.open} às ${loja.horarioDeFuncionamento.segundaAsexta.close}` 
              : "Fechado"}
            </p>
            <p>
              <strong>Sábado:</strong>{" "}
              {loja.horarioDeFuncionamento.sabado?.open ? 
              `${loja.horarioDeFuncionamento.sabado.open} às ${loja.horarioDeFuncionamento.sabado.close}` 
              : "Fechado"}
            </p>
            <p>
              <strong>Domingo:</strong>{" "}
              {loja.horarioDeFuncionamento.domingo?.open ? 
              `${loja.horarioDeFuncionamento.domingo.open} às ${loja.horarioDeFuncionamento.domingo.close}` 
              : "Fechado"}
            </p>
          </>
        ) : (
          <p>Não disponível</p>
        )}
      </div>

      {/* Avaliação */}
      <div className="avaliacao-section">
        <Avaliacao lojaId={id} />
      </div>
    </div>
  );
};

export default LojaDetails;
