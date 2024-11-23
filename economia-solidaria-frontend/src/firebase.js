// Importa os módulos necessários do Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Importa a autenticação
import { getAnalytics } from "firebase/analytics"; // Importa o analytics (opcional)
import { getFirestore } from "firebase/firestore"; // Importa o Firestore

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDBzrhVY41HFA88U78g8uD7MChbt4eJn2U",
  authDomain: "economiasolidaria-2db35.firebaseapp.com",
  projectId: "economiasolidaria-2db35",
  storageBucket: "economiasolidaria-2db35.appspot.com", // Corrige o domínio do storageBucket
  messagingSenderId: "1030267968737",
  appId: "1:1030267968737:web:ac871553b697644cc1aba0",
  measurementId: "G-5BGG1TGQYW",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Inicializa o analytics (opcional)
const auth = getAuth(app); // Inicializa o serviço de autenticação
const db = getFirestore(app); // Inicializa o Firestore

// Exporta os serviços configurados
export { app, auth, analytics, db };
