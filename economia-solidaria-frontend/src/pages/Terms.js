import React from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaBook,
  FaShieldAlt,
  FaUserCheck,
  FaExclamationTriangle,
  FaBell,
  FaEnvelope,
  FaLock,
  FaHandshake,
  FaUserFriends,
  FaGavel,
  FaCookie
} from "react-icons/fa";
import "../styles/terms.css";

const Terms = () => {
  const sections = [
    {
      icon: <FaUserCheck />,
      title: "1. Aceitação dos Termos",
      content: "Ao acessar e utilizar os nossos serviços, você concorda com os Termos e Condições abaixo descritos. Caso não concorde com qualquer parte desses termos, você não deve utilizar nossos serviços. É importante ler atentamente todas as condições antes de prosseguir."
    },
    {
      icon: <FaBook />,
      title: "2. Uso Permitido",
      content: "Você concorda em usar nossos serviços apenas para fins legais e em conformidade com as leis locais. É proibido o uso indevido dos nossos serviços para qualquer atividade ilícita. Nossa plataforma deve ser utilizada de forma ética e respeitosa com todos os usuários."
    },
    {
      icon: <FaShieldAlt />,
      title: "3. Limitação de Responsabilidade",
      content: "Não nos responsabilizamos por danos diretos ou indiretos que possam ocorrer em decorrência do uso de nossa plataforma, incluindo perdas financeiras, perda de dados ou falhas de segurança. Recomendamos que você mantenha seus dados seguros e atualizados."
    },
    {
      icon: <FaLock />,
      title: "4. Privacidade e Segurança",
      content: "Protegemos seus dados pessoais de acordo com nossa Política de Privacidade. Utilizamos medidas de segurança adequadas para proteger suas informações, mas você também é responsável por manter suas credenciais de acesso seguras."
    },
    {
      icon: <FaHandshake />,
      title: "5. Regras de Conduta",
      content: "Esperamos que todos os usuários mantenham um comportamento respeitoso e profissional. Não é permitido assédio, discriminação ou qualquer forma de conduta prejudicial à comunidade. Violações podem resultar em suspensão ou banimento."
    },
    {
      icon: <FaUserFriends />,
      title: "6. Interações Comunitárias",
      content: "Nossa plataforma promove interações positivas entre usuários. Incentivamos a colaboração e o respeito mútuo. Mantenha suas interações profissionais e construtivas para o benefício de toda a comunidade."
    },
    {
      icon: <FaGavel />,
      title: "7. Resolução de Conflitos",
      content: "Em caso de disputas, tentaremos resolver de forma amigável através de nossos canais de suporte. Se necessário, seguiremos os procedimentos legais aplicáveis de acordo com a legislação brasileira."
    },
    {
      icon: <FaCookie />,
      title: "8. Uso de Cookies",
      content: "Utilizamos cookies e tecnologias similares para melhorar sua experiência. Ao usar nossa plataforma, você concorda com o uso dessas tecnologias conforme descrito em nossa Política de Cookies."
    },
    {
      icon: <FaBell />,
      title: "9. Alterações nos Termos",
      content: "Reservamo-nos o direito de modificar os Termos e Condições a qualquer momento. Recomendamos que você revise esta página periodicamente para se manter atualizado sobre quaisquer mudanças."
    },
    {
      icon: <FaEnvelope />,
      title: "10. Contato",
      content: "Se você tiver dúvidas sobre os nossos Termos e Condições, entre em contato conosco por meio de nossos canais de atendimento. Estamos aqui para ajudar e esclarecer qualquer questão."
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
            Bem-vindo aos Termos e Condições da Economia Solidária. Este documento
            estabelece as regras e diretrizes para o uso de nossa plataforma.
            Por favor, leia atentamente antes de utilizar nossos serviços.
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
          <p className="terms-update">Última atualização: Novembro 2024</p>
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
