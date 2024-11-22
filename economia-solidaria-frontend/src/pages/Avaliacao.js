import React, { useState } from "react";
import "../styles/avaliacao.css";

const Review = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage("Obrigado pela sua avaliação!");
    setRating(0);
    setComment("");
  };

  return (
    <div className="review-container">
      <h1>Avaliação</h1>
      <p>Nos conte como foi sua experiência com nossa plataforma.</p>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div className="rating">
          <label>Avaliação:</label>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={star <= rating ? "star active" : "star"}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          placeholder="Deixe seu comentário aqui..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        ></textarea>
        <button type="submit">Enviar Avaliação</button>
      </form>
    </div>
  );
};

export default Review;
