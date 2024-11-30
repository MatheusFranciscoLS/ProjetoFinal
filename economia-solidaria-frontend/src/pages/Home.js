import React, { useState, useEffect, useCallback } from "react";
import Slider from "react-slick";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/home.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Componente para o cartão de cada loja
const LojaCard = ({ loja }) => {
  const { nome, descricao, imagens } = loja;
  return (
    <div className="loja-card">
      <img
        src={imagens?.[0] || "default-image.jpg"}
        alt={nome}
        className="loja-img"
        style={{
          height: "400px",
          objectFit: "cover",
          width: "100%",
        }}
      />
      <div className="loja-info">
        <h3>{nome}</h3>
        <p>{descricao || "Descrição não disponível."}</p>
      </div>
    </div>
  );
};

const Home = () => {
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configurações do carrossel
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    prevArrow: <div className="slick-prev"><span>&lt;</span></div>,  // Ícone de seta para a esquerda
    nextArrow: <div className="slick-next"><span>&gt;</span></div>,  // Ícone de seta para a direita
  };

  // Função para buscar as lojas cadastradas de forma aleatória
  const fetchLojas = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "lojas"));
      const lojasData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Seleciona 3 lojas aleatórias
      const lojasAleatorias = lojasData.sort(() => Math.random() - 0.5).slice(0, 3);
      setLojas(lojasAleatorias);
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
      setError("Erro ao carregar as lojas. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLojas();
  }, [fetchLojas]);

  // Renderiza as lojas ou mensagens de erro e loading
  const renderContent = () => {
    if (loading) {
      return (
        <div className="skeleton-container">
          <div className="skeleton-loader" />
          <div className="skeleton-text" />
          <div className="skeleton-text skeleton-text-short" />
        </div>
      );
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    if (lojas.length === 0) {
      return <div className="no-lojas-message">Não há lojas cadastradas no momento.</div>;
    }

    return lojas.map((loja) => <LojaCard key={loja.id} loja={loja} />);
  };

  return (
    <div className="home-container">
      <h1>Seja bem-vindo à nossa plataforma!</h1>

      {/* Carrossel de lojas */}
      <Slider {...carouselSettings} className="carousel">
        {renderContent()}
      </Slider>
    </div>
  );
};

export default Home;
