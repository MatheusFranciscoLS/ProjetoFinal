import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import "../styles/avaliacao.css";

const Review = ({ lojaId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null); // Para controlar o acordeão

  const bannedWords = ["palavrão1", "palavrão2", "ofensa"];

  const containsBannedWords = (text) => {
    return bannedWords.some((word) =>
      text.toLowerCase().includes(word.toLowerCase())
    );
  };

  const isCommentValid = (text) => {
    const words = text.trim().split(/\s+/);
    return words.length >= 2 && words.every((word) => word.length >= 2);
  };

  const isNotRandomChars = (text) => {
    const repeatedCharPattern = /(.)\1{2,}/;
    return !repeatedCharPattern.test(text);
  };

  const handleCommentChange = (e) => {
    const newComment = e.target.value;
    setComment(newComment);

    if (containsBannedWords(newComment)) {
      setErrorMessage("Seu comentário contém palavras inadequadas. Por favor, revise.");
    } else if (!isCommentValid(newComment)) {
      setErrorMessage("Seu comentário deve ter pelo menos 2 palavras, e cada palavra com 2 ou mais caracteres.");
    } else if (!isNotRandomChars(newComment)) {
      setErrorMessage("Seu comentário contém uma sequência repetitiva de caracteres. Por favor, digite algo mais significativo.");
    } else {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (errorMessage || !rating || !comment.trim()) {
      setErrorMessage("Preencha todos os campos adequadamente.");
      return;
    }

    try {
      await addDoc(collection(db, "avaliacoes"), {
        lojaId,
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });
      setSuccessMessage("Avaliação enviada com sucesso! Obrigado pelo seu feedback.");
      setComment("");
      setRating(0);
      setErrorMessage("");
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchReviews(); // Atualiza as avaliações após o envio
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
      setErrorMessage("Ocorreu um erro ao salvar sua avaliação. Tente novamente.");
    }
  };

  const fetchReviews = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "avaliacoes"));
      const loadedReviews = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((review) => review.lojaId === lojaId); // Filtra pelas avaliações da loja atual
      setReviews(loadedReviews);
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [lojaId]);

  const isSubmitDisabled =
    containsBannedWords(comment) ||
    !isCommentValid(comment) ||
    !isNotRandomChars(comment) ||
    !rating;

  // Função para alternar a visibilidade do acordeão
  const handleAccordionToggle = (section) => {
    setActiveIndex(activeIndex === section ? null : section);
  };

  return (
    <div>
      <div className="accordion">
        <div className="accordion-item">
          <h3
            className="accordion-header"
            onClick={() => handleAccordionToggle("reviews")}
          >
            {showReviews ? "Ocultar Avaliações" : "Ver Avaliações"}
            <span
              className={`accordion-icon ${activeIndex === "reviews" ? "rotate" : ""}`}
            >
              &#9660;
            </span>
          </h3>
          {activeIndex === "reviews" && (
            <div className="accordion-content">
              <h2>Avaliações</h2>
              {reviews.length === 0 ? (
                <p>Nenhuma avaliação encontrada.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <p><strong>Avaliação:</strong> {review.rating} ★</p>
                    <p><strong>Comentário:</strong> {review.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="accordion-item">
          <h3
            className="accordion-header"
            onClick={() => handleAccordionToggle("form")}
          >
            {showForm ? "Ocultar Formulário" : "Fazer Avaliação"}
            <span
              className={`accordion-icon ${activeIndex === "form" ? "rotate" : ""}`}
            >
              &#9660;
            </span>
          </h3>
          {activeIndex === "form" && (
            <div className="accordion-content">
              <form onSubmit={handleSubmit}>
                <h2>Deixe sua Avaliação</h2>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
                <div className="rating">
                  <label>Avaliação:</label>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${star <= rating ? "active" : ""}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Deixe seu comentário aqui..."
                  value={comment}
                  onChange={handleCommentChange}
                  required
                ></textarea>
                <button type="submit" disabled={isSubmitDisabled}>
                  Enviar Avaliação
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Review;
