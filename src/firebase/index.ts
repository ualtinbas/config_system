import { initializeApp } from "firebase/app"
import { getAuth } from 'firebase/auth'
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzBDbLeCXDs5yl5GlXVJWQ-2yXmBpSV0I",
  authDomain: "codeway-config-system.firebaseapp.com",
  projectId: "codeway-config-system",
  storageBucket: "codeway-config-system.firebasestorage.app",
  messagingSenderId: "956641199222",
  appId: "1:956641199222:web:1fc74a8ef61c6006b18b57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const db = getFirestore(app);

const auth = getAuth(app)

export { auth, db }