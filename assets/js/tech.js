import { mountLayout, esc } from "./layout.js";
import { TECH } from "./data-tech.js";

mountLayout();
const $ = id => document.getElementById(id);
const STAGE = { 1: "Start here", 2: "Learn next", 3: "Later" };
let area = (location.hash || "").slice(1);
if (!TECH.some(t => t.id === area)) area = "all";

$("areaChips").innerHTML = [`<button class="chip" data-v="all">All</button>`]
  .concat(TECH.map(t => `<button class="chip" data-v="${t.id}">${esc(t.name)}</button>`)).join("");

$("techAreas").innerHTML = TECH.map(t => `
  <section class="tech-area" data-area="${t.id}" id="area-${t.id}">
    <div class="sec-head"><h2>${esc(t.name)}</h2><p class="muted">${esc(t.blurb)}</p></div>
    ${[1, 2, 3].map(st => `
      <div class="tech-stage" data-stage="${st}">
        <span class="label"><i class="sd s${st}"></i>${STAGE[st]}</span>
        <div class="tech-grid">
          ${t.items.filter(i => i[2] === st).map(([n, d]) => `<div class="tech-card card" data-q="${esc((n + " " + d).toLowerCase())}"><b>${esc(n)}</b><span>${esc(d)}</span></div>`).join("")}
        </div>
      </div>`).join("")}
  </section>`).join("");

function apply() {
  document.querySelectorAll("#areaChips .chip").forEach(c => c.setAttribute("aria-pressed", c.dataset.v === area ? "true" : "false"));
  const q = $("tq").value.trim().toLowerCase(); let any = 0;
  document.querySelectorAll(".tech-area").forEach(sec => {
    const inArea = area === "all" || sec.dataset.area === area; let vis = 0;
    sec.querySelectorAll(".tech-stage").forEach(stg => {
      let n = 0;
      stg.querySelectorAll(".tech-card").forEach(c => { const ok = inArea && (!q || c.dataset.q.includes(q)); c.hidden = !ok; if (ok) n++; });
      stg.hidden = n === 0; vis += n;
    });
    sec.hidden = vis === 0; any += vis;
  });
  $("techEmpty").hidden = any > 0;
}
$("areaChips").addEventListener("click", e => {
  const c = e.target.closest(".chip"); if (!c) return;
  area = c.dataset.v; history.replaceState(null, "", area === "all" ? location.pathname : "#" + area); apply();
});
$("tq").addEventListener("input", apply);
apply();
