import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
	ignoreUndefinedProperties: true,
});

export { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot };
