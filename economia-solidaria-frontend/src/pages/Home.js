// src/pages/Home.js
import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "../styles/auth.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/home.css";

const Home = () => {
  const [reviews, setReviews] = useState([]);
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

  // Função para buscar as avaliações do Firestore
  const fetchReviews = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "avaliacoes"));
      const reviewsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Ordena as avaliações pela data (mais recentes primeiro)
      reviewsData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

      setReviews(reviewsData);
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar as avaliações ao carregar o componente
  useEffect(() => {
    fetchReviews();
  }, []);

  // Função para realizar o logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logout realizado com sucesso!");
      window.location.href = "/login";
    } catch (err) {
      console.error("Erro ao sair:", err.message);
    }
  };

  return (
    <div className="home-container">
      <h1>Bem-vindo à Home</h1>
      <p>Você está autenticado!</p>

      {/* Carrossel de avaliações */}
      <Slider {...carouselSettings} className="carousel">
        {loading ? (
          <div>Carregando avaliações...</div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-card-body">
                <p>
                  <strong>Avaliação:</strong> {review.rating} ★
                </p>
                <p>{review.comment}</p>
                <p className="review-date">
                  {new Date(review.createdAt.seconds * 1000).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>Nenhuma avaliação disponível no momento.</p>
        )}
      </Slider>

      {/* Botão de logout */}
      <button onClick={handleLogout} className="logout-button">
        Sair
      </button>
    </div>
  );
};

export default Home;
