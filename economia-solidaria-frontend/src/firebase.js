// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Importa a autenticação
import { getAnalytics } from "firebase/analytics"; // Importa o analytics

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBzrhVY41HFA88U78g8uD7MChbt4eJn2U",
  authDomain: "economiasolidaria-2db35.firebaseapp.com",
  projectId: "economiasolidaria-2db35",
  storageBucket: "economiasolidaria-2db35.firebasestorage.app",
  messagingSenderId: "1030267968737",
  appId: "1:1030267968737:web:ac871553b697644cc1aba0",
  measurementId: "G-5BGG1TGQYW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); // Inicializa o Firebase
const analytics = getAnalytics(app); // Inicializa o analytics (opcional)

// Obtenha o serviço de autenticação
const auth = getAuth(app); 

// Exporte os serviços que você deseja usar
export { app, auth, analytics };
