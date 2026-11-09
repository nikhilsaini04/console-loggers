// Course-style program cards on the home page, with live progress for logged-in members.
import { esc } from "./layout.js";
import { onUser } from "./store.js";
import { DSA_ALL, LANGS } from "./progress.js";

const I = {
  dsa: '<path d="M4 18l5-5 4 4 7-8"/><path d="M15 9h5v5"/>',
  lang: '<path d="M8 6l-6 6 6 6M16 6l6 6-6 6"/>',
  java: '<path d="M5 9h11v5a5 5 0 01-5 5h-1a5 5 0 01-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 010 5H16"/><path d="M8 3c0 1.5 2 1.5 2 3M12 3c0 1.5 2 1.5 2 3"/>',
  cs: '<rect x="4" y="4" width="16" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  domain: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3"/>',
  apt: '<path d="M5 4h14v16H5z"/><path d="M8 8h3M8 12h8M8 16h5M14 7l2 2-2 2"/>',
  interview: '<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/>',
  guide: '<path d="M12 3l8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4M4 17l8 4 8-4"/>',
  map: '<path d="M9 4l-5 2v14l5-2 6 2 5-2V4l-5 2z"/><path d="M9 4v14M15 6v14"/>'
};

const groupIds = g => LANGS.filter(L => L.group === g).flatMap(L => L.list.map(i => i.id));
const sheetIds = ids => LANGS.filter(L => ids.includes(L.id)).flatMap(L => L.list.map(i => i.id));

const PROGRAMS = [
  { key: "dsa", title: "DSA Sheet", tag: "Placement core", color: "#2cff8f", href: "dsa.html", icon: I.dsa,
    blurb: "21 steps from basics to segment trees. The heart of every coding interview.",
    ids: () => DSA_ALL.map(i => i.id), src: "dsa", unit: "problems" },
  { key: "lang", title: "Programming Languages", tag: "13 languages", color: "#22e6ff", href: "practice.html#java", icon: I.lang,
    blurb: "Java, Python, C++, JavaScript, SQL, Go, Rust and more, 80+ exercises each.",
    ids: () => groupIds("Languages"), src: "practice", unit: "exercises" },
  { key: "java", title: "Java Full Stack", tag: "Backend jobs", color: "#ffb347", href: "practice.html#java8", icon: I.java,
    blurb: "Java 8+, Collections, JDBC, Servlets, JSP, Hibernate and Spring Boot.",
    ids: () => groupIds("Java stack"), src: "practice", unit: "questions" },
  { key: "cs", title: "CS Fundamentals", tag: "Technical rounds", color: "#a78bfa", href: "practice.html#os", icon: I.cs,
    blurb: "Operating Systems, DBMS, Computer Networks and Cloud Computing.",
    ids: () => groupIds("CS fundamentals"), src: "practice", unit: "questions" },
  { key: "domain", title: "Tech Domains", tag: "Career paths", color: "#ff5fa2", href: "practice.html#mern", icon: I.domain,
    blurb: "MERN, Data Science, Data Analyst, ML, AI, DevOps and Cyber Security.",
    ids: () => groupIds("Domains"), src: "practice", unit: "topics" },
  { key: "apt", title: "Aptitude & Reasoning", tag: "Online tests", color: "#ffd166", href: "practice.html#apt-quant", icon: I.apt,
    blurb: "Quantitative, logical, verbal and pseudocode, with answers for every question.",
    ids: () => groupIds("Aptitude"), src: "practice", unit: "questions" },
  { key: "interview", title: "Interview Prep", tag: "Final rounds", color: "#5eead4", href: "practice.html#oops", icon: I.interview,
    blurb: "OOPs, HR and system design questions asked by product and service companies.",
    ids: () => sheetIds(["oops", "hr", "sysdesign"]), src: "practice", unit: "questions" },
  { key: "guide", title: "Interview Guide", tag: "Read first", color: "#f472b6", href: "interview.html", icon: I.guide,
    blurb: "Rounds, coding-round technique, HR answers, body language and dress code.", guide: "10 sections" },
  { key: "map", title: "Tech Map", tag: "Roadmaps", color: "#60a5fa", href: "tech.html", icon: I.map,
    blurb: "Front-end to AI: every technology in the order you should learn it.", guide: "12 areas" }
];

export function mountPrograms(el) {
  const draw = u => {
    el.innerHTML = PROGRAMS.map((p, i) => {
      const ids = p.ids ? p.ids() : null;
      const total = ids ? ids.length : 0;
      const doneMap = u && ids ? (p.src === "dsa" ? u.progress.dsa.d : u.progress.practice.d) : null;
      const done = doneMap ? ids.filter(id => doneMap[id]).length : 0;
      const pct = total ? Math.round(done / total * 100) : 0;
      return `<a class="prog" href="${p.href}" style="--c:${p.color};--d:${(i % 3) * .08}s" data-reveal>
        <span class="prog-glow" aria-hidden="true"></span>
        <div class="prog-top">
          <span class="prog-ico"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p.icon}</svg></span>
          <span class="prog-tag">${esc(p.tag)}</span>
        </div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.blurb)}</p>
        <div class="prog-meta">
          ${ids ? `<span>${total.toLocaleString("en-US")} ${p.unit}</span><span>Basic → Advanced</span>` : `<span>${esc(p.guide)}</span><span>Free guide</span>`}
        </div>
        ${ids ? (u ? `<div class="prog-bar"><i style="width:${pct}%"></i></div><div class="prog-foot"><span>${done} of ${total} done</span><b>${pct}%</b></div>`
                    : `<div class="prog-foot"><span>Log in to track progress</span></div>`)
              : `<div class="prog-foot"><span>Open anytime</span></div>`}
        <span class="prog-cta">${ids && u && done ? "Continue" : ids ? "Start learning" : "Read now"} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>`;
    }).join("");
    // Reveal cards as they scroll into view (they're redrawn after login, so they get their own observer)
    const cards = el.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) cards.forEach(c => c.classList.add("in"));
    else {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
      cards.forEach(c => c.getBoundingClientRect().top < innerHeight ? c.classList.add("in") : io.observe(c));
    }
    // Spotlight follows the pointer
    el.querySelectorAll(".prog").forEach(c => c.addEventListener("pointermove", e => {
      const r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px");
    }));
  };
  draw(null);
  onUser(draw);
}
