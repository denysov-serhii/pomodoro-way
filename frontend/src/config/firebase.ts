import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Firebase configuration
// Note: These values should be set in your .env file
// See FIREBASE_SETUP.md for instructions
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Warn if Firebase is not configured properly
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn(
    '⚠️ Firebase configuration is missing!\n' +
    'Please set up your Firebase credentials in the .env file.\n' +
    'See FIREBASE_SETUP.md for detailed instructions.'
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with React Native optimizations for Android/iOS
let db;
if (Platform.OS === 'web') {
  // Use default Firestore for web
  db = getFirestore(app);
} else {
  // For React Native (Android/iOS), initialize with experimental settings
  // This ensures better compatibility with React Native's JavaScript engine
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    experimentalAutoDetectLongPolling: true,
  });
}

export { db };
export default app;
