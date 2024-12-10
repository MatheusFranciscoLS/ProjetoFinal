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
          console.log("Dados da loja:", lojaData); // Verifique os dados recebidos do Firebase

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
    window.open(mapsUrl, "_blank");
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
          loja.plano?.toLowerCase() === "gratuito" ? (
            // Plano gratuito - mostra apenas a primeira imagem
            <div className="carrossel-image-container">
              <img
                src={loja.imagens[0]}
                alt={`Imagem da loja ${loja.nome}`}
                className="carrossel-image"
                onError={handleImageError}
              />
            </div>
          ) : (
            // Outros planos - mostra carrossel com todas as imagens
            <div className="carrossel-container">
              <div className="carrossel-image-container">
                <img
                  src={loja.imagens[currentImageIndex]}
                  alt={`Imagem ${currentImageIndex + 1} da loja ${loja.nome}`}
                  className="carrossel-image"
                  onError={handleImageError}
                />
              </div>
              {loja.imagens.length > 1 && (
                <div className="carrossel-controls">
                  <button
                    onClick={() => setCurrentImageIndex((prev) => 
                      prev === 0 ? loja.imagens.length - 1 : prev - 1
                    )}
                    className="carrossel-button"
                  >
                    &#8249;
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => 
                      prev === loja.imagens.length - 1 ? 0 : prev + 1
                    )}
                    className="carrossel-button"
                  >
                    &#8250;
                  </button>
                </div>
              )}
              <div className="carrossel-dots">
                {loja.imagens.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </div>
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
      {loja.plano?.toLowerCase() !== "gratuito" && loja.social && (
        Object.values(loja.social).some((value) => value) && (
          <div className="social-media-section">
            <h3>Redes Sociais</h3>
            <div className="social-links">
              {loja.social.instagram && (
                <a
                  href={loja.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram size={30} />
                </a>
              )}
              {loja.social.facebook && (
                <a
                  href={loja.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebook size={30} />
                </a>
              )}
              {loja.social.whatsapp && (
                <a
                  href={`https://wa.me/${loja.social.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp size={30} />
                </a>
              )}
            </div>
          </div>
        )
      )}

      {loja.plano === "Gratuito" && isOwner && (
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
          onClick={() =>
            openGoogleMaps(
              `${loja.endereco.rua}, ${loja.endereco.numero}, ${loja.endereco.bairro}, ${loja.endereco.cidade} - ${loja.endereco.estado}`
            )
          }
        >
          <FaMapMarkerAlt className="map-icon" />
          <span>
            {`${loja.endereco.rua}, ${loja.endereco.numero}, ${loja.endereco.bairro}, ${loja.endereco.cidade} - ${loja.endereco.estado}`}
          </span>
        </div>
      </div>

      {/* Telefones e Email */}
      {loja.plano?.toLowerCase() !== "gratuito" && (
        <>
          {loja.telefone && (
            <p>
              <strong>Telefone:</strong> {loja.telefone}
            </p>
          )}
          {loja.cellphone && (
            <p>
              <strong>Celular:</strong> {loja.cellphone}
            </p>
          )}
        </>
      )}
      <p>
        <strong>Email:</strong> {loja.email}
      </p>

      {/* Horário de Funcionamento */}
      <div className="horarios-funcionamento">
        <h3>Horário de Funcionamento</h3>
        <>
          <p>
            <strong>Segunda a Sexta:</strong>{" "}
            {loja.horarioDeFuncionamento?.weekdays?.open &&
            loja.horarioDeFuncionamento?.weekdays?.close ? (
              `${loja.horarioDeFuncionamento.weekdays.open} às ${loja.horarioDeFuncionamento.weekdays.close}`
            ) : (
              "Fechado"
            )}
            {loja.horarioDeFuncionamento?.lunch?.enabled && (
              <span className="lunch-time">
                {" "}
                (Almoço: {loja.horarioDeFuncionamento.lunch.start} às{" "}
                {loja.horarioDeFuncionamento.lunch.end})
              </span>
            )}
          </p>

          <p>
            <strong>Sábado:</strong>{" "}
            {loja.horarioDeFuncionamento?.saturday?.closed ? (
              "Fechado"
            ) : loja.horarioDeFuncionamento?.saturday?.open &&
              loja.horarioDeFuncionamento?.saturday?.close ? (
              `${loja.horarioDeFuncionamento.saturday.open} às ${loja.horarioDeFuncionamento.saturday.close}`
            ) : (
              "Fechado"
            )}
          </p>

          <p>
            <strong>Domingo:</strong>{" "}
            {loja.horarioDeFuncionamento?.sunday?.closed ? (
              "Fechado"
            ) : loja.horarioDeFuncionamento?.sunday?.open &&
              loja.horarioDeFuncionamento?.sunday?.close ? (
              `${loja.horarioDeFuncionamento.sunday.open} às ${loja.horarioDeFuncionamento.sunday.close}`
            ) : (
              "Fechado"
            )}
          </p>
        </>
      </div>

      {/* Avaliação */}
      <div className="avaliacao-section">
        <Avaliacao lojaId={id} />
      </div>
    </div>
  );
};

export default LojaDetails;
