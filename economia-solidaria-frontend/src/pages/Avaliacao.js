import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import "../styles/avaliacao.css";

const Review = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Lista de palavras proibidas
  const bannedWords = ["palavrão1", "palavrão2", "ofensa"];

  // Função para verificar se o comentário contém palavras proibidas
  const containsBannedWords = (text) => {
    return bannedWords.some((word) =>
      text.toLowerCase().includes(word.toLowerCase())
    );
  };

  // Função para verificar se o comentário contém pelo menos 2 palavras e cada palavra tenha pelo menos 2 caracteres
  const isCommentValid = (text) => {
    const words = text.trim().split(/\s+/);  // Divide o texto em palavras, considerando espaços
    return words.length >= 2 && words.every(word => word.length >= 2); // Pelo menos 2 palavras e cada uma com 2 ou mais caracteres
  };

  // Função para verificar se o comentário não é uma sequência repetitiva de caracteres
  const isNotRandomChars = (text) => {
    const repeatedCharPattern = /(.)\1{2,}/;  // Detecta 3 ou mais caracteres repetidos
    return !repeatedCharPattern.test(text);
  };

  const handleCommentChange = (e) => {
    const newComment = e.target.value;
    setComment(newComment);

    // Verifica se o novo comentário contém palavras proibidas ou é inválido
    if (containsBannedWords(newComment)) {
      setErrorMessage("Seu comentário contém palavras inadequadas. Por favor, revise.");
    } else if (!isCommentValid(newComment)) {
      setErrorMessage("Seu comentário deve ter pelo menos 2 palavras, e cada palavra deve ter 2 ou mais caracteres.");
    } else if (!isNotRandomChars(newComment)) {
      setErrorMessage("Seu comentário contém uma sequência repetitiva de caracteres. Por favor, digite algo mais significativo.");
    } else {
      setErrorMessage("");  // Limpa a mensagem de erro se o comentário for adequado
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifica se o comentário contém palavras proibidas, é inválido ou contém caracteres repetidos antes de enviar
    if (containsBannedWords(comment)) {
      setErrorMessage("Seu comentário contém palavras inadequadas. Por favor, revise.");
      return;  // Impede o envio se houver palavras proibidas
    }

    if (!isCommentValid(comment)) {
      setErrorMessage("Seu comentário deve ter pelo menos 2 palavras, e cada palavra deve ter 2 ou mais caracteres.");
      return;  // Impede o envio se o comentário for inválido
    }

    if (!isNotRandomChars(comment)) {
      setErrorMessage("Seu comentário contém uma sequência repetitiva de caracteres. Por favor, digite algo mais significativo.");
      return;  // Impede o envio se for apenas caracteres repetidos
    }

    try {
      const docRef = await addDoc(collection(db, "avaliacoes"), {
        rating,
        comment,
        createdAt: new Date(), // Adiciona a data/hora atual
      });
      console.log("Documento salvo com ID:", docRef.id);
      setRating(0);
      setComment("");  // Limpa o comentário após envio bem-sucedido
      setErrorMessage("");  // Limpa a mensagem de erro
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
      setErrorMessage("Ocorreu um erro ao salvar sua avaliação. Tente novamente.");
    }
  };

  // Verifica se o comentário é válido para habilitar o botão de envio
  const isSubmitDisabled = containsBannedWords(comment) || !isCommentValid(comment) || !isNotRandomChars(comment);

  return (
    <div className="review-container">
      <h1>Avaliação</h1>
      <p>Nos conte como foi sua experiência com nossa plataforma.</p>
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
          onChange={handleCommentChange}
          required
        ></textarea>
        <button type="submit" disabled={isSubmitDisabled}>
          Enviar Avaliação
        </button>
      </form>
    </div>
  );
};

export default Review;
