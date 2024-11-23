// src/pages/Home.js
import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore"; // Importa métodos do Firestore
import "../styles/auth.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/home.css";

const Home = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca avaliações do Firestore
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "avaliacoes"));
        const reviewsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(reviewsData);
      } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logout realizado com sucesso!");
      window.location.href = "/login";
    } catch (err) {
      console.error("Erro ao sair:", err.message);
    }
  };

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

      <button onClick={handleLogout} className="logout-button">
        Sair
      </button>

      <div className="reviews-section">
        <h2>Avaliações dos Usuários</h2>
        {loading ? (
          <p>Carregando avaliações...</p>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <p>
                <strong>Avaliação:</strong> {review.rating} ★
              </p>
              <p>{review.comment}</p>
              <p className="review-date">
                {new Date(review.createdAt.toDate()).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p>Nenhuma avaliação disponível no momento.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
