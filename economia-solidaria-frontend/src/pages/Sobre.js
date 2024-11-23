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
            É simples! Cadastre sua empresa na nossa plataforma e escolha o
            plano que melhor se adapta às suas necessidades para aumentar sua
            visibilidade.
          </p>

          <h3>Por que anunciar conosco?</h3>
          <p>
            Somos uma plataforma acessível para pequenos empreendedores e
            prestadores de serviços que desejam aumentar sua visibilidade e
            atrair mais clientes locais.
          </p>

          <h3>Como me destacar nos anúncios?</h3>
          <p>
            O aplicativo é gratuito para todos, mas ao escolher um de nossos
            planos pagos, você poderá garantir maior destaque e visibilidade
            para o seu negócio.
          </p>

          <h3>Quais são os benefícios dos planos pagos?</h3>
          <p>
            Os planos pagos oferecem vantagens como maior destaque nos
            resultados de busca, visibilidade em áreas exclusivas e
            funcionalidades personalizadas para ajudar a aumentar o alcance do
            seu negócio.
          </p>
        </div>
      </div>

      {/* Quadrado "Sobre Nós" no centro */}
      <div className="about-container">
        <h1>Sobre Nós</h1>
        <p>
          Bem-vindo à <strong>Economia Solidária</strong>, uma plataforma que
          promove a colaboração e fortalece os negócios locais. Nosso objetivo é
          conectar empreendedores e consumidores para impulsionar a economia
          compartilhada e o bem-estar da comunidade local.
        </p>

        <h2>Missão</h2>
        <p>
          Criamos um espaço digital inclusivo e sustentável, onde todos podem
          colaborar de forma justa, promovendo a economia solidária nas
          comunidades locais.
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
                Valorizamos a colaboração entre empreendedores locais,
                acreditando que, juntos, podemos fortalecer a economia da nossa
                cidade e apoiar um ao outro no crescimento dos negócios.
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
                Promovemos práticas sustentáveis que visam não apenas o sucesso
                dos negócios, mas também o bem-estar do meio ambiente e o
                fortalecimento da economia local para as próximas gerações.
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
                Acreditamos que a inovação deve ser acessível a todos os
                empreendedores, oferecendo soluções simples e eficazes que
                ajudem os pequenos negócios a se destacarem e se manterem
                competitivos.
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
                A plataforma promove a inclusão, garantindo que todos,
                independentemente do porte ou segmento, possam acessar
                oportunidades de crescimento no mercado local e beneficiar-se da
                economia solidária.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
