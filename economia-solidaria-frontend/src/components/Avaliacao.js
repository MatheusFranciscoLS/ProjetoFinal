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
    <div className="avaliacao-container">
      <div className="avaliacao-header">
        <h2>Avaliações do Negócio</h2>
        <p>Escolha uma opção abaixo:</p>
      </div>

      <div className="avaliacao-buttons">
        <button 
          className={`toggle-btn ${activeIndex === 'form' ? 'active' : ''}`}
          onClick={() => handleAccordionToggle('form')}
        >
          <span className="btn-icon">✏️</span>
          <span className="btn-text">
            {activeIndex === 'form' ? 'Fechar Formulário' : 'Fazer uma Avaliação'}
          </span>
        </button>

        <button 
          className={`toggle-btn ${activeIndex === 'reviews' ? 'active' : ''}`}
          onClick={() => handleAccordionToggle('reviews')}
        >
          <span className="btn-icon">📋</span>
          <span className="btn-text">
            {activeIndex === 'reviews' ? 'Fechar Avaliações' : 'Ver Todas as Avaliações'}
          </span>
        </button>
      </div>

      {activeIndex === 'form' && (
        <div className="avaliacao-form">
          <h3>Deixe sua Avaliação</h3>
          <form onSubmit={handleSubmit}>
            <div className="rating-container">
              <label>Quantas estrelas você dá para este negócio?</label>
              <div className="rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${rating >= star ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="comment-field">
              <label>Conte sua experiência:</label>
              <textarea
                value={comment}
                onChange={handleCommentChange}
                placeholder="Compartilhe sua experiência com este negócio..."
                rows="4"
              />
            </div>

            {errorMessage && (
              <div className="message error-message">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="message success-message">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitDisabled}
            >
              {isSubmitDisabled ? 'Preencha todos os campos' : 'Enviar Avaliação'}
            </button>
          </form>
        </div>
      )}

      {activeIndex === 'reviews' && (
        <div className="reviews-section">
          {reviews.length > 0 ? (
            <div className="reviews-list">
              <h3>Avaliações dos Clientes</h3>
              {reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="review-rating">
                      {'★'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </div>
                    <div className="review-date">
                      {review.createdAt?.toDate().toLocaleDateString()}
                    </div>
                  </div>
                  <div className="review-comment">
                    {review.comment}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-reviews">
              <p>Ainda não há avaliações para este negócio.</p>
              <p>Seja o primeiro a avaliar!</p>
              <button 
                className="toggle-btn"
                onClick={() => handleAccordionToggle('form')}
              >
                Fazer uma Avaliação
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Review;
