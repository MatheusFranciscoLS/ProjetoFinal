import React, { useState } from "react";
import "../styles/contato.css";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState(""); // Novo estado para o campo de seleção
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage("Obrigado por entrar em contato! Responderemos em breve.");
    setName("");
    setEmail("");
    setMessage("");
    setSubject(""); // Limpar o campo de assunto após o envio
  };

  return (
    <div className="contact-container">
      <h1>Contato</h1>
      <p>Entre em contato conosco preenchendo o formulário abaixo.</p>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Seu Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Seu Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <textarea
          placeholder="Sua Mensagem"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>

        {/* Campo de seleção para o motivo do contato */}
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)} // Atualiza o estado do assunto
          required
        >
          <option value="">Selecione o motivo do contato</option>
          <option value="duvida">Dúvida</option>
          <option value="patrocinio">Patrocínio</option>
          <option value="parceria">Parceria</option>
          <option value="outro">Outro</option>
        </select>

        <button type="submit">Enviar</button>
      </form>
    </div>
  );
};

export default Contact;
