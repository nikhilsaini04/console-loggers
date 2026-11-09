// ─────────────────────────────────────────────────────────────
//  Site settings. Edit this file after creating your Firebase project.
//  Until the Firebase values are filled in, the site runs in DEMO MODE:
//  logins and progress are stored only in the visitor's own browser.
// ─────────────────────────────────────────────────────────────

export const FIREBASE_CONFIG = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

// Email addresses that can open the instructor view on the dashboard.
// Keep this list in sync with isInstructor() in firestore.rules.
export const INSTRUCTOR_EMAILS = ["replace-with-your-email@gmail.com"];

// Shown on the sign-up form. The real check happens in firestore.rules,
// so changing the join code means editing firestore.rules too.
export const JOIN_CODE_HINT = "Ask your instructor for the club join code.";

export const CLUB = {
  name: "The Console Loggers",
  university: "Noida International University",
  short: "NIU",
  launched: "November 2026"
};

export const FIREBASE_READY = !FIREBASE_CONFIG.apiKey.startsWith("REPLACE");
