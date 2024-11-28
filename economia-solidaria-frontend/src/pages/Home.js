import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/home.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configurações do carrossel
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  // Função para buscar as lojas cadastradas de forma aleatória
  const fetchLojas = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLojas();
  }, []);

  return (
    <div className="home-container">
      <p>Seja bem-vindo à nossa plataforma!</p>

      {/* Carrossel de lojas */}
     <Slider {...carouselSettings} className="carousel">
  {loading ? (
    <div>Carregando lojas...</div>
  ) : lojas.length > 0 ? (
    lojas.map((loja) => (
      <div key={loja.id} className="loja-card">
        <img
          src={loja.imagens?.[0] || "default-image.jpg"} // Exibe a primeira imagem ou uma imagem padrão
          alt={loja.nome}
          className="loja-img"
          style={{ height: '400px', objectFit: 'cover' }} // Definindo a altura fixa da imagem
        />
        <h3>{loja.nome}</h3>
        <p>{loja.descricao}</p>
      </div>
    ))
  ) : (
    <p>Não há lojas cadastradas no momento.</p>
  )}
</Slider>

    </div>
  );
};

export default Home;
