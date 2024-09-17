// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA-Qz3Bn0vp5p4dq8tBoE0yzKGNdCzEv_M",
  authDomain: "appthuvien-e72bc.firebaseapp.com",
  databaseURL: "https://appthuvien-e72bc-default-rtdb.firebaseio.com",
  projectId: "appthuvien-e72bc",
  storageBucket: "appthuvien-e72bc.appspot.com",
  messagingSenderId: "876709708879",
  appId: "1:876709708879:web:db6c576594c75c810cd63a"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const storage = getStorage(app);

export { app, auth, db, storage };
