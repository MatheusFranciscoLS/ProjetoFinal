import React, { useState } from "react";
import "../styles/contato.css";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage("Obrigado por entrar em contato! Responderemos em breve.");
    setName("");
    setEmail("");
    setMessage("");
    setSubject("");
  };

  return (
    <div className="contact-container">
      <h2>Contato</h2>
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
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        >
          <option value="">Selecione o motivo do contato</option>
          <option value="duvida">Dúvidas gerais sobre a plataforma</option>
          <option value="feedback">Feedback para melhoria do site</option>
          <option value="parceria">Interesse em parcerias ou colaborações</option>
          <option value="problema">Relatar um problema ou erro técnico</option>
          <option value="outro">Outras questões</option>
        </select>
        {successMessage && <p className="success-message">{successMessage}</p>}
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
};

export default Contact;
