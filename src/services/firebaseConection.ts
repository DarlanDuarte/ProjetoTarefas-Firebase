// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
const firebaseConfig = {
  apiKey: "AIzaSyCQ7Le16Pwp81IpgIuAglwKrRTSEhskrHU",
  authDomain: "tarefasplus-2427e.firebaseapp.com",
  projectId: "tarefasplus-2427e",
  storageBucket: "tarefasplus-2427e.appspot.com",
  messagingSenderId: "5279852155",
  appId: "1:5279852155:web:3d787408a24cfebd71a4de"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp)

export {db}