import { mountLayout, esc } from "./layout.js";

mountLayout();
const $ = id => document.getElementById(id);
const ITEMS = [
  "Three printed copies of your resume", "College ID card and a government photo ID", "Admit card or interview call letter, if issued",
  "Two passport-size photos", "Copies of mark sheets and certificates", "A pen and a small notepad",
  "Formal clothes ironed the night before", "Shoes polished", "Route planned to reach 30 minutes early",
  "Phone charged and set to silent", "Your 60–90 second introduction practiced aloud", "Two or three questions to ask the panel"
];
const KEY = "cl-interview-checklist";
let done = {};
try { done = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {} };

function render() {
  $("dayChecklist").innerHTML = ITEMS.map((t, i) => `<li><label class="chk"><input type="checkbox" id="ck-${i}" ${done[i] ? "checked" : ""}><span></span></label><label for="ck-${i}" class="${done[i] ? "struck" : ""}">${esc(t)}</label></li>`).join("");
}
$("dayChecklist").addEventListener("change", e => {
  const i = +e.target.id.slice(3); if (e.target.checked) done[i] = 1; else delete done[i]; save(); render();
});
$("resetChecklist").onclick = () => { done = {}; save(); render(); };
render();

$("copyEmail").onclick = () => {
  const text = $("emailTpl").textContent;
  const fallback = () => { const r = document.createRange(); r.selectNodeContents($("emailTpl")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); $("copyMsg").textContent = "Text selected. Press Ctrl+C to copy."; };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => $("copyMsg").textContent = "Copied", fallback);
  else fallback();
};
