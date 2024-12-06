import React, { useState } from "react";
import "../styles/contato.css";
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaClock } from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular envio do formulário
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage("Mensagem enviada com sucesso! Retornaremos em breve.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Entre em Contato</h1>
        <p>Estamos aqui para ajudar e ouvir suas sugestões</p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <h2>Informações de Contato</h2>
          <div className="info-items">
            <div className="info-item">
              <FaMapMarkerAlt className="info-icon" />
              <div>
                <h3>Localização</h3>
                <p>Limeira, São Paulo</p>
              </div>
            </div>
            <div className="info-item">
              <FaEnvelope className="info-icon" />
              <div>
                <h3>E-mail</h3>
                <p>contato@economiasolidaria.com.br</p>
              </div>
            </div>
            <div className="info-item">
              <FaPhone className="info-icon" />
              <div>
                <h3>Telefone</h3>
                <p>(19) 3444-5555</p>
              </div>
            </div>
            <div className="info-item">
              <FaClock className="info-icon" />
              <div>
                <h3>Horário de Atendimento</h3>
                <p>Segunda a Sexta: 9h às 18h</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form">
          <h2>Envie sua Mensagem</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nome Completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Digite seu nome completo"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Digite seu e-mail"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Assunto</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="">Selecione o assunto</option>
                <option value="duvida">Dúvidas sobre a plataforma</option>
                <option value="sugestao">Sugestões de melhoria</option>
                <option value="parceria">Proposta de parceria</option>
                <option value="problema">Reportar problema</option>
                <option value="outro">Outro assunto</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Mensagem</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Digite sua mensagem"
                rows="5"
              ></textarea>
            </div>

            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Mensagem"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
