import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBuPz3cyxpruGu0zl1-F_gXpVDiobgz2GU",
  authDomain: "petsy-app-52285.firebaseapp.com",
  projectId: "petsy-app-52285",
  storageBucket: "petsy-app-52285.firebasestorage.app",
  messagingSenderId: "647122703732",
  appId: "1:647122703732:web:9c6e12eef9386274148821",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
