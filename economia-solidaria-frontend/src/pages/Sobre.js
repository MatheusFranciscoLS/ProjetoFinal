import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaHandHoldingHeart,
  FaUsers,
  FaChartLine,
  FaStoreAlt,
  FaMapMarkedAlt,
  FaHandshake,
  FaShoppingCart,
  FaCreditCard,
  FaLightbulb,
  FaLeaf,
  FaQuestionCircle,
  FaGlobe,
  FaHeart,
  FaComments
} from 'react-icons/fa';
import '../styles/sobre.css';

const About = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const highlights = [
    {
      icon: <FaStoreAlt />,
      title: "Comércio Local",
      description: "Fortalecemos o comércio de Limeira, conectando produtores e consumidores da nossa cidade"
    },
    {
      icon: <FaHandHoldingHeart />,
      title: "Impacto Social",
      description: "Contribuímos para o desenvolvimento econômico e social de Limeira através da economia solidária"
    },
    {
      icon: <FaChartLine />,
      title: "Crescimento Regional",
      description: "Incentivamos o crescimento sustentável dos pequenos negócios limeirenses"
    }
  ];

  const stats = [
    { 
      icon: <FaUsers />, 
      value: "100+", 
      label: "Empreendedores",
      description: "Pequenos negócios de Limeira em nossa plataforma"
    },
    { 
      icon: <FaMapMarkedAlt />, 
      value: "15+", 
      label: "Bairros",
      description: "Regiões de Limeira beneficiadas"
    },
    { 
      icon: <FaHandshake />, 
      value: "500+", 
      label: "Parcerias",
      description: "Conexões entre produtores e consumidores locais"
    }
  ];

  const faqItems = [
    {
      icon: <FaShoppingCart />,
      question: "Como participar do marketplace em Limeira?",
      answer: "Cadastre seu negócio local, complete seu perfil com produtos ou serviços e comece a participar da rede de economia solidária de Limeira. Oferecemos suporte para maximizar sua visibilidade na cidade."
    },
    {
      icon: <FaCreditCard />,
      question: "Quais são as formas de pagamento?",
      answer: "Aceitamos diversas formas de pagamento para facilitar as transações locais, incluindo cartões, transferências e até mesmo trocas diretas entre membros da comunidade limeirense."
    },
    {
      icon: <FaLightbulb />,
      question: "Como potencializar meu negócio local?",
      answer: "Oferecemos ferramentas de gestão e capacitações específicas para o mercado de Limeira, ajudando seu negócio a crescer de forma sustentável dentro da economia local."
    },
    {
      icon: <FaLeaf />,
      question: "Como funciona a sustentabilidade?",
      answer: "Promovemos práticas sustentáveis em Limeira, incentivando a economia circular e o comércio justo. Nossos membros têm acesso a orientações para implementar iniciativas ecológicas."
    }
  ];

  const accordionItems = [
    {
      icon: <FaGlobe />,
      title: "Economia Local",
      content: "Fortalecemos a economia de Limeira através de uma rede de colaboração onde produtores, consumidores e prestadores de serviços se conectam diretamente, promovendo o desenvolvimento local."
    },
    {
      icon: <FaLeaf />,
      title: "Sustentabilidade",
      content: "Incentivamos práticas comerciais sustentáveis que beneficiam nossa cidade, preservando o meio ambiente e garantindo um futuro melhor para Limeira."
    },
    {
      icon: <FaComments />,
      title: "Comunicação Local",
      content: "Facilitamos o diálogo direto entre produtores e consumidores limeirenses, criando relações de confiança e fortalecendo os laços da nossa comunidade."
    },
    {
      icon: <FaHeart />,
      title: "Desenvolvimento Regional",
      content: "Impulsionamos o crescimento da economia de Limeira através de ferramentas digitais e práticas que valorizam os pequenos negócios e produtores locais."
    },
    {
      icon: <FaUsers />,
      title: "Inclusão Social",
      content: "Promovemos a inclusão de todos os setores da sociedade limeirense, garantindo oportunidades iguais e acesso justo ao mercado local para todos os empreendedores."
    },
    {
      icon: <FaHandshake />,
      title: "Parcerias Locais",
      content: "Construímos uma rede sólida de parcerias entre empresas, instituições e comunidade de Limeira, fortalecendo o ecossistema empreendedor da cidade."
    }
  ];

  return (
    <div className="sobre-main-container">
      <section className="sobre-hero-section">
        <div className="sobre-hero-content">
          <h1>Transformando o Comércio de Limeira</h1>
          <p className="sobre-hero-text">
            A <strong>Economia Solidária</strong> é uma plataforma que conecta 
            empreendedores e consumidores de Limeira, fortalecendo o ecossistema 
            de negócios local através de tecnologia e colaboração.
          </p>
        </div>
      </section>

      <section className="sobre-highlights-section">
        {highlights.map((highlight, index) => (
          <div key={index} className="sobre-highlight-card">
            <div className="sobre-highlight-icon">{highlight.icon}</div>
            <h3>{highlight.title}</h3>
            <p>{highlight.description}</p>
          </div>
        ))}
      </section>

      <section className="sobre-stats-section">
        {stats.map((stat, index) => (
          <div key={index} className="sobre-stat-card">
            <div className="sobre-stat-icon">{stat.icon}</div>
            <h3 className="sobre-stat-number">{stat.value}</h3>
            <p className="sobre-stat-label">{stat.label}</p>
            <p>{stat.description}</p>
          </div>
        ))}
      </section>

      <section className="sobre-about-section">
        <div className="sobre-mission-container">
          <h2>
            <FaHandshake className="sobre-section-icon" /> Nossa Missão
          </h2>
          <p className="sobre-mission-text">
            Capacitamos empreendedores locais através de uma plataforma digital inovadora,
            promovendo crescimento sustentável e fortalecendo laços comunitários. Nossa visão
            é criar um ecossistema de negócios próspero e colaborativo.
          </p>
        </div>

        <div className="sobre-values-container">
          <h2>
            <FaLeaf className="sobre-section-icon" /> Nossos Valores
          </h2>
          <div className="sobre-values-grid">
            {accordionItems.map((item, index) => (
              <div key={index} className="sobre-value-card">
                <div className="sobre-value-header">
                  <div className="sobre-value-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                </div>
                <p>{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sobre-faq-section">
        <div className="sobre-faq-header">
          <FaQuestionCircle className="sobre-faq-icon" />
          <h2>Perguntas Frequentes</h2>
        </div>
        <div className="sobre-faq-grid">
          {faqItems.map((item, index) => (
            <div key={index} className="sobre-faq-card">
              <div className="sobre-faq-card-icon">{item.icon}</div>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
