import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/home.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebook, FaWhatsapp, FaStore, FaHandshake, FaStar, FaUsers, FaMapMarkedAlt } from 'react-icons/fa';
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
  <Link to={`/loja/${loja.id}`} className="simple-loja-card">
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
  </Link>
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

const PremiumCard = ({ loja }) => (
  <Link to={`/loja/${loja.id}`} className="loja-card premium-card">
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="loja-image-container">
        <img
          src={loja.imagens?.[0] || "/placeholder-image.jpg"}
          alt={loja.nome}
          onError={(e) => {
            e.target.src = "/placeholder-image.jpg";
          }}
        />
      </div>
      <div className="loja-info">
        <h3>{loja.nome}</h3>
        {loja.categoria && <span className="categoria-tag">{loja.categoria}</span>}
      </div>
    </motion.div>
  </Link>
);

const EssentialCard = ({ loja }) => (
  <Link to={`/loja/${loja.id}`} className="loja-card essential-card">
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="loja-image-container">
        <img
          src={loja.imagens?.[0] || "/placeholder-image.jpg"}
          alt={loja.nome}
          onError={(e) => {
            e.target.src = "/placeholder-image.jpg";
          }}
        />
      </div>
      <div className="loja-info">
        <h3>{loja.nome}</h3>
        {loja.categoria && <span className="categoria-tag">{loja.categoria}</span>}
      </div>
    </motion.div>
  </Link>
);

const StatItem = ({ icon: Icon, title, value, description }) => (
  <motion.div
    className="stat-item"
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Icon size={40} className="stat-icon" />
    <div className="stat-info">
      <h3>{value}</h3>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  </motion.div>
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
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
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
      // Alterado para mostrar no máximo 3 lojas
      const displayCount = Math.min(3, shuffledLojas.length);
      setLojasEssentialDisplay(shuffledLojas.slice(0, displayCount));
    };

    // Primeira atualização
    updateDisplayedCards();

    // Configura o intervalo apenas se houver mais de 3 lojas
    let interval;
    if (lojasEssential.length > 3) {
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
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Economia Solidária em Limeira
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Conectando empreendedores e consumidores conscientes para um futuro mais sustentável
          </motion.p>
          <motion.div
            className="hero-cta"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
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

      <div className="container">
        <section className="stats-section">
          <div className="stats-grid">
            <StatItem
              icon={FiTrendingUp}
              value={`+${Math.max(500, lojas.length * 3)}`}
              title="Impacto Social"
              description="Clientes beneficiados"
            />
            <StatItem
              icon={FiShoppingBag}
              value={`+${Math.max(50, lojas.length * 2)}`}
              title="Empreendedores"
              description="Negócios fortalecidos"
            />
            <StatItem
              icon={FiUsers}
              value={`+${Math.max(20, Math.floor(lojas.length / 2))}`}
              title="Comunidades"
              description="Regiões atendidas"
            />
          </div>
        </section>

        <motion.section
          className="premium-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Destaques Premium</h2>
          <p className="section-subtitle">
            Conheça os empreendimentos em destaque da nossa rede
          </p>
          
          <div className="premium-carousel">
            <Slider {...carouselSettings}>
              {lojasPremium.map((loja) => (
                <PremiumCard key={loja.id} loja={loja} />
              ))}
            </Slider>
          </div>
        </motion.section>

        <motion.section
          className="essential-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Parceiros Essenciais</h2>
          <p className="section-subtitle">
            Descubra mais negócios de qualidade em nossa comunidade
          </p>
          
          <div className="essential-grid">
            {lojasEssentialDisplay.map((loja) => (
              <EssentialCard key={loja.id} loja={loja} />
            ))}
          </div>
        </motion.section>

        <section className="cta-section">
          <div className="cta-content">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Faça Parte da Nossa Rede
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Cadastre seu negócio e faça parte desta comunidade que cresce a cada dia
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/register-business" className="cta-button">
                Começar Agora
                <BsArrowRight className="icon-right" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;