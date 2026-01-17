
import { initializeFirestore } from "firebase/firestore";
import { app } from "./config";

// Initialize Firestore with long-polling enabled to prevent connection issues in some environments
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export { db };
