import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/home.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import { FaStar, FaStore, FaHandshake, FaSearch, FaArrowRight } from 'react-icons/fa';
import { motion } from "framer-motion";
import { BsArrowRight } from 'react-icons/bs';
import { FiTrendingUp, FiUsers, FiShoppingBag } from 'react-icons/fi';

// Componente para o cartão de cada loja
const LojaCard = ({ loja, isPremium = false }) => {
  const { nome, descricao, imagens, id, categoria } = loja;
  const cardClassName = `${isPremium ? 'premium-card' : 'loja-card'}`;
  
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

// Componente de card com imagem e nome embaixo
const SimpleLojaCard = ({ loja }) => (
  <div className="simple-loja-card">
    <div className="card-image">
      <img 
        src={loja.imagens?.[0] || '/placeholder-image.jpg'} 
        alt={loja.nome}
        onError={(e) => {
          e.target.src = '/placeholder-image.jpg';
        }}
      />
    </div>
    <div className="card-name">
      <h3>{loja.nome}</h3>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="loja-card skeleton">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-title"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text"></div>
    </div>
  </div>
);

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Home = () => {
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lojasEssentialDisplay, setLojasEssentialDisplay] = useState([]);

  // Configurações do carrossel
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    fade: true,
    cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
    prevArrow: <button className="slick-prev"><FaArrowRight className="prev-icon" /></button>,
    nextArrow: <button className="slick-next"><FaArrowRight className="next-icon" /></button>,
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
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);

  useEffect(() => {
    const lojasEssential = lojas.filter(loja => loja.plano?.toLowerCase() === "essencial");
    
    // Função para embaralhar array
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Atualiza os cards a cada 5 segundos
    const updateDisplayedCards = () => {
      const shuffledLojas = shuffleArray(lojasEssential);
      // Alterado para mostrar no máximo 2 lojas
      const displayCount = Math.min(2, shuffledLojas.length);
      setLojasEssentialDisplay(shuffledLojas.slice(0, displayCount));
    };

    // Primeira atualização
    updateDisplayedCards();

    // Configura o intervalo apenas se houver mais de 2 lojas
    let interval;
    if (lojasEssential.length > 2) {
      interval = setInterval(updateDisplayedCards, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [lojas]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
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
      <motion.section
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <motion.h1
            className="hero-title"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            Economia Solidária
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            Conectando negócios sociais e fortalecendo nossa comunidade
          </motion.p>
          <motion.div
            className="hero-cta"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
            <Link to="/register-business" className="cta-button">
              Cadastre seu Negócio
              <BsArrowRight className="icon-right" />
            </Link>
            <Link to="/lojas" className="cta-button">
              Explorar Lojas
              <BsArrowRight className="icon-right" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="stats-section"
        variants={staggerChildren}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <motion.div className="stat-item" variants={fadeInUp}>
          <FiTrendingUp className="stat-icon" />
          <div className="stat-info">
            <h3>+{Math.max(500, lojas.length * 3)}</h3>
            <p>Clientes Impactados</p>
          </div>
        </motion.div>

        <motion.div className="stat-item" variants={fadeInUp}>
          <FiShoppingBag className="stat-icon" />
          <div className="stat-info">
            <h3>+{Math.max(50, lojas.length * 2)}</h3>
            <p>Empreendedores Locais</p>
          </div>
        </motion.div>

        <motion.div className="stat-item" variants={fadeInUp}>
          <FiUsers className="stat-icon" />
          <div className="stat-info">
            <h3>+{Math.max(20, Math.floor(lojas.length / 2))}</h3>
            <p>Comunidades Atendidas</p>
          </div>
        </motion.div>
      </motion.section>

      <section className="premium-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Destaques</h2>
          <p className="section-subtitle">
            Conheça nossos parceiros em destaque
          </p>
        </motion.div>

        <div className="premium-carousel">
          <Slider
            {...{
              ...carouselSettings,
              slidesToShow: 4, // Aumentado para 4 slides já que os cards estão menores
              slidesToScroll: 1,
              infinite: true,
              speed: 500,
              autoplay: true,
              autoplaySpeed: 3000,
              responsive: [
                {
                  breakpoint: 1200,
                  settings: {
                    slidesToShow: 3,
                  },
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 2,
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1,
                  },
                },
              ],
            }}
          >
            {lojasPremium.map((loja) => (
              <motion.div
                key={loja.id}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <LojaCard loja={loja} isPremium={true} />
              </motion.div>
            ))}
          </Slider>
        </div>
      </section>

      <section className="essential-section">
        <div className="section-header">
          <h2>Parceiros Essenciais</h2>
          <p>Descubra mais negócios de qualidade em nossa rede</p>
        </div>
        <div className="essential-grid">
          {lojasEssentialDisplay.map((loja) => (
            <SimpleLojaCard key={loja.id} loja={loja} />
          ))}
        </div>
      </section>

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