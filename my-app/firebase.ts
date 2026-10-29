import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUh8ZbZJJ6bSBZwdTb6Q86pg0R4wnSV7I",
  authDomain: "halloweenescape-57fe9.firebaseapp.com",
  projectId: "halloweenescape-57fe9",
  storageBucket: "halloweenescape-57fe9.firebasestorage.app",
  messagingSenderId: "813445604073",
  appId: "1:813445604073:web:2be7dd9e84066a67134678",
  measurementId: "G-TC1XYVE6ZV"
};

// Evita inicializar o app duas vezes (hot reload do Next)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics só existe no navegador (quebra no SSR se chamado direto)
if (typeof window !== "undefined") {
  isSupported().then((ok) => {
    if (ok) getAnalytics(app);
  });
}
