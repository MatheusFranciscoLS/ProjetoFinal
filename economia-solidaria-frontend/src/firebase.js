// Importa os módulos necessários do Firebase
import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDBzrhVY41HFA88U78g8uD7MChbt4eJn2U",
  authDomain: "economiasolidaria-2db35.firebaseapp.com",
  projectId: "economiasolidaria-2db35",
  storageBucket: "economiasolidaria-2db35.appspot.com",
  messagingSenderId: "1030267968737",
  appId: "1:1030267968737:web:ac871553b697644cc1aba0",
  measurementId: "G-5BGG1TGQYW",
};

let app;
let auth;
let analytics;
let db;
let storage;

try {
  // Verifica se o Firebase já foi inicializado
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  // Inicializa Authentication
  auth = getAuth(app);

  // Inicializa Firestore com persistência offline
  db = getFirestore(app);
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistência offline não pode ser habilitada. Múltiplas abas abertas.');
    } else if (err.code === 'unimplemented') {
      console.warn('O navegador não suporta persistência offline.');
    }
  });

  // Inicializa Storage
  storage = getStorage(app);

  // Inicializa Analytics apenas se suportado
  isSupported().then(yes => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  }).catch(err => {
    console.warn('Analytics não pôde ser inicializado:', err);
  });

  // Configuração do emulador em ambiente de desenvolvimento

} catch (error) {
  console.error('Erro ao inicializar Firebase:', error);
  throw new Error('Falha ao inicializar os serviços do Firebase. Por favor, recarregue a página.');
}

// Exporta os serviços configurados
export { app, auth, analytics, db, storage };

// Função auxiliar para verificar o estado dos serviços
export const checkFirebaseServices = () => {
  if (!app || !auth || !db || !storage) {
    throw new Error('Serviços do Firebase não estão completamente inicializados');
  }
  return true;
};