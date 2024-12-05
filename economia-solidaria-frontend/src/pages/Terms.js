import React from "react";
import { Link } from "react-router-dom";
import "../styles/terms.css"; // Importa o arquivo de estilo

const Terms = () => {
  return (
    <div className="terms-container">
      <header className="terms-header">
        <h1>Termos e Condições</h1>
        <p>
          Ao acessar e utilizar nossos serviços, você concorda com os
          Termos e Condições abaixo descritos. Por favor, leia atentamente.
        </p>
      </header>

      <section className="terms-content">
        <h2>1. Aceitação dos Termos</h2>
        <p>
          Ao acessar e utilizar os nossos serviços, você concorda com os
          Termos e Condições abaixo descritos. Caso não concorde com qualquer
          parte desses termos, você não deve utilizar nossos serviços.
        </p>

        <h2>2. Uso Permitido</h2>
        <p>
          Você concorda em usar nossos serviços apenas para fins legais e em
          conformidade com as leis locais. É proibido o uso indevido dos
          nossos serviços para qualquer atividade ilícita.
        </p>

        <h2>3. Limitação de Responsabilidade</h2>
        <p>
          Não nos responsabilizamos por danos diretos ou indiretos que
          possam ocorrer em decorrência do uso de nossa plataforma, incluindo
          perdas financeiras, perda de dados ou falhas de segurança.
        </p>

        <h2>4. Alterações nos Termos</h2>
        <p>
          Reservamo-nos o direito de modificar os Termos e Condições a
          qualquer momento. Recomendamos que você revise esta página
          periodicamente para se manter atualizado.
        </p>

        <h2>5. Contato</h2>
        <p>
          Se você tiver dúvidas sobre os nossos Termos e Condições, entre
          em contato conosco por meio de nossos canais de atendimento.
        </p>
      </section>

      <div className="terms-footer">
        <Link to="/" className="back-button">Voltar para a Página Inicial</Link>
      </div>
    </div>
  );
};

export default Terms;
