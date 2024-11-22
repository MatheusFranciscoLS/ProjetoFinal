import React from "react";
import "../styles/sobre.css";

const About = () => {
  return (
    <div className="about-container">
      <h1>Sobre Nós</h1>
      <p>
        Bem-vindo à plataforma <strong>Economia Solidária</strong>, um espaço dedicado a promover a
        colaboração, sustentabilidade e o empoderamento comunitário. Nosso objetivo é conectar
        pessoas e organizações em uma rede que prioriza a economia compartilhada e o bem-estar
        coletivo.
      </p>
      <h2>Missão</h2>
      <p>
        Nossa missão é criar um ambiente inclusivo que permita aos usuários colaborarem de forma
        justa e sustentável, incentivando práticas de economia solidária em suas comunidades.
      </p>
      <h2>Valores</h2>
      <ul>
        <li>Colaboração</li>
        <li>Sustentabilidade</li>
        <li>Inovação</li>
        <li>Inclusão</li>
      </ul>
    </div>
  );
};

export default About;
