import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/home.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import {
  FaStore,
  FaHandshake,
  FaStar,
  FaUsers,
  FaInfoCircle,
  FaBook,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { FiTrendingUp, FiUsers, FiShoppingBag } from 'react-icons/fi';
import { FaHandHoldingHeart, FaChartLine, FaQuoteLeft, FaShieldAlt, FaQuestion, FaArrowRight } from 'react-icons/fa';

// Componente para o cartão de cada loja
const LojaCard = ({ loja, isPremium = false }) => {
  const { nome, descricao, imagens, id, categoria } = loja;
  const cardClassName = `${isPremium ? 'premium-card' : 'loja-card'}`;
  
  return (
    <Link to={`/loja/${id}`} className={cardClassName}>
      <div className="card-image">
        <img
          src={imagens?.[0] || "default-image.jpg"}
          alt={nome}
          className="card-img"
        />
        {isPremium && (
          <div className="premium-badge">
            <FaStar /> Premium
          </div>
        )}
      </div>
      <div className="card-content" style={{ height: '150px', overflow: 'hidden' }}>
        <div>
          <h3>{nome}</h3>
          {categoria && <span className="categoria-tag">{categoria}</span>}
          <p className="card-description" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{descricao}</p>
        </div>
        <div className="card-footer">
          <button className="ver-mais-btn">
            Ver mais <FaArrowRight />
          </button>
        </div>
      </div>
    </Link>
  );
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const Home = () => {
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lojasEssentialDisplay, setLojasEssentialDisplay] = useState([]);

  // Configurações do carrossel com melhorias de acessibilidade
  const carouselSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    pauseOnHover: true,
    accessibility: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
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
            }
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

        return prioridadeA - prioridadeB;
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
    const updateDisplayedCards = () => {
      const shuffledLojas = [...lojasEssential].sort(() => 0.5 - Math.random());
      const displayCount = Math.min(3, shuffledLojas.length);
      setLojasEssentialDisplay(shuffledLojas.slice(0, displayCount));
    };

    updateDisplayedCards();
    const interval = lojasEssential.length > 3 ? setInterval(updateDisplayedCards, 5000) : null;
    return () => interval && clearInterval(interval);
  }, [lojas]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
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
            Conectando empreendedores e consumidores conscientes para um futuro
            mais sustentável
          </motion.p>
          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link to="/register-business" className="cta-button primary">
              <FaHandshake className="button-icon" />
              Cadastre seu Negócio
            </Link>
            <Link to="/lojas" className="cta-button secondary">
              <FaStore className="button-icon" />
              Explorar Lojas
            </Link>
            <Link to="/sobre" className="cta-button tertiary">
              <FaInfoCircle className="button-icon" />
              Saiba Mais
            </Link>
          </motion.div>
        </div>
        <div className="hero-pattern"></div>
      </motion.section>

      <motion.section
        className="stats-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              delayChildren: 0.3,
              staggerChildren: 0.2,
            },
          },
        }}
      >
        <div className="section-header">
          <h2>Impacto na Comunidade</h2>
          <p>Juntos estamos construindo uma economia mais justa e solidária</p>
        </div>
        <div className="stats-grid">
          <motion.div className="stat-item" variants={fadeInUp}>
            <div className="stat-icon">
              <FiTrendingUp />
            </div>
            <div className="stat-info">
              <h3>+{Math.max(800, lojas.length * 3)}</h3>
              <h4>Impacto Social</h4>
              <p>Clientes beneficiados</p>
            </div>
          </motion.div>

          <motion.div className="stat-item" variants={fadeInUp}>
            <div className="stat-icon">
              <FiShoppingBag />
            </div>
            <div className="stat-info">
              <h3>+{Math.max(100, lojas.length * 2)}</h3>
              <h4>Empreendedores</h4>
              <p>Negócios fortalecidos</p>
            </div>
          </motion.div>

          <motion.div className="stat-item" variants={fadeInUp}>
            <div className="stat-icon">
              <FiUsers />
            </div>
            <div className="stat-info">
              <h3>+{Math.max(30, Math.floor(lojas.length / 2))}</h3>
              <h4>Comunidades</h4>
              <p>Regiões atendidas</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {lojasPremium.length > 0 && (
        <section className="premium-section">
          <div className="section-header">
            <h2>Empreendimentos Premium</h2>
            <p>Conheça nossos parceiros em destaque</p>
          </div>
          <div className="premium-carousel-container">
            <Slider {...carouselSettings}>
              {lojasPremium.map((loja) => (
                <div key={loja.id} className="card-wrapper">
                  <LojaCard loja={loja} isPremium={true} />
                </div>
              ))}
            </Slider>
          </div>
        </section>
      )}

      <motion.section
        className="essential-section"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="section-header">
          <h2>Parceiros Essenciais</h2>
          <p>Descubra mais negócios de qualidade em nossa comunidade</p>
        </div>

        <div className="essential-grid">
          {lojasEssentialDisplay.map((loja, index) => (
            <motion.div
              key={loja.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2 }}
              className="card-wrapper"
            >
              <Link to={`/loja/${loja.id}`} className="essential-card">
                <div className="card-image">
                  <img
                    src={loja.imagens?.[0] || "/placeholder-image.jpg"}
                    alt={loja.nome}
                    onError={(e) => {
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                  <div className="essential-badge">
                    <FaHandshake /> Essencial
                  </div>
                </div>
                <div
                  className="card-content"
                  style={{ height: "150px", overflow: "hidden" }}
                >
                  <h3>{loja.nome}</h3>
                  {loja.categoria && (
                    <span className="categoria-tag">{loja.categoria}</span>
                  )}
                  <p
                    className="card-description"
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {loja.descricao}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="features-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="section-header">
          <h2>Por que participar?</h2>
          <p>Descubra os benefícios de fazer parte da nossa rede</p>
        </div>
        <div className="features-grid">
          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon">
              <FaHandHoldingHeart />
            </div>
            <h3>Impacto Social</h3>
            <p>
              Fortaleça a economia local e contribua para o desenvolvimento da
              comunidade
            </p>
          </motion.div>

          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="feature-icon">
              <FaUsers />
            </div>
            <h3>Networking</h3>
            <p>
              Conecte-se com outros empreendedores e expanda sua rede de
              contatos
            </p>
          </motion.div>

          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="feature-icon">
              <FaChartLine />
            </div>
            <h3>Crescimento</h3>
            <p>
              Alcance mais clientes e desenvolva seu negócio de forma
              sustentável
            </p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="testimonials-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="section-header">
          <h2>O que dizem nossos parceiros</h2>
          <p>Histórias de sucesso da nossa comunidade</p>
        </div>
        <div className="testimonials-grid">
          <motion.div
            className="testimonial-card"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="testimonial-content">
              <FaQuoteLeft className="quote-icon" />
              <p>
                "A plataforma me ajudou a conectar com outros empreendedores e
                expandir meu negócio de forma significativa."
              </p>
            </div>
            <div className="testimonial-author">
              <img
                src="/avatar1.jpg"
                alt="Maria Silva"
                onError={(e) =>
                  (e.target.src = "https://via.placeholder.com/50")
                }
              />
              <div>
                <h4>Maria Silva</h4>
                <p>Artesã</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="testimonial-card"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="testimonial-content">
              <FaQuoteLeft className="quote-icon" />
              <p>
                "Graças à Economia Solidária, consegui aumentar minha
                visibilidade e fazer parte de uma rede de apoio incrível."
              </p>
            </div>
            <div className="testimonial-author">
              <img
                src="/avatar2.jpg"
                alt="João Santos"
                onError={(e) =>
                  (e.target.src = "https://via.placeholder.com/50")
                }
              />
              <div>
                <h4>João Santos</h4>
                <p>Produtor Local</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="faq-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="section-header">
          <h2>Perguntas Frequentes</h2>
          <p>Tire suas dúvidas sobre nossa plataforma</p>
        </div>
        <div className="faq-grid">
          <motion.div
            className="faq-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3>
              <FaQuestion className="faq-icon" /> Como posso cadastrar meu
              negócio?
            </h3>
            <p>
              O cadastro é simples e gratuito. Basta clicar no botão "Cadastre
              seu Negócio" e seguir as instruções.
            </p>
          </motion.div>

          <motion.div
            className="faq-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3>
              <FaStar className="faq-icon" /> Quais são os benefícios do plano
              Premium?
            </h3>
            <p>
              O plano Premium oferece maior visibilidade, destaque nas buscas e
              ferramentas exclusivas para crescimento.
            </p>
          </motion.div>

          <motion.div
            className="faq-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h3>
              <FaShieldAlt className="faq-icon" /> Como garantem a segurança dos
              dados?
            </h3>
            <p>
              Utilizamos tecnologias avançadas de criptografia e seguimos
              rigorosos padrões de segurança.
            </p>
          </motion.div>
        </div>
      </motion.section>

      <section className="partners-section">
        <div className="section-header">
          <h2>Nossos Parceiros Institucionais</h2>
          <p>Instituições que apoiam e fortalecem nossa iniciativa</p>
        </div>
        <div className="partners-container">
          <div className="partner-item">
            <img 
              src={require("../assets/senai.jpeg")} 
              alt="SENAI" 
              className="partner-logo"
            />
            <div className="partner-name">SENAI</div>
          </div>
          <div className="partner-item">
            <img 
              src={require("../assets/sesi.jpg")} 
              alt="SESI" 
              className="partner-logo"
            />
            <div className="partner-name">SESI</div>
          </div>
          <div className="partner-item">
            <img 
              src={require("../assets/prefeitura_limeira.png")} 
              alt="Prefeitura de Limeira" 
              className="partner-logo"
            />
            <div className="partner-name">Prefeitura de Limeira</div>
          </div>
          <div className="partner-item">
            <img 
              src={require("../assets/govsp.jpg")} 
              alt="Governo de SP" 
              className="partner-logo"
            />
            <div className="partner-name">Governo de SP</div>
          </div>
        </div>
      </section>

      <motion.section
        className="cta-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
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
            Cadastre seu negócio e faça parte desta comunidade que cresce a cada
            dia
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="cta-buttons"
          >
            <Link to="/register-business" className="cta-button primary">
              Começar Agora
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;