// @ts-nocheck
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  "projectId": "lumi-by-vansh",
  "appId": "1:996632146856:web:df69b3303457dec225e39d",
  "storageBucket": "lumi-by-vansh.firebasestorage.app",
  "apiKey": "AIzaSyBLLHiZa9Ix70TnqSThHud_DTTlbindVY4",
  "authDomain": "lumi-by-vansh.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "996632146856"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
