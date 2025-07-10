import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDhgB9WGCuThPjylhivlw_cqxuKLcinyWE",
  authDomain: "quiz-app-59968.firebaseapp.com",
  projectId: "quiz-app-59968",
  storageBucket: "quiz-app-59968.firebasestorage.app",
  messagingSenderId: "429367119047",
  appId: "1:429367119047:web:4cf9a436a78cdd2fa742e2",
  measurementId: "G-W71NGLQL35",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Setting up authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
export const db = getFirestore(app);
