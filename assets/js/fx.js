// Animations and small interactive touches. Everything here is optional:
// if a feature isn't supported or the visitor prefers reduced motion, the page still works.
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initFx() {
  document.documentElement.classList.add("fx", "fx-ready");
  revealOnScroll();
  topbarShadow();
  spotlightCards();
  typedWords();
  backToTop();
  heroCanvas();
}

function revealOnScroll() {
  const els = document.querySelectorAll("[data-reveal], [data-count], .console.typing, .routine-line");
  document.querySelectorAll("[data-stagger]").forEach(p => {
    const step = parseFloat(p.dataset.stagger) || 0.08;
    [...p.querySelectorAll(":scope > [data-reveal]")].forEach((c, i) => c.style.setProperty("--d", (i * step) + "s"));
  });
  const done = el => {
    el.classList.add("in");
    if (el.dataset.count) countUp(el);
    if (el.classList.contains("typing")) typeConsole(el);
  };
  if (!("IntersectionObserver" in window) || reduce) { els.forEach(done); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { done(e.target); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach(el => io.observe(el));
  // Fallback for fast scrolling: anything at or above the bottom of the screen is shown.
  let queued = false;
  const sweep = () => { queued = false;
    els.forEach(el => { if (!el.classList.contains("in") && el.getBoundingClientRect().top < innerHeight) { done(el); io.unobserve(el); } }); };
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(sweep); } }, { passive: true });
  addEventListener("resize", sweep); setTimeout(sweep, 300);
}

function countUp(el) {
  const to = parseFloat(el.dataset.count), suffix = el.dataset.suffix || "";
  if (reduce) { el.textContent = to + suffix; return; }
  const dur = 1400, t0 = performance.now();
  const tick = t => {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.textContent = Math.round(to * e) + suffix;
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function typeConsole(box) {
  const lines = [...box.querySelectorAll(".log")];
  if (reduce) { lines.forEach(l => l.classList.add("shown")); return; }
  lines.forEach((l, i) => setTimeout(() => l.classList.add("shown"), 250 + i * 520));
}

function topbarShadow() {
  const bar = document.querySelector(".topbar"); if (!bar) return;
  const on = () => bar.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", on, { passive: true }); on();
}

function spotlightCards() {
  document.addEventListener("pointermove", e => {
    const c = e.target.closest && e.target.closest(".card"); if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", (e.clientX - r.left) + "px");
    c.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });
}

function typedWords() {
  document.querySelectorAll("[data-typed]").forEach(el => {
    let words; try { words = JSON.parse(el.dataset.typed); } catch (e) { return; }
    const out = document.createElement("span"), cur = document.createElement("span");
    cur.className = "cur"; el.textContent = ""; el.append(out, cur);
    if (reduce) { out.textContent = words[0]; return; }
    let w = 0, i = 0, del = false;
    const step = () => {
      const word = words[w];
      i += del ? -1 : 1; out.textContent = word.slice(0, i);
      let wait = del ? 35 : 70;
      if (!del && i === word.length) { del = true; wait = 1600; }
      else if (del && i === 0) { del = false; w = (w + 1) % words.length; wait = 300; }
      setTimeout(step, wait);
    };
    step();
  });
}

function backToTop() {
  const b = document.createElement("button");
  b.className = "back-top"; b.setAttribute("aria-label", "Back to top");
  b.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 15l6-6 6 6"/></svg>';
  b.onclick = () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  document.body.append(b);
  addEventListener("scroll", () => b.classList.toggle("show", scrollY > 700), { passive: true });
}

// Code symbols drifting upward behind the hero.
function heroCanvas() {
  const cv = document.getElementById("heroFx"); if (!cv || reduce) return;
  const ctx = cv.getContext("2d");
  const glyphs = ["{ }", "</>", ";", "=>", "[ ]", "++", "( )", "0", "1", "&&", "if", "for", "λ", "log()", "#", "//"];
  let W, H, dpr, parts = [], visible = true;
  const css = getComputedStyle(document.documentElement);
  const colors = () => [css.getPropertyValue("--accent").trim(), css.getPropertyValue("--gold").trim()];
  let pal = colors();
  const resize = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, W * H / 16000));
    parts = Array.from({ length: n }, () => spawn(true));
  };
  const spawn = any => ({ x: Math.random() * W, y: any ? Math.random() * H : H + 20, v: 0.15 + Math.random() * 0.45,
    s: 11 + Math.random() * 12, a: 0.12 + Math.random() * 0.35, g: glyphs[(Math.random() * glyphs.length) | 0], c: Math.random() < 0.35 ? 1 : 0, w: Math.random() * 6.28 });
  const frame = () => {
    if (visible) {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.y -= p.v; p.w += 0.01; const x = p.x + Math.sin(p.w) * 8;
        ctx.globalAlpha = p.a * Math.min(1, p.y / 120); ctx.fillStyle = pal[p.c];
        ctx.font = `600 ${p.s}px "Martian Mono", monospace`; ctx.fillText(p.g, x, p.y);
        if (p.y < -20) Object.assign(p, spawn(false));
      }
    }
    requestAnimationFrame(frame);
  };
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(cv);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => pal = colors());
  addEventListener("resize", resize); resize(); frame();
}

export function toast(text) {
  document.querySelectorAll(".toast").forEach(t => t.remove());
  const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = text;
  document.body.append(t); setTimeout(() => t.remove(), 3200);
}

// Gold-and-green confetti burst, used when a step or language sheet is completed.
export function confetti() {
  if (reduce) return;
  const cv = document.createElement("canvas"); cv.className = "confetti"; document.body.append(cv);
  const ctx = cv.getContext("2d"), dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr);
  const cols = ["#d9ac4a", "#b48224", "#17603a", "#62c28a", "#f4e7c4"];
  const ps = Array.from({ length: 140 }, () => ({ x: innerWidth / 2, y: innerHeight * 0.35, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 12 - 4,
    r: 4 + Math.random() * 5, c: cols[(Math.random() * cols.length) | 0], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3 }));
  let t = 0;
  const f = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ps.forEach(p => { p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); });
    if (++t < 150) requestAnimationFrame(f); else cv.remove();
  };
  f();
}
