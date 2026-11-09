import { mountLayout } from "./layout.js";
import { onUser, signIn, signUp, signOut, resetPassword, signInWithGoogle, completeProfile, resendVerification, checkVerified, demoVerify, mode } from "./store.js";
import { JOIN_CODE_HINT } from "./config.js";

mountLayout();
const $ = id => document.getElementById(id);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const next = (() => { const n = new URLSearchParams(location.search).get("next"); return n && /^[a-z]+\.html$/.test(n) ? n : "dashboard.html"; })();

$("codeHint").textContent = JOIN_CODE_HINT;
if (mode === "demo") { $("codeField").hidden = true; $("suCode").required = false; $("demoInstrWrap").hidden = false; }

function show(kind, text) {
  const m = $("msg"); m.className = "alert " + kind; m.textContent = text; m.hidden = false;
  if (kind === "err") { const card = document.querySelector(".auth-card"); card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake"); }
}

/* Tabs with a sliding highlight */
/* Which panel the card shows: the normal log in / sign up tabs, "verify your email", or "finish your profile" */
let stage = "auth";
function setStage(st, u) {
  stage = st;
  const auth = st === "auth";
  document.querySelector(".seg").hidden = !auth; $("googleWrap").hidden = !auth;
  if (!auth) { $("loginForm").hidden = true; $("signupForm").hidden = true; }
  $("verifyBox").hidden = st !== "verify"; $("profileForm").hidden = st !== "profile";
  $("msg").hidden = true;
  if (st === "verify") {
    $("formTitle").textContent = "Verify your email";
    $("formSub").textContent = "One quick step before you start tracking.";
    $("vfEmail").textContent = u.email; $("vfDemo").hidden = mode !== "demo";
  } else if (st === "profile") {
    $("formTitle").textContent = "Finish signing up";
    $("formSub").textContent = "Add your class details and the club join code.";
    $("pfEmail").textContent = "Signed in with Google as " + u.email;
    if (!$("pfName").value) $("pfName").value = u.displayName || "";
    $("pfRoll").focus({ preventScroll: true });
  } else tab("login");
}
async function leave() { await signOut(); setStage("auth"); }

function tab(which) {
  const login = which === "login";
  $("tabLogin").setAttribute("aria-selected", login); $("tabSignup").setAttribute("aria-selected", !login);
  document.querySelector(".seg").classList.toggle("right", !login);
  $("loginForm").hidden = !login; $("signupForm").hidden = login; $("msg").hidden = true;
  $("formTitle").textContent = login ? "Log in" : "Create your account";
  $("formSub").textContent = login ? "Enter your club account details." : (mode === "demo" ? "Fill in your details to join." : "You'll need the join code from your instructor.");
  (login ? $("liEmail") : $("suName")).focus({ preventScroll: true });
}
$("tabLogin").onclick = () => tab("login");
$("tabSignup").onclick = () => tab("signup");
document.querySelectorAll("[data-goto]").forEach(b => b.onclick = () => tab(b.dataset.goto));
if (location.hash === "#signup") tab("signup");
addEventListener("hashchange", () => { if (stage === "auth") tab(location.hash === "#signup" ? "signup" : "login"); });

/* Show / hide password */
document.querySelectorAll(".eye").forEach(b => b.addEventListener("click", () => {
  const inp = $(b.dataset.for), showing = inp.type === "text";
  inp.type = showing ? "password" : "text"; b.classList.toggle("on", !showing);
  b.setAttribute("aria-label", showing ? "Show password" : "Hide password");
}));

/* Caps Lock warning */
[["liPass", "capsLogin"], ["suPass", "capsSignup"]].forEach(([i, c]) => {
  const f = e => { if (e.getModifierState) $(c).hidden = !e.getModifierState("CapsLock"); };
  $(i).addEventListener("keyup", f); $(i).addEventListener("keydown", f); $(i).addEventListener("blur", () => $(c).hidden = true);
});

/* Password strength */
$("suPass").addEventListener("input", () => {
  const v = $("suPass").value; let s = 0;
  if (v.length >= 6) s++; if (v.length >= 10) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++;
  const lv = !v ? 0 : s <= 2 ? 1 : s <= 3 ? 2 : 3;
  const bar = $("strBar"); bar.style.width = [0, 34, 67, 100][lv] + "%"; bar.className = ["", "weak", "ok", "strong"][lv];
  $("strText").textContent = ["Use letters, numbers and a symbol.", "Weak password", "Good password", "Strong password"][lv];
});

async function busy(btn, fn) {
  btn.disabled = true; btn.classList.add("loading");
  try { await fn(); } catch (e) { show("err", e.message); } finally { btn.disabled = false; btn.classList.remove("loading"); }
}
function success(btn) { btn.classList.add("done"); btn.querySelector(".btn-label").textContent = "Welcome!"; }

$("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  const email = $("liEmail").value.trim(), pass = $("liPass").value;
  if (!email || !pass) return show("err", "Enter your email and password.");
  busy($("liBtn"), async () => { await signIn(email, pass); success($("liBtn")); setTimeout(() => location.href = next, reduce ? 0 : 450); });
});

$("forgotBtn").addEventListener("click", () => {
  const email = $("liEmail").value.trim();
  if (!email) { $("liEmail").focus(); return show("warn", "Type your email above, then click “Forgot password?” again."); }
  busy($("forgotBtn"), async () => { await resetPassword(email); show("ok", "Password reset email sent. Check your inbox and spam folder."); });
});

/* Google */
$("googleBtn").addEventListener("click", () => busy($("googleBtn"), () => signInWithGoogle()));

$("profileForm").addEventListener("submit", e => {
  e.preventDefault();
  const d = { name: $("pfName").value.trim(), roll: $("pfRoll").value.trim(), year: $("pfYear").value, joinCode: $("pfCode").value.trim() };
  if (!d.name || !d.roll || !d.year) return show("err", "Fill in your name, roll number and year.");
  if (!d.joinCode) return show("err", "Enter the club join code your instructor gave you.");
  busy($("pfBtn"), async () => { await completeProfile(d); success($("pfBtn")); });
});
$("pfOut").onclick = leave;

/* Email verification */
$("vfCheck").addEventListener("click", () => busy($("vfCheck"), async () => {
  if (!(await checkVerified())) show("warn", "Your email isn't verified yet. Click the link in the email first, then try again.");
}));
let cooldown = 0;
$("vfResend").addEventListener("click", () => {
  if (cooldown) return show("warn", `You can resend in ${cooldown} seconds.`);
  busy($("vfResend"), async () => {
    await resendVerification(); show("ok", "Verification email sent again. Check your inbox and spam folder.");
    cooldown = 60; const t = setInterval(() => { cooldown--; $("vfResend").textContent = cooldown ? `Resend email (${cooldown}s)` : "Resend email"; if (!cooldown) clearInterval(t); }, 1000);
  });
});
$("vfOut").onclick = leave;
$("vfDemo").onclick = () => demoVerify();
// When the student comes back to this tab after clicking the link, check automatically.
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && stage === "verify") checkVerified().catch(() => {}); });

$("signupForm").addEventListener("submit", e => {
  e.preventDefault();
  const d = { name: $("suName").value.trim(), roll: $("suRoll").value.trim(), year: $("suYear").value,
              email: $("suEmail").value.trim(), password: $("suPass").value, joinCode: $("suCode").value.trim(),
              demoInstructor: $("suInstr").checked };
  if (!d.name || !d.roll || !d.year || !d.email || !d.password) return show("err", "Fill in every field.");
  if (mode !== "demo" && !d.joinCode) return show("err", "Enter the club join code your instructor gave you.");
  signingUp = true;
  busy($("suBtn"), async () => { try { await signUp(d); } finally { signingUp = false; } route(window.__u); });
});

/* Animated terminal on the brand panel */
const LINES = [
  ["in", "$ ssh member@console-loggers"],
  ["out", "Connecting to club server..."],
  ["ok", "✓ Secure connection established"],
  ["out", "Loading DSA Sheet · 418 items"],
  ["out", "Loading practice sheets · 38 sheets"],
  ["warn", "⚠ Daily assignment due today"],
  ["in", "> await login()"]
];
(function typeTerm() {
  const box = $("authTerm"); if (!box) return;
  if (reduce) { box.innerHTML = LINES.map(([k, t]) => `<div class="log ${k}"><span>${t}</span></div>`).join(""); return; }
  let i = 0;
  const step = () => {
    if (i >= LINES.length) { setTimeout(() => { box.innerHTML = ""; i = 0; step(); }, 4000); return; }
    const [k, t] = LINES[i++]; const row = document.createElement("div"); row.className = "log " + k;
    const span = document.createElement("span"); row.append(span); box.append(row);
    let c = 0; const tick = () => { span.textContent = t.slice(0, ++c); if (c < t.length) setTimeout(tick, k === "in" ? 38 : 14); else setTimeout(step, 380); };
    tick();
  };
  step();
})();

/* Send each user to the right place */
let signingUp = false;
function route(u) {
  window.__u = u;
  if (signingUp) return;                       // the profile is still being created
  if (!u) { if (stage !== "auth") setStage("auth"); return; }
  if (u.noProfile) return setStage("profile", u);
  if (u.needsVerify) return setStage("verify", u);
  if (stage === "verify") show("ok", "Email verified. Taking you in…");
  setTimeout(() => location.replace(next), stage === "auth" ? 0 : (reduce ? 0 : 700));
}
onUser(route);
