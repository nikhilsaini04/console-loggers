// Site settings.
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBZA4KwYDAKceaM5oHwyq0IbmYqJhDwIAc",
  authDomain: "console-loggers-9e36c.firebaseapp.com",
  projectId: "console-loggers-9e36c",
  storageBucket: "console-loggers-9e36c.firebasestorage.app",
  messagingSenderId: "929903467799",
  appId: "1:929903467799:web:665131eda3f479efe8ab52"
};

// Email addresses that can open the instructor view on the dashboard.
// Keep this list in sync with isInstructor() in the Firestore rules.
export const INSTRUCTOR_EMAILS = ["nikhilsainiiimt@gmail.com"];

// Shown on the sign-up form. The real check happens in the Firestore rules.
export const JOIN_CODE_HINT = "Ask your instructor for the club join code.";

export const CLUB = {
  name: "The Console Loggers",
  university: "Noida International University",
  short: "NIU",
  launched: "November 2026"
};

export const FIREBASE_READY = !FIREBASE_CONFIG.apiKey.startsWith("REPLACE");
