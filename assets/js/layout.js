// Shared header and footer for every page.
import { onUser, signOut, mode } from "./store.js";
import { CLUB } from "./config.js";
import { initFx } from "./fx.js";

const PAGES = [
  ["index.html", "Home", "#2cff8f"], ["dsa.html", "DSA Sheet", "#ffd166"], ["practice.html", "Practice", "#22e6ff"], ["tech.html", "Tech Map", "#60a5fa"],
  ["interview.html", "Interview Guide", "#f472b6"], ["dashboard.html", "Dashboard", "#a78bfa"]
];

/* ── Heading casing ───────────────────────────────────────────────────
   Page titles (h1) and card titles (h3) are shown in Title Case.
   Section headings (h2) are written in sentence case and left as written. Short joining words stay lowercase
   (unless first or last), and words with their own capitals (DSA, OOPs,
   LeetCode, C++) keep their spelling. */
const SMALL = new Set(["a","an","and","as","at","but","by","for","from","in","into","nor","of","on","or","per","the","to","vs","via","with"]);
function titleWord(w, first, last) {
  if (!/[a-z]/i.test(w)) return w;
  if (/[A-Z]/.test(w.slice(1)) || /^[A-Z0-9+#.]+$/.test(w)) return w;           // acronyms and brand names stay as written
  const lower = w.toLowerCase();
  if (!first && !last && SMALL.has(lower.replace(/[^a-z]/g, ""))) return lower;
  return w.split("-").map(p => p ? p[0].toUpperCase() + p.slice(1) : p).join("-");
}
export function snakeHeading(h) {
  if (h.closest("[data-no-snake]")) return;
  const original = h.textContent.replace(/\s+/g, " ").trim();
  if (!original) return;
  const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  const words = nodes.map(n => n.data.split(/(\s+)/));
  const flat = []; words.forEach((parts, ni) => parts.forEach((w, wi) => { if (w.trim()) flat.push([ni, wi]); }));
  flat.forEach(([ni, wi], k) => { words[ni][wi] = titleWord(words[ni][wi], k === 0, k === flat.length - 1); });
  nodes.forEach((n, i) => { const v = words[i].join(""); if (n.data !== v) n.data = v; });
  h.classList.add("snake");
}
function watchHeadings() {
  const run = root => root.querySelectorAll && root.querySelectorAll("h1,h3").forEach(h => { if (!h.classList.contains("snake")) snakeHeading(h); });
  run(document);
  new MutationObserver(ms => ms.forEach(m => {
    const h = m.target.nodeType === 1 ? m.target.closest && m.target.closest("h1,h3") : m.target.parentElement && m.target.parentElement.closest("h1,h3");
    if (h && m.type === "childList") snakeHeading(h);        // a script changed the heading text: format it again
    m.addedNodes && m.addedNodes.forEach(n => { if (n.nodeType === 1) { if (/^H[13]$/.test(n.tagName)) snakeHeading(n); else run(n); } });
  })).observe(document.body, { childList: true, subtree: true });
}

export function esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
export function initials(name) { return (name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join(""); }

function here() { const p = location.pathname.split("/").pop(); return p === "" ? "index.html" : p; }

export function mountLayout() {
  const cur = here();
  const header = document.createElement("header");
  header.className = "topbar";
  header.innerHTML = `
    <div class="wrap">
      <a class="logo" href="index.html" aria-label="${esc(CLUB.name)} home">
        <picture><source srcset="assets/img/logo-160.webp" type="image/webp"><img class="logo-mark" src="assets/img/logo-160.png" alt="" width="40" height="40"></picture>
        <span class="logo-text">The Console Loggers<small>${esc(CLUB.short)} Coding Club</small></span>
      </a>
      <button class="menu-btn" aria-expanded="false" aria-controls="nav">Menu</button>
      <nav class="nav tabs-nav" id="nav" aria-label="Main">
        ${PAGES.map(([href, label, color]) => `<a href="${href}" style="--tab:${color}"${href === cur ? ' aria-current="page"' : ""}><span class="tab-dot" aria-hidden="true"></span>${label}</a>`).join("")}
        <span class="auth-slot" id="authSlot"></span>
      </nav>
    </div>`;
  document.body.prepend(header);

  if (mode === "demo") {
    const b = document.createElement("div");
    b.className = "demo-banner";
    b.innerHTML = `<div class="wrap"><b>Demo mode</b><span>Logins and progress are saved only in this browser until Firebase is connected. See README.md.</span></div>`;
    header.after(b);
  }

  const btn = header.querySelector(".menu-btn"), nav = header.querySelector(".nav");
  btn.addEventListener("click", () => { const o = nav.classList.toggle("open"); btn.setAttribute("aria-expanded", o); });

  const footer = document.createElement("footer");
  footer.className = "site statusbar";
  footer.innerHTML = `<div class="wrap">
      <span class="sb-left"><span class="sb-item sb-branch"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M18 10c0 4-6 3-12 7"/></svg>main</span>
        <span class="sb-item" id="sbStatus"><i class="sb-dot"></i>${mode === "demo" ? "demo_mode" : "online"}</span>
        <span class="sb-item sb-club">${esc(CLUB.name)} · ${esc(CLUB.university)} · T&amp;P × SET</span></span>
      <span class="sb-right"><a href="dsa.html">dsa_sheet</a><a href="practice.html">practice</a><a href="tech.html">tech_map</a><a href="interview.html">interview_guide</a><a href="instructor.html">instructor</a><span class="sb-item">UTF-8</span><span class="sb-item">Java</span></span>
    </div>`;
  document.body.append(footer);

  initFx();
  watchHeadings();
  const slot = header.querySelector("#authSlot");
  onUser(u => {
    // Remind logged-in students who haven't verified their email; progress isn't saved until they do.
    const old = document.getElementById("verifyBanner"); if (old) old.remove();
    if (u && (u.needsVerify || u.noProfile) && cur !== "login.html") {
      const b = document.createElement("div"); b.id = "verifyBanner"; b.className = "verify-banner"; b.setAttribute("role", "status");
      b.innerHTML = u.noProfile ? `<span>Finish signing up to start saving your progress.</span><a class="btn btn-primary btn-sm" href="login.html?next=${cur}">Finish signing up</a>`
                                : `<span>Verify your email (${esc(u.email)}) to start saving your progress.</span><a class="btn btn-primary btn-sm" href="login.html?next=${cur}">Verify email</a>`;
      header.after(b);
    }
    if (!u) { slot.innerHTML = cur === "login.html" ? "" : `<a class="btn btn-primary btn-sm" href="login.html">Log in</a>`; return; }
    slot.innerHTML = `<a class="avatar" href="dashboard.html" title="${esc(u.name)}">${esc(initials(u.name))}</a>
                      <button class="btn btn-ghost btn-sm" id="logoutBtn">Log out</button>`;
    slot.querySelector("#logoutBtn").addEventListener("click", async () => { await signOut(); location.href = "index.html"; });
  });
}

export function svgStar() { return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"/></svg>'; }
export function svgNote() { return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 4h10l4 4v12H5z"/><path d="M9 12h6M9 16h4"/></svg>'; }
export function svgExt() { return '<svg class="ext" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg>'; }
export function svgChev() { return '<svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>'; }
