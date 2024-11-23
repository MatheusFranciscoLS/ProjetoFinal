import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import "../styles/avaliacao.css";

const Review = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "avaliacoes"), {
        rating,
        comment,
        createdAt: new Date(), // Adiciona a data/hora atual
      });
      console.log("Documento salvo com ID:", docRef.id);
      setSuccessMessage("Obrigado pela sua avaliação!");
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
      setErrorMessage("Ocorreu um erro ao salvar sua avaliação. Tente novamente.");
    }
  };

  return (
    <div className="review-container">
      <h1>Avaliação</h1>
      <p>Nos conte como foi sua experiência com nossa plataforma.</p>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
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
