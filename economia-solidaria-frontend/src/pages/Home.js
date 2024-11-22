// src/pages/Home.js
import React from "react";
import Slider from "react-slick";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/auth.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/home.css"; // Para estilizações personalizadas
import "../styles/auth.css"; // Para estilizações personalizadas

const Home = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logout realizado com sucesso!");
      window.location.href = "/login";
    } catch (err) {
      console.error("Erro ao sair:", err.message);
    }
  };

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

  return (
    <div className="home-container">
      <h1>Bem-vindo à Home</h1>
      <p>Você está autenticado!</p>

      <Slider {...carouselSettings} className="carousel">
        <div className="carousel-item">
          <img src="https://via.placeholder.com/800x400" alt="Destaque 1" />
          <h3>Destaque 1</h3>
          <p>Descrição do destaque 1.</p>
        </div>
        <div className="carousel-item">
          <img src="https://via.placeholder.com/800x400" alt="Destaque 2" />
          <h3>Destaque 2</h3>
          <p>Descrição do destaque 2.</p>
        </div>
        <div className="carousel-item">
          <img src="https://via.placeholder.com/800x400" alt="Destaque 3" />
          <h3>Destaque 3</h3>
          <p>Descrição do destaque 3.</p>
        </div>
      </Slider>

      <button onClick={handleLogout}>Sair</button>
    </div>
  );
};

export default Home;
