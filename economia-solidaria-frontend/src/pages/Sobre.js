import React, { useState } from "react";
import "../styles/sobre.css";
import { FaQuestionCircle, FaHandshake, FaLeaf, FaLightbulb, FaUsers, FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const About = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleAccordionToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const faqItems = [
    {
      icon: <FaHandshake />,
      question: "Como participar?",
      answer: "É simples! Cadastre sua empresa na nossa plataforma e escolha o plano que melhor se adapta às suas necessidades para aumentar sua visibilidade."
    },
    {
      icon: <FaLightbulb />,
      question: "Por que anunciar conosco?",
      answer: "Somos uma plataforma acessível para pequenos empreendedores e prestadores de serviços que desejam aumentar sua visibilidade e atrair mais clientes locais."
    },
    {
      icon: <FaUsers />,
      question: "Como me destacar nos anúncios?",
      answer: "O aplicativo é gratuito para todos, mas ao escolher um de nossos planos pagos, você poderá garantir maior destaque e visibilidade para o seu negócio."
    },
    {
      icon: <FaLeaf />,
      question: "Quais são os benefícios dos planos pagos?",
      answer: "Os planos pagos oferecem vantagens como maior destaque nos resultados de busca, visibilidade em áreas exclusivas e funcionalidades personalizadas para ajudar a aumentar o alcance do seu negócio."
    }
  ];

  const accordionItems = [
    {
      icon: <FaHandshake />,
      title: "Colaboração",
      content: "Valorizamos a colaboração entre empreendedores locais, acreditando que, juntos, podemos fortalecer a economia da nossa cidade e apoiar um ao outro no crescimento dos negócios."
    },
    {
      icon: <FaLeaf />,
      title: "Sustentabilidade",
      content: "Promovemos práticas sustentáveis que visam não apenas o sucesso dos negócios, mas também o bem-estar do meio ambiente e o fortalecimento da economia local para as próximas gerações."
    },
    {
      icon: <FaLightbulb />,
      title: "Inovação",
      content: "Acreditamos que a inovação deve ser acessível a todos os empreendedores, oferecendo soluções simples e eficazes que ajudem os pequenos negócios a se destacarem e se manterem competitivos."
    },
    {
      icon: <FaUsers />,
      title: "Inclusão",
      content: "A plataforma promove a inclusão, garantindo que todos, independentemente do porte ou segmento, possam acessar oportunidades de crescimento no mercado local e beneficiar-se da economia solidária."
    }
  ];

  return (
    <motion.div 
      className="main-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="faq-box-container"
        variants={itemVariants}
      >
        <div className="faq-box">
          <FaQuestionCircle className="faq-icon" />
        </div>
        <h2 className="faq-title">Dúvidas Frequentes</h2>
        <motion.div 
          className="faq-content"
          variants={containerVariants}
        >
          {faqItems.map((item, index) => (
            <motion.div 
              key={index}
              className="faq-item"
              variants={itemVariants}
              whileHover={{ x: 10, transition: { duration: 0.2 } }}
            >
              <h3>
                <span className="faq-item-icon">{item.icon}</span>
                {item.question}
              </h3>
              <p>{item.answer}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div 
        className="about-container"
        variants={itemVariants}
      >
        <motion.h1 variants={itemVariants}>
          Sobre Nós
        </motion.h1>
        <motion.p variants={itemVariants}>
          Bem-vindo à <strong>Economia Solidária</strong>, uma plataforma que
          promove a colaboração e fortalece os negócios locais. Nosso objetivo é
          conectar empreendedores e consumidores para impulsionar a economia
          compartilhada e o bem-estar da comunidade local.
        </motion.p>

        <motion.h2 variants={itemVariants}>
          <FaHandshake className="section-icon" /> Missão
        </motion.h2>
        <motion.p variants={itemVariants}>
          Criamos um espaço digital inclusivo e sustentável, onde todos podem
          colaborar de forma justa, promovendo a economia solidária nas
          comunidades locais.
        </motion.p>

        <motion.h2 variants={itemVariants}>
          <FaLeaf className="section-icon" /> Valores
        </motion.h2>
        <motion.div 
          className="accordion"
          variants={containerVariants}
        >
          {accordionItems.map((item, index) => (
            <motion.div
              key={index}
              className="accordion-item"
              variants={itemVariants}
              whileHover={{ x: 10, transition: { duration: 0.2 } }}
            >
              <div 
                className="accordion-header" 
                onClick={() => handleAccordionToggle(index)}
              >
                <div className="header-content">
                  <span className="accordion-item-icon">{item.icon}</span>
                  {item.title}
                </div>
                <motion.div
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaChevronDown />
                </motion.div>
              </div>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    className="accordion-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {item.content}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default About;
