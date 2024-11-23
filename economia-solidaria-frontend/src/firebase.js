// Importa as funções necessárias do SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Serviço de autenticação
import { getAnalytics } from "firebase/analytics"; // Analytics (opcional)
import { getFirestore } from "firebase/firestore"; // Firestore para o banco de dados

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDBzrhVY41HFA88U78g8uD7MChbt4eJn2U",
  authDomain: "economiasolidaria-2db35.firebaseapp.com",
  projectId: "economiasolidaria-2db35",
  storageBucket: "economiasolidaria-2db35.firebasestorage.app",
  messagingSenderId: "1030267968737",
  appId: "1:1030267968737:web:ac871553b697644cc1aba0",
  measurementId: "G-5BGG1TGQYW",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Inicializa o Analytics (opcional)
const auth = getAuth(app); // Inicializa a autenticação
const db = getFirestore(app); // Inicializa o Firestore

// Exporta os serviços
export { app, auth, analytics, db };
