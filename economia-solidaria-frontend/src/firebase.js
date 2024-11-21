// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBzrhVY41HFA88U78g8uD7MChbt4eJn2U",
  authDomain: "economiasolidaria-2db35.firebaseapp.com",
  projectId: "economiasolidaria-2db35",
  storageBucket: "economiasolidaria-2db35.firebasestorage.app",
  messagingSenderId: "1030267968737",
  appId: "1:1030267968737:web:ac871553b697644cc1aba0",
  measurementId: "G-5BGG1TGQYW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);