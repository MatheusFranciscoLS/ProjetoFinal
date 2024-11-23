import React, { useState } from "react";
import "../styles/sobre.css";

const About = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleAccordionToggle = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null); // Fecha o item se ele já estiver aberto
    } else {
      setActiveIndex(index); // Abre o item
    }
  };

  return (
    <div className="main-container">
      {/* Quadrado de Dúvidas Frequentes à esquerda */}
      <div className="faq-box-container">
        <div className="faq-box">?</div>
        <h2 className="faq-title">Dúvidas Frequentes</h2>
        <div className="faq-content">
          <h3>Como participar?</h3>
          <p>
            É simples! Crie um cadastro da sua empresa e escolha o plano que
            melhor atende às suas necessidades.
          </p>

          <h3>Por que anunciar conosco?</h3>
          <p>
            Somos uma plataforma acessível para pequenos empresários e
            prestadores de serviços que buscam maior visibilidade online.
          </p>

          <h3>Como me destacar nos anúncios?</h3>
          <p>
            O site é gratuito para todos, mas com nossos planos você ganha maior
            destaque de acordo com a sua escolha.
          </p>
          <h3>Quais são os benefícios dos planos pagos?</h3>
          <p>
            Os planos pagos oferecem recursos extras, como destaque nos
            resultados de busca, mais visibilidade nas páginas e opções
            personalizadas para melhorar o alcance dos seus anúncios.
          </p>
        </div>
      </div>

      {/* Quadrado "Sobre Nós" no centro */}
      <div className="about-container">
        <h1>Sobre Nós</h1>
        <p>
          Bem-vindo à <strong>Economia Solidária</strong>, uma plataforma
          dedicada à promoção da colaboração, sustentabilidade e empoderamento
          comunitário. Conectamos pessoas e organizações para fortalecer a
          economia compartilhada e o bem-estar coletivo.
        </p>
        <h2>Missão</h2>
        <p>
          Criamos um ambiente inclusivo, onde os usuários colaboram de forma
          justa e sustentável, incentivando práticas de economia solidária em
          suas comunidades.
        </p>

        <h2>Valores</h2>
        <div className="accordion">
          {/* Acordeão de valores */}
          <div className="accordion-item">
            <h3
              className="accordion-header"
              onClick={() => handleAccordionToggle(0)}
            >
              Colaboração
              <span
                className={`accordion-icon ${
                  activeIndex === 0 ? "rotate" : ""
                }`}
              >
                &#9660; {/* Seta para baixo */}
              </span>
            </h3>
            {activeIndex === 0 && (
              <div className="accordion-content">
                Promovemos o trabalho conjunto, onde todos se ajudam para
                alcançar objetivos comuns.
              </div>
            )}
          </div>
          <div className="accordion-item">
            <h3
              className="accordion-header"
              onClick={() => handleAccordionToggle(1)}
            >
              Sustentabilidade
              <span
                className={`accordion-icon ${
                  activeIndex === 1 ? "rotate" : ""
                }`}
              >
                &#9660; {/* Seta para baixo */}
              </span>
            </h3>
            {activeIndex === 1 && (
              <div className="accordion-content">
                Priorizamos práticas que protejam o meio ambiente e garantam um
                futuro melhor para as próximas gerações.
              </div>
            )}
          </div>
          <div className="accordion-item">
            <h3
              className="accordion-header"
              onClick={() => handleAccordionToggle(2)}
            >
              Inovação
              <span
                className={`accordion-icon ${
                  activeIndex === 2 ? "rotate" : ""
                }`}
              >
                &#9660; {/* Seta para baixo */}
              </span>
            </h3>
            {activeIndex === 2 && (
              <div className="accordion-content">
                Buscamos sempre novas soluções que melhorem a qualidade de vida
                e promovam o bem-estar coletivo.
              </div>
            )}
          </div>
          <div className="accordion-item">
            <h3
              className="accordion-header"
              onClick={() => handleAccordionToggle(3)}
            >
              Inclusão
              <span
                className={`accordion-icon ${
                  activeIndex === 3 ? "rotate" : ""
                }`}
              >
                &#9660; {/* Seta para baixo */}
              </span>
            </h3>
            {activeIndex === 3 && (
              <div className="accordion-content">
                Valorizamos a participação de todos, independentemente de sua
                origem ou condição.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
