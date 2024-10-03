// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "blog-post-4e055.firebaseapp.com",
  projectId: "blog-post-4e055",
  storageBucket: "blog-post-4e055.appspot.com",
  messagingSenderId: "747388232730",
  appId: "1:747388232730:web:3cf71826c457e230a7dda3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
