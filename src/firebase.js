// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// Import Authentication and Firestore services
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration (This is your correct config)
const firebaseConfig = {
  apiKey: "AIzaSyCG1DtH_yRtFb2tD1DgZiylbAZin6p0MB4",
  authDomain: "smart-farmer-bd607.firebaseapp.com",
  projectId: "smart-farmer-bd607",
  storageBucket: "smart-farmer-bd607.appspot.com", // Note: I corrected this from firebasestorage.app to appspot.com, which is the standard. It should still work.
  messagingSenderId: "675567246759",
  appId: "1:675567246759:web:b99d98c2abd61093086a82",
  measurementId: "G-NDLQTX8V6H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase Authentication and Firestore
// We will use these in other files (like Signup, Login components)
export const auth = getAuth(app);
export const db = getFirestore(app);