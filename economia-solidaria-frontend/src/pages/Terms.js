import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaBook, FaShieldAlt, FaUserCheck, FaExclamationTriangle, FaBell, FaEnvelope } from "react-icons/fa";
import "../styles/terms.css";

const Terms = () => {
  const sections = [
    {
      icon: <FaUserCheck />,
      title: "1. Aceitação dos Termos",
      content: "Ao acessar e utilizar os nossos serviços, você concorda com os Termos e Condições abaixo descritos. Caso não concorde com qualquer parte desses termos, você não deve utilizar nossos serviços."
    },
    {
      icon: <FaBook />,
      title: "2. Uso Permitido",
      content: "Você concorda em usar nossos serviços apenas para fins legais e em conformidade com as leis locais. É proibido o uso indevido dos nossos serviços para qualquer atividade ilícita."
    },
    {
      icon: <FaShieldAlt />,
      title: "3. Limitação de Responsabilidade",
      content: "Não nos responsabilizamos por danos diretos ou indiretos que possam ocorrer em decorrência do uso de nossa plataforma, incluindo perdas financeiras, perda de dados ou falhas de segurança."
    },
    {
      icon: <FaBell />,
      title: "4. Alterações nos Termos",
      content: "Reservamo-nos o direito de modificar os Termos e Condições a qualquer momento. Recomendamos que você revise esta página periodicamente para se manter atualizado."
    },
    {
      icon: <FaEnvelope />,
      title: "5. Contato",
      content: "Se você tiver dúvidas sobre os nossos Termos e Condições, entre em contato conosco por meio de nossos canais de atendimento."
    }
  ];

  return (
    <div className="terms-container">
      <div className="terms-content">
        <header className="terms-header">
          <h1>
            <FaBook className="header-icon" />
            Termos e Condições
          </h1>
          <p>
            Ao acessar e utilizar nossos serviços, você concorda com os
            Termos e Condições abaixo descritos. Por favor, leia atentamente.
          </p>
        </header>

        <div className="terms-sections">
          {sections.map((section, index) => (
            <section key={index} className="terms-section">
              <div className="section-icon">{section.icon}</div>
              <div className="section-content">
                <h2>{section.title}</h2>
                <p>{section.content}</p>
              </div>
            </section>
          ))}
        </div>

        <div className="terms-footer">
          <Link to="/" className="terms-link">
            <FaArrowLeft />
            <span>Voltar para a Página Inicial</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
