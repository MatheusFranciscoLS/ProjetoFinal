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
      <div className="contact-form">
        <h2>Contato</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">Mensagem:</label>
            <textarea
              id="message"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="subject">Motivo do contato:</label>
            <select
              id="subject"
              name="subject"
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
          </div>
          {successMessage && <p className="success-message">{successMessage}</p>}
          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
