import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCxGuICY92vn7VystQighWpO4zrY2BSchc",
  authDomain: "italabrasivi.firebaseapp.com",
  projectId: "italabrasivi",
  storageBucket: "italabrasivi.firebasestorage.app",
  messagingSenderId: "110626431177",
  appId: "1:110626431177:web:b2bcf5ce15596d826fad18"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;