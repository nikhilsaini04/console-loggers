// Turns the sheet data into flat lists with stable IDs, and counts progress.
import { STEPS } from "./data-dsa.js";
import { LANGS } from "./data-practice.js";

const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const DSA_ALL = [];
STEPS.forEach((s, si) => {
  s.items = []; s.rows = [];
  s.i.forEach(([t, sl, d]) => {
    if (t === "#") { s.rows.push({ sub: sl }); return; }
    const it = { t, slug: sl, d, id: sl || "c-" + slug(t), si };
    s.items.push(it); s.rows.push(it); DSA_ALL.push(it);
  });
});
export { STEPS };

export const PRACTICE_ALL = [];
const LEVEL = { B: 0, I: 1, A: 2 };
LANGS.forEach(L => {
  L.rows = []; L.list = [];
  // Collect items into topic groups (same-named groups merge), skip duplicates,
  // order groups from easiest to hardest on average, then each group basic → intermediate → advanced.
  const groups = [], byName = new Map(), seen = new Set(), seenText = new Set(); let g = null;
  L.items.forEach(([t, lv]) => {
    if (t === "#") {
      g = byName.get(lv);
      if (!g) { g = { sub: lv, items: [], order: groups.length }; byName.set(lv, g); groups.push(g); }
      return;
    }
    if (!g) { g = { sub: null, items: [], order: -1 }; groups.push(g); }
    const [q, ans] = t.split("||");
    const full = slug(q);
    if (seenText.has(full)) return; seenText.add(full);
    let id = L.id + "-" + full.slice(0, 60), n = 2;
    while (seen.has(id)) id = L.id + "-" + full.slice(0, 60) + "-" + n++;
    seen.add(id);
    g.items.push({ t: q, ans, d: lv, id, lang: L.id });
  });
  const avg = gr => gr.items.reduce((a, it) => a + LEVEL[it.d], 0) / (gr.items.length || 1);
  // Language sheets sort topics by difficulty; interview and Java-stack sheets keep the order they were written in.
  if (L.group === "Languages" || L.group === "Domains") groups.sort((a, b) => (avg(a) - avg(b)) || (a.order - b.order));
  else groups.sort((a, b) => a.order - b.order);
  groups.forEach(gr => {
    if (gr.sub) L.rows.push({ sub: gr.sub });
    gr.items.sort((a, b) => LEVEL[a.d] - LEVEL[b.d]).forEach(it => { L.rows.push(it); L.list.push(it); PRACTICE_ALL.push(it); });
  });
});
export { LANGS };

const DSA_IDS = new Set(DSA_ALL.map(x => x.id));
const PR_IDS = new Set(PRACTICE_ALL.map(x => x.id));

export function counts(progress) {
  const dsa = Object.keys(progress?.dsa?.d || {}).filter(k => DSA_IDS.has(k)).length;
  const practice = Object.keys(progress?.practice?.d || {}).filter(k => PR_IDS.has(k)).length;
  return { dsa, practice };
}
export function stepBreakdown(dsaDone) {
  return STEPS.map(s => ({ name: s.n, total: s.items.length, done: s.items.filter(it => dsaDone[it.id]).length }));
}
export function langBreakdown(prDone) {
  return LANGS.map(L => ({ name: L.name, total: L.list.length, done: L.list.filter(it => prDone[it.id]).length }));
}
export const TOTALS = { dsa: DSA_ALL.length, practice: PRACTICE_ALL.length };
