import { initializeApp, getApp, getApps } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTdO_dHKgUGiMU9nUfGdiZLanW6FQYEio",
  authDomain: "studio-1916341789-a2802.firebaseapp.com",
  projectId: "studio-1916341789-a2802",
  storageBucket: "studio-1916341789-a2802.appspot.com",
  messagingSenderId: "426805525072",
  appId: "1:426805525072:web:e19c644612722681a76f55"
};

// Initialize Firebase
// This check prevents re-initializing the app on every hot-reload.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
