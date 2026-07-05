import { initializeApp } from 'firebase/app';
import { initializeFirestore, enableIndexedDbPersistence, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
	ignoreUndefinedProperties: true,
});

enableIndexedDbPersistence(db).catch((error) => {
	console.warn('Firestore persistence unavailable', error);
});

export { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot };
