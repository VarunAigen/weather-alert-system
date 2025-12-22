/**
 * Firebase Configuration
 * Connected to: weather-alert-system-440c1
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyD4gSX1U917C5KfQc7q0ainY06Rt0_PpT8",
    authDomain: "weather-alert-system-440c1.firebaseapp.com",
    projectId: "weather-alert-system-440c1",
    storageBucket: "weather-alert-system-440c1.firebasestorage.app",
    messagingSenderId: "323353660542",
    appId: "1:323353660542:web:74a3bbba70c60664149c2f",
    measurementId: "G-J0M45QRY09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth (for user management)
export const auth = getAuth(app);

export default app;
