import { mountLayout, esc } from "./layout.js";
import { onUser, currentUser, queueSave, onSaveState } from "./store.js";
import { LANGS, counts } from "./progress.js";
import { PLATFORMS, TRACKS, RESOURCES } from "./data-practice.js";
import { confetti, toast } from "./fx.js";

mountLayout();
const $ = id => document.getElementById(id);
const LV = { B: "Basic", I: "Intermediate", A: "Advanced" };
let P = { d: {} }, canEdit = false;
let active = (location.hash || "").slice(1);
if (!LANGS.some(L => L.id === active)) active = "java";

function renderTabs() {
  const groups = [...new Set(LANGS.map(L => L.group))];
  $("langTabs").innerHTML = groups.map(g => `<div class="tab-group"><span class="label">${esc(g)}</span><div class="lang-tabs">` +
    LANGS.filter(L => L.group === g).map(L => {
      const done = L.list.filter(it => P.d[it.id]).length;
      return `<button role="tab" aria-selected="${L.id === active}" data-id="${L.id}">${esc(L.name)}<span class="cnt">${done}/${L.list.length}</span></button>`;
    }).join("") + `</div></div>`).join("");
}

function renderLang() {
  const L = LANGS.find(x => x.id === active);
  const done = L.list.filter(it => P.d[it.id]).length;
  $("langPanel").innerHTML = `
    <div class="lang-head">
      <div style="display:grid;gap:8px">
        <span class="tag info">${esc(L.tag)}</span>
        <h2>${esc(L.name)} ${L.group === "Languages" ? "practice sheet" : L.group === "Interview prep" || L.group === "Aptitude" ? "questions" : "tracker"}</h2>
        <p class="muted" style="max-width:62ch">${esc(L.blurb)}</p>
      </div>
      <div class="card" style="min-width:min(100%,280px)">
        <span class="label">Learn from</span>
        <div class="reflinks">${L.links.length ? "" : '<span class="muted">Practice daily with a timer.</span>'}${L.links.map(([t, h]) => `<a href="${h}" target="_blank" rel="noopener">${esc(t)}</a>`).join("")}</div>
      </div>
    </div>
    <div class="level-key"><span class="pill B">Basic</span><span class="pill I">Intermediate</span><span class="pill A">Advanced</span><span class="muted">Each topic runs from basic to advanced.</span></div>
    <div class="summary" style="grid-template-columns:minmax(0,1fr)">
      <div class="big"><span class="n">${done}</span><span class="of">of ${L.list.length} done</span><span class="pct">${Math.round(done / L.list.length * 100)}%</span></div>
      <div class="stack-bar"><i class="c" style="width:${done / L.list.length * 100}%"></i></div>
    </div>
    <div class="step${L.id === "apt-pseudo" ? " code-sheet" : ""}"><ul class="rows" style="border-top:0">
      <li class="row-head np" aria-hidden="true"><span>status</span><span>${L.group === "Languages" ? "exercise" : "question"}</span><span>${L.rows.some(r => r.ans) ? "answer" : "level"}</span></li>
      ${L.rows.map(it => it.sub ? `<li class="sub">${esc(it.sub)}</li>` : `
        <li class="row np${P.d[it.id] ? " done" : ""}" data-id="${it.id}">
          <label class="chk"><input type="checkbox" ${P.d[it.id] ? "checked" : ""} ${canEdit ? "" : "disabled"} aria-label="Done: ${esc(it.t)}"><span></span></label>
          <div class="row-main"><span class="title">${esc(it.t)}</span>${it.ans ? `<div class="answer" hidden><b>Answer:</b> ${esc(it.ans)}</div>` : ""}</div>
          ${it.ans ? `<button class="ans-btn" type="button" aria-expanded="false">Show answer</button>` : `<span class="pill ${it.d}">${LV[it.d]}</span>`}
        </li>`).join("")}
    </ul></div>`;
}

$("langTabs").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  active = b.dataset.id; history.replaceState(null, "", "#" + active); renderTabs(); renderLang();
  const top = $("langPanel").getBoundingClientRect().top; if (top < 0 || top > innerHeight * 0.6) $("langPanel").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("langPanel").addEventListener("click", e => {
  const b = e.target.closest(".ans-btn"); if (!b) return;
  const a = b.closest(".row").querySelector(".answer"); a.hidden = !a.hidden;
  b.setAttribute("aria-expanded", !a.hidden); b.textContent = a.hidden ? "Show answer" : "Hide answer";
});
$("langPanel").addEventListener("change", e => {
  if (!e.target.matches(".chk input") || !canEdit) return;
  const row = e.target.closest(".row"), id = row.dataset.id;
  if (e.target.checked) P.d[id] = Date.now(); else delete P.d[id];
  const u = currentUser(); u.progress.practice = P; queueSave(counts(u.progress));
  renderTabs(); renderLang();
  const L = LANGS.find(x => x.id === active);
  if (e.target.checked && L.list.every(it => P.d[it.id])) { confetti(); toast(`${L.name} sheet complete`); }
});

$("trackList").innerHTML = TRACKS.map(t => `<div class="card track-row" id="track-${t.id}">
  <span class="label" style="writing-mode:initial;color:var(--gold)">${esc(t.id.toUpperCase())}</span>
  <div style="display:grid;gap:6px"><h3>${esc(t.name)}</h3><p>${esc(t.blurb)}</p></div>
  <div style="display:grid;gap:10px"><ul>${t.roadmap.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
    <div class="reflinks">${t.links.map(([n, h]) => `<a href="${h}" target="_blank" rel="noopener">${esc(n)} →</a>`).join("")}</div></div>
</div>`).join("");
if (location.hash === "#tracks") setTimeout(() => document.getElementById("tracks").scrollIntoView(), 50);
$("resources").innerHTML = RESOURCES.map(g => `<div class="card"><h3>${esc(g.name)}</h3><div class="res-list">${g.items.map(([n, h, d]) =>
  `<div>${h ? `<a href="${h}" target="_blank" rel="noopener">${esc(n)}</a>` : `<b>${esc(n)}</b>`}<span>${esc(d)}</span></div>`).join("")}</div></div>`).join("");
$("platforms").innerHTML = PLATFORMS.map(([n, h, d]) => `<a href="${h}" target="_blank" rel="noopener"><b>${esc(n)}</b><span>${esc(d)}</span></a>`).join("");

onSaveState(s => { const el = $("saveState"); el.className = "save-state" + (s === "error" ? " error" : "");
  el.textContent = s === "saving" ? "Saving…" : s === "saved" ? "All changes saved" : s === "error" ? "Couldn't save. Check your connection." : ""; });

onUser(u => {
  canEdit = !!u && !u.noProfile && !u.needsVerify && !(u.isInstructor && !u.roll);
  P = u ? u.progress.practice : { d: {} };
  $("loginNotice").hidden = !!u;
  renderTabs(); renderLang();
});

// Switch sheets when the #sheet part of the address changes (back button, edited links).
addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if (LANGS.some(L => L.id === id) && id !== active) { active = id; renderTabs(); renderLang(); }
  else if (id === "tracks") document.getElementById("tracks").scrollIntoView();
});
