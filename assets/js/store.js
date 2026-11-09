// Accounts and progress. Uses Firebase when config.js is filled in,
// otherwise a browser-only demo store so the site can be previewed.
import { FIREBASE_CONFIG, FIREBASE_READY, INSTRUCTOR_EMAILS } from "./config.js";

const FB = "https://www.gstatic.com/firebasejs/10.12.2/";
const isInstructorEmail = e => !!e && INSTRUCTOR_EMAILS.map(x => x.toLowerCase()).includes(e.toLowerCase());
const emptyProgress = () => ({ dsa: { d: {}, r: {}, n: {} }, practice: { d: {} } });
const emptyCoding = () => ({ handles: {}, stats: {} });   // linked LeetCode / CodeChef / GFG / Codeforces accounts

let backend = null;
let current = null;
let listeners = [];
let innerReady = Promise.resolve();

function emit(u) { current = u; listeners.forEach(cb => cb(u)); }
export function onUser(cb) { ready.then(() => { cb(current); listeners.push(cb); }); }
export function currentUser() { return current; }
export const mode = FIREBASE_READY ? "firebase" : "demo";

function friendly(err) {
  const c = (err && err.code) || "";
  const map = {
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/missing-password": "Enter your password.",
    "auth/weak-password": "Use a password with at least 6 characters.",
    "auth/email-already-in-use": "An account with this email already exists. Log in instead.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/wrong-password": "Email or password is incorrect.",
    "auth/user-not-found": "No account found with this email.",
    "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
    "auth/network-request-failed": "No internet connection. Check your network and try again.",
    "auth/popup-closed-by-user": "Google sign-in was closed before it finished.",
    "auth/cancelled-popup-request": "Google sign-in was closed before it finished.",
    "auth/account-exists-with-different-credential": "This email already has a club account. Log in with your email and password.",
    "auth/unauthorized-domain": "Google sign-in isn't set up for this website yet. Ask your instructor to add the site to Firebase's authorized domains.",
    "auth/operation-not-allowed": "This sign-in method isn't turned on yet. Ask your instructor to enable it in Firebase.",
    "permission-denied": "The join code is incorrect. Ask your instructor for the current code."
  };
  return new Error(map[c] || (err && err.message) || "Something went wrong. Try again.");
}

/* ───────────── Firebase backend ───────────── */
async function firebaseBackend() {
  const [{ initializeApp }, A, F] = await Promise.all([
    import(FB + "firebase-app.js"), import(FB + "firebase-auth.js"), import(FB + "firebase-firestore.js")
  ]);
  const app = initializeApp(FIREBASE_CONFIG);
  const auth = A.getAuth(app);
  const db = F.getFirestore(app);
  let profile = null;

  // Where the "verify your email" link sends students back to.
  const verifyLink = () => ({ url: new URL("login.html", location.href).href });

  const loadProfile = async fbUser => {
    const snap = await F.getDoc(F.doc(db, "users", fbUser.uid));
    const instr = isInstructorEmail(fbUser.email);
    const v = { verified: fbUser.emailVerified, needsVerify: !fbUser.emailVerified,
                displayName: fbUser.displayName || "", google: fbUser.providerData.some(x => x.providerId === "google.com") };
    if (!snap.exists()) return { uid: fbUser.uid, email: fbUser.email, name: instr ? "Instructor" : (fbUser.displayName || fbUser.email), isInstructor: instr, noProfile: !instr, ...v, progress: emptyProgress() };
    const d = snap.data();
    // Record the verification on the profile so the instructor can see it.
    if (fbUser.emailVerified && d.verified !== true) { try { await F.updateDoc(F.doc(db, "users", fbUser.uid), { verified: true }); } catch (e) {} }
    return { uid: fbUser.uid, email: fbUser.email, name: d.name, roll: d.roll, year: d.year, isInstructor: instr, ...v,
             coding: { ...emptyCoding(), ...(d.coding || {}) },
             progress: { dsa: { d: {}, r: {}, n: {}, ...(d.dsa || {}) }, practice: { d: {}, ...(d.practice || {}) } } };
  };

  innerReady = new Promise(res => {
    A.onAuthStateChanged(auth, async u => {
      try { profile = u ? await loadProfile(u) : null; } catch (e) { profile = u ? { uid: u.uid, email: u.email, name: u.email, loadError: true, progress: emptyProgress() } : null; }
      emit(profile); res();
    });
  });

  return {
    async signUp({ name, roll, year, email, password, joinCode }) {
      let cred;
      try { cred = await A.createUserWithEmailAndPassword(auth, email, password); } catch (e) { throw friendly(e); }
      const p = emptyProgress();
      try {
        await F.setDoc(F.doc(db, "users", cred.user.uid), {
          name, roll, year, email: cred.user.email, joinCode, verified: false, createdAt: F.serverTimestamp(), updatedAt: F.serverTimestamp(),
          dsa: p.dsa, practice: p.practice, counts: { dsa: 0, practice: 0 }
        });
      } catch (e) {
        try { await cred.user.delete(); } catch (_) {}
        throw friendly(e);
      }
      try { await A.sendEmailVerification(cred.user, verifyLink()); } catch (e) { console.error(e); }
      profile = await loadProfile(cred.user); emit(profile);
    },
    async signInWithGoogle() {
      const provider = new A.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      try { await A.signInWithPopup(auth, provider); }
      catch (e) {
        if (e.code === "auth/popup-blocked") { await A.signInWithRedirect(auth, provider); return; }
        throw friendly(e);
      }
    },
    // A Google user who has no club profile yet fills in roll number, year and the join code.
    async completeProfile({ name, roll, year, joinCode }) {
      const u = auth.currentUser; if (!u) throw new Error("Your session ended. Sign in again.");
      const p = emptyProgress();
      try {
        await F.setDoc(F.doc(db, "users", u.uid), {
          name, roll, year, email: u.email, joinCode, verified: u.emailVerified, createdAt: F.serverTimestamp(), updatedAt: F.serverTimestamp(),
          dsa: p.dsa, practice: p.practice, counts: { dsa: 0, practice: 0 }
        });
      } catch (e) { throw friendly(e); }
      profile = await loadProfile(u); emit(profile);
    },
    async resendVerification() {
      const u = auth.currentUser; if (!u) throw new Error("Your session ended. Log in again.");
      try { await A.sendEmailVerification(u, verifyLink()); } catch (e) { throw friendly(e); }
    },
    // Called after the student clicks the link in the email.
    async checkVerified() {
      const u = auth.currentUser; if (!u) return false;
      await u.reload();
      if (!u.emailVerified) return false;
      await u.getIdToken(true);               // refresh the token so the database sees the verified email
      profile = await loadProfile(u); emit(profile); return true;
    },
    async signIn(email, password) { try { await A.signInWithEmailAndPassword(auth, email, password); } catch (e) { throw friendly(e); } },
    async signOut() { await A.signOut(auth); },
    async resetPassword(email) { try { await A.sendPasswordResetEmail(auth, email); } catch (e) { throw friendly(e); } },
    async save(progress, counts) {
      if (!profile || profile.noProfile || profile.needsVerify || profile.isInstructor && !profile.roll) return;
      await F.updateDoc(F.doc(db, "users", profile.uid), { dsa: progress.dsa, practice: progress.practice, counts, updatedAt: F.serverTimestamp() });
      await F.setDoc(F.doc(db, "leaderboard", profile.uid), { name: profile.name, year: profile.year, dsa: counts.dsa, practice: counts.practice, updatedAt: F.serverTimestamp() });
    },
    async saveCoding(coding, total) {
      if (!profile || profile.noProfile || profile.needsVerify) return;
      await F.updateDoc(F.doc(db, "users", profile.uid), { coding, updatedAt: F.serverTimestamp() });
      await F.setDoc(F.doc(db, "leaderboard", profile.uid), { name: profile.name, year: profile.year, platforms: total, updatedAt: F.serverTimestamp() }, { merge: true });
    },
    async listStudents() {
      const snap = await F.getDocs(F.collection(db, "users"));
      return snap.docs.map(d => { const x = d.data(); return { uid: d.id, name: x.name, roll: x.roll, year: x.year, email: x.email, verified: x.verified === true,
        coding: { ...emptyCoding(), ...(x.coding || {}) },
        dsa: x.dsa || { d: {} }, practice: x.practice || { d: {} }, updatedAt: x.updatedAt ? x.updatedAt.toDate() : null }; });
    },
    async leaderboard() {
      const snap = await F.getDocs(F.collection(db, "leaderboard"));
      return snap.docs.map(d => ({ uid: d.id, ...d.data(), updatedAt: d.data().updatedAt ? d.data().updatedAt.toDate() : null }));
    }
  };
}

/* ───────────── Demo backend (browser only) ───────────── */
function demoBackend() {
  const K = { users: "cl-demo-users", session: "cl-demo-session", prog: "cl-demo-progress-", coding: "cl-demo-coding-" };
  const get = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const build = uid => {
    const u = get(K.users, {})[uid]; if (!u) return null;
    const p = get(K.prog + uid, emptyProgress());
    // Accounts made before verification existed have no flag and count as verified.
    const verified = u.verified !== false;
    return { uid, email: u.email, name: u.name, roll: u.roll, year: u.year, isInstructor: isInstructorEmail(u.email) || u.demoInstructor,
             verified, needsVerify: !verified, demo: true,
             coding: { ...emptyCoding(), ...get(K.coding + uid, {}) },
             progress: { dsa: { d: {}, r: {}, n: {}, ...p.dsa }, practice: { d: {}, ...p.practice } } };
  };
  innerReady = Promise.resolve().then(() => { const s = get(K.session, null); emit(s ? build(s) : null); });

  // Example classmates so the leaderboard and instructor view have something to show in the demo.
  const examples = [
    ["Example Student A", "EX-001", "2nd year", 142, 31], ["Example Student B", "EX-002", "2nd year", 96, 24],
    ["Example Student C", "EX-003", "1st year", 38, 40], ["Example Student D", "EX-004", "3rd year", 211, 18],
    ["Example Student E", "EX-005", "1st year", 12, 22], ["Example Student F", "EX-006", "3rd year", 175, 12]
  ];

  return {
    async signUp({ name, roll, year, email, password, demoInstructor }) {
      const users = get(K.users, {});
      if (Object.values(users).some(u => u.email.toLowerCase() === email.toLowerCase())) throw new Error("An account with this email already exists. Log in instead.");
      if (!password || password.length < 6) throw new Error("Use a password with at least 6 characters.");
      const uid = "demo-" + Date.now().toString(36);
      users[uid] = { email, password, name, roll, year, demoInstructor: !!demoInstructor, verified: !!demoInstructor }; put(K.users, users); put(K.session, uid); emit(build(uid));
    },
    async signIn(email, password) {
      const users = get(K.users, {});
      const hit = Object.entries(users).find(([, u]) => u.email.toLowerCase() === (email || "").toLowerCase());
      if (!hit || hit[1].password !== password) throw new Error("Email or password is incorrect.");
      put(K.session, hit[0]); emit(build(hit[0]));
    },
    async signOut() { try { localStorage.removeItem(K.session); } catch (e) {} emit(null); },
    async resetPassword() { throw new Error("Password reset emails work once Firebase is connected."); },
    async signInWithGoogle() { throw new Error("Google sign-in works on the live site once Firebase is connected. In this preview, use email and password."); },
    async completeProfile() { throw new Error("Google sign-in works on the live site once Firebase is connected."); },
    async resendVerification() { throw new Error("Preview mode can't send emails. Use “Mark as verified (preview)” below to continue."); },
    async checkVerified() { return !!(current && current.verified); },
    async demoVerify() {
      const users = get(K.users, {}); if (!current || !users[current.uid]) return;
      users[current.uid].verified = true; put(K.users, users); emit(build(current.uid));
    },
    async save(progress) { if (current && !current.needsVerify) put(K.prog + current.uid, progress); },
    async saveCoding(coding) { if (current && !current.needsVerify) put(K.coding + current.uid, coding); },
    async listStudents() {
      const mine = Object.entries(get(K.users, {})).filter(([, u]) => !u.demoInstructor).map(([uid, u]) => {
        const p = get(K.prog + uid, emptyProgress());
        return { uid, name: u.name, roll: u.roll, year: u.year, email: u.email, verified: u.verified !== false, dsa: p.dsa, practice: p.practice, coding: { ...emptyCoding(), ...get(K.coding + uid, {}) }, updatedAt: new Date() };
      });
      return mine.concat(examples.map(([name, roll, year, dsa, pr], i) => ({ uid: "ex" + i, name, roll, year, email: "example" + (i + 1) + "@example.com",
        example: true, verified: true, dsaCount: dsa, practiceCount: pr, dsa: { d: {} }, practice: { d: {} }, coding: emptyCoding(), updatedAt: new Date(Date.now() - i * 86400000) })));
    },
    async leaderboard() {
      const mine = current && !current.isInstructor ? [{ uid: current.uid, name: current.name, year: current.year,
        dsa: Object.keys(current.progress.dsa.d).length, practice: Object.keys(current.progress.practice.d).length }] : [];
      return mine.concat(examples.map(([name, , year, dsa, pr], i) => ({ uid: "ex" + i, name, year, dsa, practice: pr, example: true })));
    }
  };
}

const boot = FIREBASE_READY ? firebaseBackend().catch(e => { console.error(e); emit(null); return null; }) : Promise.resolve(demoBackend());
const ready = boot.then(() => innerReady);
boot.then(b => { backend = b; });

async function be() { await boot; if (!backend) throw new Error("Couldn't reach the login service. Check your internet connection and reload."); return backend; }
export async function signUp(data) { return (await be()).signUp(data); }
export async function signIn(e, p) { return (await be()).signIn(e, p); }
export async function signOut() { return (await be()).signOut(); }
export async function resetPassword(e) { return (await be()).resetPassword(e); }
export async function signInWithGoogle() { return (await be()).signInWithGoogle(); }
export async function completeProfile(d) { return (await be()).completeProfile(d); }
export async function resendVerification() { return (await be()).resendVerification(); }
export async function checkVerified() { return (await be()).checkVerified(); }
export async function demoVerify() { const b = await be(); if (b.demoVerify) return b.demoVerify(); }
export async function listStudents() { return (await be()).listStudents(); }
export async function leaderboard() { return (await be()).leaderboard(); }
// Save linked coding-platform accounts and their solved counts for the current user.
export async function saveCoding(coding, total) {
  if (!current || current.needsVerify) return;
  current.coding = coding;
  await (await be()).saveCoding(coding, total);
}

let saveTimer = null, saveState = "idle";
const saveListeners = [];
export function onSaveState(cb) { saveListeners.push(cb); }
function setSave(s) { saveState = s; saveListeners.forEach(cb => cb(s)); }

// Call after any change to current.progress. Writes are batched every ~1s.
let pendingCounts = null;
async function runSave() {
  clearTimeout(saveTimer); saveTimer = null;
  const c = pendingCounts; pendingCounts = null;
  try { await (await be()).save(current.progress, c || {}); setSave("saved"); }
  catch (e) { console.error(e); setSave("error"); }
}
export function queueSave(counts) {
  if (!current || current.needsVerify) return;
  // Browser-only demo: write straight away so nothing is lost when leaving the page.
  if (mode === "demo" && backend) { backend.save(current.progress); setSave("saved"); return; }
  setSave("saving"); pendingCounts = counts || {};
  clearTimeout(saveTimer);
  saveTimer = setTimeout(runSave, 900);
}
// Send any waiting save before the page is hidden or closed.
addEventListener("pagehide", () => { if (saveTimer) runSave(); });
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && saveTimer) runSave(); });
window.addEventListener("beforeunload", e => { if (saveState === "saving") { e.preventDefault(); e.returnValue = ""; } });
