import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/home.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import { FaStar, FaStore, FaHandshake } from 'react-icons/fa';

// Componente para o cartão de cada loja
const LojaCard = ({ loja, isPremium = false }) => {
  const { nome, descricao, imagens, id, categoria } = loja;
  const cardClassName = `loja-card ${isPremium ? 'premium-card' : 'essential-card'}`;
  
  return (
    <Link to={`/loja/${id}`} className={cardClassName}>
      <div className="loja-image-container">
        <img
          src={imagens?.[0] || "default-image.jpg"}
          alt={nome}
          className="loja-img"
        />
        {isPremium && (
          <div className="premium-badge">
            <FaStar /> Premium
          </div>
        )}
      </div>
      <div className="loja-info">
        <h3>{nome}</h3>
        {categoria && <span className="categoria-tag">{categoria}</span>}
      </div>
    </Link>
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
    autoplaySpeed: 5000,
    pauseOnHover: true,
    fade: true,
    cssEase: 'linear',
    prevArrow: <div className="slick-prev"><span>&lt;</span></div>,
    nextArrow: <div className="slick-next"><span>&gt;</span></div>,
  };

  const fetchLojas = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "lojas"));
      const lojasData = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const lojaData = { id: docSnapshot.id, ...docSnapshot.data() };
          
          if (lojaData.userId) {
            const userDoc = await getDoc(doc(db, "users", lojaData.userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData.plano !== lojaData.plano) {
                await setDoc(doc(db, "lojas", lojaData.id), {
                  ...lojaData,
                  plano: userData.plano || "gratuito"
                });
                lojaData.plano = userData.plano || "gratuito";
              }
            } else {
              lojaData.plano = "gratuito";
            }
          } else {
            lojaData.plano = "gratuito";
          }
          
          return lojaData;
        })
      );

      const lojasOrdenadas = lojasData.sort((a, b) => {
        const prioridadePlano = {
          premium: 1,
          essencial: 2,
          gratuito: 3
        };

        const prioridadeA = prioridadePlano[a.plano?.toLowerCase() || "gratuito"];
        const prioridadeB = prioridadePlano[b.plano?.toLowerCase() || "gratuito"];

        if (prioridadeA !== prioridadeB) {
          return prioridadeA - prioridadeB;
        }

        return a.nome?.localeCompare(b.nome || "");
      });

      setLojas(lojasOrdenadas);
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
      setError("Erro ao carregar as lojas. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLojas();
  }, []);

  const lojasPremium = lojas
    .filter(loja => loja.plano?.toLowerCase() === "premium")
    .sort(() => 0.5 - Math.random()) // Ordena aleatoriamente
    .slice(0, 5); // Seleciona os primeiros 5

  const lojasEssential = lojas.filter(loja => loja.plano?.toLowerCase() === "essencial");

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando negócios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Ops! Algo deu errado</h2>
          <p>{error}</p>
          <button onClick={fetchLojas} className="retry-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Economia Solidária</h1>
          <p>Conectando negócios locais e fortalecendo nossa comunidade</p>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="stats-section">
        <div className="stat-item">
          <FaStore className="stat-icon" />
          <div className="stat-info">
            <h3>{lojas.length}</h3>
            <p>Negócios Cadastrados</p>
          </div>
        </div>
        <div className="stat-item">
          <FaStar className="stat-icon" />
          <div className="stat-info">
            <h3>{lojasPremium.length}</h3>
            <p>Negócios Premium</p>
          </div>
        </div>
        <div className="stat-item">
          <FaHandshake className="stat-icon" />
          <div className="stat-info">
            <h3>{lojasEssential.length}</h3>
            <p>Parcerias Essenciais</p>
          </div>
        </div>
      </section>

      {/* Seção Premium */}
      {lojasPremium.length > 0 && (
        <section className="premium-section">
          <div className="section-header">
            <h2>Destaques Premium</h2>
            <p>Conheça nossos parceiros premium e suas ofertas exclusivas</p>
          </div>
          <Slider {...carouselSettings} className="premium-carousel">
            {lojasPremium.map((loja) => (
              <LojaCard key={loja.id} loja={loja} isPremium={true} />
            ))}
          </Slider>
        </section>
      )}

      {/* Seção Essential */}
      {lojasEssential.length > 0 && (
        <section className="essential-section">
          <div className="section-header">
            <h2>Parceiros Essenciais</h2>
            <p>Descubra mais negócios de qualidade em nossa rede</p>
          </div>
          <div className="essential-grid">
            {lojasEssential.map((loja) => (
              <LojaCard key={loja.id} loja={loja} isPremium={false} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Faça Parte da Nossa Rede</h2>
          <p>Cadastre seu negócio e alcance mais clientes</p>
          <Link to="/register-business" className="cta-button">
            Cadastrar Negócio
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
