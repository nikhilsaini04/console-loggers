import { mountLayout, esc, svgStar, svgNote, svgExt, svgChev } from "./layout.js";
import { onUser, currentUser, queueSave, onSaveState } from "./store.js";
import { STEPS, DSA_ALL, counts } from "./progress.js";
import { confetti, toast } from "./fx.js";

mountLayout();
const DIFF = { E: "Easy", M: "Medium", H: "Hard", C: "Concept" };
const $ = id => document.getElementById(id);
const UI_KEY = "cl-dsa-open";
let open = { 0: 1 };
try { open = JSON.parse(localStorage.getItem(UI_KEY)) || open; } catch (e) {}
const saveOpen = () => { try { localStorage.setItem(UI_KEY, JSON.stringify(open)); } catch (e) {} };

let P = { d: {}, r: {}, n: {} };
let canEdit = false;

const stepsEl = $("steps"), rowEl = {}, secEl = [];
stepsEl.innerHTML = STEPS.map((s, si) => `
  <section class="step" data-si="${si}">
    <button class="step-head" aria-expanded="false" aria-controls="rows-${si}">
      <span class="step-no">${String(si + 1).padStart(2, "0")}</span>
      <span><span class="step-name">${esc(s.n)}</span><span class="step-blurb">${esc(s.b)}</span></span>
      <span class="step-meta"><span class="cnt">0/${s.items.length}</span><span class="mini"><i style="width:0"></i></span></span>
      ${svgChev()}
    </button>
    <ul class="rows" id="rows-${si}" hidden>
      <li class="row-head" aria-hidden="true"><span>status</span><span>title</span><span>difficulty</span><span>revise</span><span>notes</span></li>
      ${s.rows.map(it => it.sub ? `<li class="sub">${esc(it.sub)}</li>` : `
      <li class="row" data-id="${it.id}">
        <label class="chk" title="Mark solved"><input type="checkbox" id="c-${it.id}" aria-label="Solved: ${esc(it.t)}"><span></span></label>
        <div class="row-main">
          ${it.slug ? `<a class="title" href="https://leetcode.com/problems/${it.slug}/" target="_blank" rel="noopener">${esc(it.t)}${svgExt()}</a>` : `<span class="title">${esc(it.t)}</span>`}
          <textarea class="note" id="n-${it.id}" placeholder="Key idea, edge cases, complexity…" hidden></textarea>
        </div>
        <span class="pill ${it.d}">${DIFF[it.d]}</span>
        <button class="icon star" aria-pressed="false" title="Star for revision" aria-label="Star for revision">${svgStar()}</button>
        <button class="icon notebtn" title="Notes" aria-label="Notes">${svgNote()}</button>
      </li>`).join("")}
    </ul>
  </section>`).join("");
stepsEl.querySelectorAll(".step").forEach(s => secEl.push(s));
stepsEl.querySelectorAll(".row").forEach(r => rowEl[r.dataset.id] = r);

function paintRows() {
  DSA_ALL.forEach(it => {
    const r = rowEl[it.id];
    const cb = r.querySelector("input"); cb.checked = !!P.d[it.id]; cb.disabled = !canEdit;
    r.classList.toggle("done", !!P.d[it.id]);
    r.querySelector(".star").setAttribute("aria-pressed", P.r[it.id] ? "true" : "false");
    r.querySelector(".star").disabled = !canEdit; r.querySelector(".notebtn").disabled = !canEdit;
    const n = P.n[it.id] || ""; r.querySelector(".note").value = n; r.classList.toggle("has-note", !!n);
  });
}

function setOpen(si, o, persist) {
  const sec = secEl[si];
  sec.querySelector(".step-head").setAttribute("aria-expanded", o ? "true" : "false");
  sec.querySelector(".rows").hidden = !o;
  if (persist) { if (o) open[si] = 1; else delete open[si]; saveOpen(); }
}

let fDiff = "all", fStat = "all";
const filtersActive = () => !!$("q").value.trim() || fDiff !== "all" || fStat !== "all";
function applyFilters() {
  const q = $("q").value.trim().toLowerCase(), active = filtersActive(); let total = 0;
  STEPS.forEach((s, si) => {
    let vis = 0;
    s.items.forEach(it => {
      let ok = true;
      if (q && !it.t.toLowerCase().includes(q)) ok = false;
      if (fDiff !== "all" && it.d !== fDiff) ok = false;
      if (fStat === "todo" && P.d[it.id]) ok = false;
      if (fStat === "done" && !P.d[it.id]) ok = false;
      if (fStat === "rev" && !P.r[it.id]) ok = false;
      rowEl[it.id].hidden = !ok; if (ok) vis++;
    });
    secEl[si].querySelectorAll(".sub").forEach(h => {
      let n = h.nextElementSibling, any = false;
      while (n && !n.classList.contains("sub")) { if (!n.hidden) { any = true; break; } n = n.nextElementSibling; }
      h.hidden = !any;
    });
    secEl[si].hidden = active && vis === 0;
    setOpen(si, active ? vis > 0 : !!open[si], false);
    total += vis;
  });
  $("empty").hidden = total > 0;
}

function updateStats() {
  const tot = { E: 0, M: 0, H: 0, C: 0 }, done = { E: 0, M: 0, H: 0, C: 0 }; let stepsDone = 0;
  STEPS.forEach((s, si) => {
    let d = 0; s.items.forEach(it => { tot[it.d]++; if (P.d[it.id]) { d++; done[it.d]++; } });
    const sec = secEl[si];
    sec.querySelector(".cnt").textContent = `${d}/${s.items.length}`;
    sec.querySelector(".mini i").style.width = (d / s.items.length * 100) + "%";
    sec.classList.toggle("complete", d === s.items.length);
    if (d === s.items.length) stepsDone++;
  });
  const T = DSA_ALL.length, D = done.E + done.M + done.H + done.C;
  $("doneN").textContent = D; $("ofN").textContent = `of ${T} solved`; $("pct").textContent = Math.round(D / T * 100) + "%";
  ["E", "M", "H", "C"].forEach(k => $("s" + k).style.width = (done[k] / T * 100) + "%");
  ["E", "M", "H"].forEach(k => $("d" + k).textContent = `${done[k]}/${tot[k]}`);
  $("revN").textContent = `${Object.keys(P.r).filter(k => rowEl[k]).length} starred`;
  $("stepsDone").textContent = `${stepsDone} of ${STEPS.length}`;
  const next = DSA_ALL.find(it => !P.d[it.id]);
  const nw = $("nextWrap");
  if (!next) { nw.innerHTML = "<strong>Every step finished.</strong>"; return; }
  nw.innerHTML = `<button type="button" class="next-btn" id="nextBtn">${esc(next.t)}</button><small class="muted">Step ${next.si + 1} · ${esc(STEPS[next.si].n)} · ${DIFF[next.d]}</small>`;
  $("nextBtn").onclick = () => {
    $("q").value = ""; fDiff = "all"; fStat = "all"; syncChips(); setOpen(next.si, true, true); applyFilters();
    const r = rowEl[next.id]; r.scrollIntoView({ behavior: "smooth", block: "center" }); r.querySelector("input").focus({ preventScroll: true });
  };
}

function commit() { const u = currentUser(); if (!u) return; u.progress.dsa = P; queueSave(counts(u.progress)); updateStats(); }

stepsEl.addEventListener("click", e => {
  const head = e.target.closest(".step-head");
  if (head) { const si = +head.closest(".step").dataset.si; setOpen(si, head.getAttribute("aria-expanded") !== "true", !filtersActive()); return; }
  if (!canEdit) return;
  const row = e.target.closest(".row"); if (!row) return; const id = row.dataset.id;
  if (e.target.closest(".star")) { if (P.r[id]) delete P.r[id]; else P.r[id] = 1; row.querySelector(".star").setAttribute("aria-pressed", P.r[id] ? "true" : "false"); commit(); return; }
  if (e.target.closest(".notebtn")) { const ta = row.querySelector(".note"); ta.hidden = !ta.hidden; if (!ta.hidden) ta.focus(); }
});
stepsEl.addEventListener("change", e => {
  if (!e.target.matches(".chk input") || !canEdit) return;
  const row = e.target.closest(".row"), id = row.dataset.id;
  if (e.target.checked) P.d[id] = Date.now(); else delete P.d[id];
  row.classList.toggle("done", e.target.checked); commit();
  if (e.target.checked) {
    const s = STEPS[+row.closest(".step").dataset.si];
    if (s.items.every(it => P.d[it.id])) { confetti(); toast(`Step complete: ${s.n}`); }
  }
});
stepsEl.addEventListener("input", e => {
  if (!e.target.matches(".note") || !canEdit) return;
  const row = e.target.closest(".row"), id = row.dataset.id, v = e.target.value;
  if (v.trim()) P.n[id] = v.slice(0, 1000); else delete P.n[id];
  row.classList.toggle("has-note", !!v.trim()); commit();
});

function syncChips() {
  document.querySelectorAll("#diffChips .chip").forEach(c => c.setAttribute("aria-pressed", c.dataset.v === fDiff ? "true" : "false"));
  document.querySelectorAll("#statChips .chip").forEach(c => c.setAttribute("aria-pressed", c.dataset.v === fStat ? "true" : "false"));
}
$("diffChips").addEventListener("click", e => { const c = e.target.closest(".chip"); if (!c) return; fDiff = c.dataset.v; syncChips(); applyFilters(); });
$("statChips").addEventListener("click", e => { const c = e.target.closest(".chip"); if (!c) return; fStat = c.dataset.v; syncChips(); applyFilters(); });
$("q").addEventListener("input", applyFilters);
$("toggleAll").addEventListener("click", () => {
  const anyClosed = secEl.some(s => !s.hidden && s.querySelector(".rows").hidden);
  secEl.forEach((s, si) => setOpen(si, anyClosed, !filtersActive()));
  $("toggleAll").textContent = anyClosed ? "Collapse all" : "Expand all";
});

onSaveState(s => { const el = $("saveState"); el.className = "save-state" + (s === "error" ? " error" : "");
  el.textContent = s === "saving" ? "Saving…" : s === "saved" ? "All changes saved" : s === "error" ? "Couldn't save. Check your connection." : ""; });

onUser(u => {
  canEdit = !!u && !u.noProfile && !u.needsVerify && !(u.isInstructor && !u.roll);
  P = u ? u.progress.dsa : { d: {}, r: {}, n: {} };
  $("loginNotice").hidden = !!u;
  $("instrNotice").hidden = !(u && u.isInstructor && !u.roll);
  paintRows(); updateStats(); applyFilters();
});
