import { mountLayout, esc } from "./layout.js";
import { onUser, listStudents, leaderboard, saveCoding } from "./store.js";
import { PLATFORMS, fetchStats, totalSolved, HANDLE_RE } from "./platforms.js";
import { counts, stepBreakdown, langBreakdown, TOTALS, DSA_ALL } from "./progress.js";

mountLayout();
const $ = id => document.getElementById(id);
const main = $("dash");

const bar = (name, done, total) => `<div class="bar-row${done === total && total ? " full" : ""}"><span>${esc(name)}</span>
  <span class="track"><i style="width:${total ? done / total * 100 : 0}%"></i></span><span class="v">${done}/${total}</span></div>`;
const ago = d => { if (!d) return "—"; const m = (Date.now() - d.getTime()) / 60000;
  return m < 60 ? "Just now" : m < 1440 ? Math.floor(m / 60) + "h ago" : Math.floor(m / 1440) + "d ago"; };

onUser(async u => {
  if (!u) { location.replace("login.html?next=dashboard.html"); return; }
  if (u.noProfile || u.needsVerify) { location.replace("login.html?next=dashboard.html"); return; }
  if (u.isInstructor) return instructorView(u);
  studentView(u);
});

/* ───────── Student ───────── */
async function studentView(u) {
  const c = counts(u.progress);
  const steps = stepBreakdown(u.progress.dsa.d), langs = langBreakdown(u.progress.practice.d);
  const starred = Object.keys(u.progress.dsa.r || {}).length;
  const stepsDone = steps.filter(s => s.done === s.total).length;
  main.innerHTML = `
    <div class="page-head"><span class="eyebrow">Dashboard</span><h1>Welcome Back, ${esc(u.name.split(" ")[0])}</h1>
      <p class="lede">${esc(u.roll || "")}${u.year ? " · " + esc(u.year) : ""} · ${esc(u.email)}</p></div>
    <div class="kpis">
      <div class="kpi"><span>DSA solved</span><b>${c.dsa}</b><span>of ${TOTALS.dsa}</span></div>
      <div class="kpi"><span>Practice exercises</span><b>${c.practice}</b><span>of ${TOTALS.practice}</span></div>
      <div class="kpi"><span>Steps finished</span><b>${stepsDone}</b><span>of ${steps.length}</span></div>
      <div class="kpi"><span>Starred for revision</span><b>${starred}</b><span><a href="dsa.html">Open DSA Sheet</a></span></div>
    </div>
    ${profilePanel(u)}
    <div id="codingMount"></div>
    <section class="block" style="padding-bottom:0">
      <div class="grid g2" style="align-items:start">
        <div class="card"><h3>DSA Sheet by step</h3><div class="bars">${steps.map(s => bar(s.name, s.done, s.total)).join("")}</div></div>
        <div style="display:grid;gap:16px">
          <div class="card"><h3>Practice sheets</h3><div class="bars">${langs.some(l => l.done) ? langs.filter(l => l.done).map(l => bar(l.name, l.done, l.total)).join("") : '<p>No practice items ticked yet. <a href="practice.html">Open the practice sheets</a>.</p>'}</div></div>
          <div class="card"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap"><h3>Leaderboard</h3>
            <select id="lbYear" aria-label="Filter by year" style="padding:6px 8px;border-radius:8px;border:1px solid var(--line);background:var(--surface)">
              <option value="">All years</option><option>1st year</option><option>2nd year</option><option>3rd year</option></select></div>
            <div id="lb" class="muted">Loading…</div></div>
        </div>
      </div>
    </section>`;
  mountCoding(u);
  let rows = [];
  try { rows = await leaderboard(); } catch (e) { $("lb").textContent = "Couldn't load the leaderboard. Reload the page to try again."; return; }
  const draw = () => {
    const y = $("lbYear").value;
    const list = rows.filter(r => !y || r.year === y).sort((a, b) => (b.dsa + b.practice) - (a.dsa + a.practice)).slice(0, 15);
    $("lb").innerHTML = list.length ? `<div class="table-wrap" style="border:0"><table class="data" style="min-width:0"><thead><tr><th>#</th><th>Name</th><th>DSA</th><th>Practice</th></tr></thead><tbody>
      ${list.map((r, i) => `<tr class="${r.uid === u.uid ? "me" : ""}"><td class="rank">${i + 1}</td><td>${esc(r.name)}${r.example ? '<span class="ex">example</span>' : ""}</td><td class="num">${r.dsa}</td><td class="num">${r.practice}</td></tr>`).join("")}
      </tbody></table></div>` : "No students in this year yet.";
  };
  $("lbYear").onchange = draw; draw();
}

/* ───────── Instructor ───────── */
async function instructorView(u) {
  main.innerHTML = `<div class="page-head"><span class="eyebrow">Instructor dashboard</span><h1>Club progress</h1>
    <p class="lede">Every member's DSA Sheet and practice sheet progress. Click a student to see their progress by step.</p></div><div id="body" class="muted">Loading students…</div>`;
  let list;
  try { list = await listStudents(); }
  catch (e) { $("body").innerHTML = `<div class="alert err">Couldn't load students. Check that your email is listed in config.js and in firestore.rules, then reload.</div>`; return; }
  list.forEach(s => { s.cpN = totalSolved(s.coding); s.dsaN = s.example ? s.dsaCount : counts({ dsa: s.dsa, practice: s.practice }).dsa; s.prN = s.example ? s.practiceCount : counts({ dsa: s.dsa, practice: s.practice }).practice; });

  const week = Date.now() - 7 * 86400000;
  const avg = list.length ? Math.round(list.reduce((a, s) => a + s.dsaN, 0) / list.length) : 0;
  const active = list.filter(s => s.updatedAt && s.updatedAt.getTime() > week).length;
  const hasEx = list.some(s => s.example);

  $("body").outerHTML = `
    ${hasEx ? '<div class="alert warn" style="margin-bottom:16px">Rows marked “example” are sample students shown in demo mode. They disappear once Firebase is connected.</div>' : ""}
    <div class="kpis">
      <div class="kpi"><span>Members</span><b>${list.length}</b><span>registered</span></div>
      <div class="kpi"><span>Average DSA solved</span><b>${avg}</b><span>of ${TOTALS.dsa}</span></div>
      <div class="kpi"><span>Active this week</span><b>${active}</b><span>saved progress in 7 days</span></div>
      <div class="kpi"><span>Inactive this week</span><b>${list.length - active}</b><span>follow up with them</span></div>
    </div>
    <section class="block" style="padding-bottom:0;gap:14px">
      <div class="toolrow">
        <input id="fq" type="search" placeholder="Search name or roll number" aria-label="Search students" style="flex:1 1 220px;min-width:0">
        <select id="fy" aria-label="Filter by year"><option value="">All years</option><option>1st year</option><option>2nd year</option><option>3rd year</option></select>
        <button class="btn btn-ghost btn-sm" id="csvBtn">Download CSV</button>
        <span class="save-state" id="csvMsg" role="status"></span>
      </div>
      <div class="table-wrap"><table class="data"><thead><tr>
        <th class="sortable" data-k="name">Name</th><th class="sortable" data-k="roll">Roll no.</th><th class="sortable" data-k="year">Year</th>
        <th class="sortable" data-k="dsaN">DSA</th><th class="sortable" data-k="prN">Practice</th><th class="sortable" data-k="cpN">Coding profiles</th><th class="sortable" data-k="updatedAt">Last active</th>
      </tr></thead><tbody id="tb"></tbody></table></div>
      <div class="card" id="detail" hidden></div>
    </section>`;

  let sortK = "dsaN", dir = -1;
  const filtered = () => {
    const q = $("fq").value.trim().toLowerCase(), y = $("fy").value;
    return list.filter(s => (!y || s.year === y) && (!q || (s.name + " " + s.roll).toLowerCase().includes(q)))
      .sort((a, b) => { const x = a[sortK] ?? "", z = b[sortK] ?? ""; return (x > z ? 1 : x < z ? -1 : 0) * dir; });
  };
  const draw = () => {
    const rows = filtered();
    $("tb").innerHTML = rows.length ? rows.map(s => `<tr data-uid="${esc(s.uid)}" style="cursor:pointer">
      <td>${esc(s.name)}${s.example ? '<span class="ex">example</span>' : ""}${s.verified === false ? '<span class="tag-unv" title="This student hasn\'t verified their email yet">not verified</span>' : ""}</td><td>${esc(s.roll)}</td><td>${esc(s.year)}</td>
      <td class="num">${s.dsaN} <span class="muted">(${Math.round(s.dsaN / TOTALS.dsa * 100)}%)</span></td><td class="num">${s.prN}</td><td class="num">${s.cpN || "—"}</td><td>${ago(s.updatedAt)}</td></tr>`).join("")
      : `<tr><td colspan="7" class="muted">No students match.</td></tr>`;
  };
  $("fq").oninput = draw; $("fy").onchange = draw;
  document.querySelectorAll(".sortable").forEach(th => th.onclick = () => { const k = th.dataset.k; dir = sortK === k ? -dir : (k === "name" || k === "roll" ? 1 : -1); sortK = k; draw(); });
  $("tb").onclick = e => {
    const tr = e.target.closest("tr[data-uid]"); if (!tr) return;
    const s = list.find(x => x.uid === tr.dataset.uid), d = $("detail");
    d.hidden = false;
    d.innerHTML = s.example ? `<h3>${esc(s.name)}</h3><p>This is a sample row. Real students show their progress by step here.</p>` :
      `<h3>${esc(s.name)} · ${esc(s.roll)}</h3><p>${esc(s.email)}</p><div class="grid g2" style="align-items:start">
        <div class="bars">${stepBreakdown(s.dsa.d || {}).map(x => bar(x.name, x.done, x.total)).join("")}</div>
        <div class="bars">${langBreakdown(s.practice.d || {}).filter(x => x.done).map(x => bar(x.name, x.done, x.total)).join("") || "<p>No practice items ticked yet.</p>"}</div></div>${codingDetail(s)}`;
    d.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  $("csvBtn").onclick = () => {
    const rows = [["Name", "Roll number", "Year", "Email", "DSA solved", "Practice done", "Coding profiles solved", ...PLATFORMS.map(p => p.name + " handle"), "Email verified", "Last active"]]
      .concat(filtered().map(s => [s.name, s.roll, s.year, s.email, s.dsaN, s.prN, s.cpN, ...PLATFORMS.map(p => (s.coding && s.coding.handles[p.id]) || ""), s.verified === false ? "No" : "Yes", s.updatedAt ? s.updatedAt.toISOString().slice(0, 10) : ""]));
    const csv = rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "console-loggers-progress-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.append(a); a.click(); a.remove();
    $("csvMsg").textContent = "CSV downloaded";
  };
  draw();
}


/* ───────── Coding-platform profile: solved ring, activity heatmap, streak ───────── */
function dayKey(ts) { const d = new Date(ts); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
function profilePanel(u) {
  const dsaDone = u.progress.dsa.d || {}, prDone = u.progress.practice.d || {};
  // Solved by difficulty (DSA problems only, concepts excluded)
  const tot = { E: 0, M: 0, H: 0 }, got = { E: 0, M: 0, H: 0 };
  DSA_ALL.forEach(it => { if (tot[it.d] !== undefined) { tot[it.d]++; if (dsaDone[it.id]) got[it.d]++; } });
  const solved = got.E + got.M + got.H, all = tot.E + tot.M + tot.H;
  const R = 54, C = 2 * Math.PI * R; let off = 0;
  const arcs = [["E", "var(--easy)"], ["M", "var(--med)"], ["H", "var(--hard)"]].map(([k, col]) => {
    const len = all ? got[k] / all * C : 0; const a = `<circle cx="64" cy="64" r="${R}" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="butt" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 64 64)" class="ring-arc"/>`; off += len; return a;
  }).join("");
  // Activity per day from tick dates
  const per = {};
  [dsaDone, prDone].forEach(m => Object.values(m).forEach(v => { if (typeof v === "number" && v > 1e12) { const k = dayKey(v); per[k] = (per[k] || 0) + 1; } }));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const WEEKS = 36, start = new Date(today); start.setDate(start.getDate() - (WEEKS * 7 - 1) - start.getDay());
  let cells = "", activeDays = 0, d = new Date(start);
  for (let w = 0; w < WEEKS + 1; w++) {
    cells += '<div class="hm-col">';
    for (let i = 0; i < 7; i++) {
      if (d > today) { cells += '<i class="hm-cell hm-empty"></i>'; }
      else { const n = per[dayKey(d)] || 0; if (n) activeDays++;
        const lv = n === 0 ? 0 : n < 3 ? 1 : n < 6 ? 2 : n < 10 ? 3 : 4;
        cells += `<i class="hm-cell l${lv}" title="${d.toDateString()}: ${n} solved"></i>`; }
      d.setDate(d.getDate() + 1);
    }
    cells += "</div>";
  }
  // Streaks
  let streak = 0; const c = new Date(today);
  if (!per[dayKey(c)]) c.setDate(c.getDate() - 1);            // today not done yet: count up to yesterday
  while (per[dayKey(c)]) { streak++; c.setDate(c.getDate() - 1); }
  const days = Object.keys(per).map(k => { const [y, m, dd] = k.split("-").map(Number); return new Date(y, m - 1, dd).getTime(); }).sort((a, b) => a - b);
  let best = 0, run = 0, prev = null;
  days.forEach(t => { run = prev !== null && t - prev <= 90000000 ? run + 1 : 1; best = Math.max(best, run); prev = t; });
  return `
  <section class="block profile" style="padding-bottom:0">
    <div class="grid profile-grid">
      <div class="card ring-card">
        <h3>Solved Problems</h3>
        <div class="ring-wrap">
          <svg viewBox="0 0 128 128" width="150" height="150" aria-label="${solved} of ${all} DSA problems solved">
            <circle cx="64" cy="64" r="${R}" fill="none" stroke="rgb(255 255 255 / .07)" stroke-width="10"/>${arcs}
          </svg>
          <div class="ring-center"><b>${solved}</b><span>/ ${all}</span><small>solved</small></div>
        </div>
        <div class="ring-legend">
          <div class="rl e"><span>Easy</span><b>${got.E}<em>/${tot.E}</em></b></div>
          <div class="rl m"><span>Medium</span><b>${got.M}<em>/${tot.M}</em></b></div>
          <div class="rl h"><span>Hard</span><b>${got.H}<em>/${tot.H}</em></b></div>
        </div>
      </div>
      <div class="card heat-card">
        <div class="heat-head"><h3>Activity</h3>
          <div class="streaks"><span><b>${streak}</b> day streak</span><span><b>${best}</b> best</span><span><b>${activeDays}</b> active days</span></div></div>
        <div class="heatmap" role="img" aria-label="Problems solved per day over the last ${WEEKS} weeks">${cells}</div>
        <div class="heat-legend"><span>Less</span><i class="hm-cell l0"></i><i class="hm-cell l1"></i><i class="hm-cell l2"></i><i class="hm-cell l3"></i><i class="hm-cell l4"></i><span>More</span></div>
      </div>
    </div>
  </section>`;
}


/* ───────── Coding profiles: LeetCode, CodeChef, GeeksforGeeks, Codeforces ───────── */
const SRC_LABEL = { official: "Live · official API", community: "Live · community API", manual: "Self-reported" };
function agoShort(t) { if (!t) return ""; const m = (Date.now() - t) / 60000; return m < 1 ? "just now" : m < 60 ? Math.floor(m) + " min ago" : m < 1440 ? Math.floor(m / 60) + " h ago" : Math.floor(m / 1440) + " d ago"; }
function statExtra(p, st) {
  if (!st) return "";
  if (p.id === "codeforces" && (st.rating || st.rank)) return `<span>${st.rating ? "Rating " + st.rating : ""}${st.rating && st.rank ? " · " : ""}${st.rank ? esc(st.rank) : ""}</span>`;
  if (p.id === "leetcode" && st.easy != null && st.src !== "manual") return `<span class="cp-split"><em class="e">E ${st.easy}</em><em class="m">M ${st.medium}</em><em class="h">H ${st.hard}</em></span>`;
  if (p.id === "gfg" && st.score) return `<span>Coding score ${st.score}</span>`;
  return "";
}

function codingDetail(s) {
  const c = s.coding || { handles: {}, stats: {} };
  const rows = PLATFORMS.filter(p => c.handles[p.id]).map(p => { const st = c.stats[p.id] || {};
    return `<div class="cpd"><b>${p.name}</b> <a href="${p.url(c.handles[p.id])}" target="_blank" rel="noopener">@${esc(c.handles[p.id])}</a> · ${st.solved != null ? st.solved + " solved" : "no count yet"} <span class="muted">(${SRC_LABEL[st.src] || "not checked"})</span></div>`; }).join("");
  return `<div class="cp-detail"><h3>Coding profiles</h3>${rows || '<p class="muted">No coding profiles linked yet.</p>'}</div>`;
}

function mountCoding(u) {
  const box = document.getElementById("codingMount"); if (!box) return;
  const coding = { handles: { ...(u.coding?.handles || {}) }, stats: { ...(u.coding?.stats || {}) } };
  const editing = new Set(PLATFORMS.filter(p => !coding.handles[p.id]).map(p => p.id));
  const busy = new Set();
  const msgs = {};

  const persist = async () => { try { await saveCoding(coding, totalSolved(coding)); } catch (e) { console.error(e); } };

  async function lookup(pid, manual) {
    const p = PLATFORMS.find(x => x.id === pid), h = coding.handles[pid];
    msgs[pid] = null;
    if (p.auto) {
      busy.add(pid); draw();
      try { coding.stats[pid] = await fetchStats(pid, h); }
      catch (e) {
        if (manual != null) { coding.stats[pid] = { solved: manual, src: "manual", at: Date.now() }; msgs[pid] = { kind: "warn", text: "Couldn't fetch automatically, so your typed count was saved." }; }
        else { msgs[pid] = { kind: "warn", text: "Couldn't fetch your count automatically right now. Click Edit and type your solved count, or try Refresh later." }; }
      }
      busy.delete(pid);
    } else if (manual != null) {
      coding.stats[pid] = { solved: manual, src: "manual", at: Date.now() };
    }
    await persist(); draw();
  }

  function card(p) {
    const h = coding.handles[p.id], st = coding.stats[p.id], ed = editing.has(p.id), m = msgs[p.id];
    const head = `<div class="cp-head"><span class="cp-badge" style="--c:${p.color}">${p.short}</span><div><b>${p.name}</b>
        ${h && !ed ? `<a href="${p.url(h)}" target="_blank" rel="noopener">@${esc(h)} ↗</a>` : `<span class="muted">${p.auto === "official" ? "Updates automatically" : p.auto ? "Tries to update automatically" : "Enter your count"}</span>`}</div>
        ${st && !ed ? `<span class="cp-src ${st.src}">${SRC_LABEL[st.src]}</span>` : ""}</div>`;
    if (ed) return `<form class="cp-card" data-pid="${p.id}" style="--c:${p.color}">${head}
        <div class="fl"><input id="h-${p.id}" value="${esc(h || "")}" placeholder=" " autocomplete="off" spellcheck="false"><label for="h-${p.id}">${p.hint}</label></div>
        <div class="fl"><input id="n-${p.id}" type="number" min="0" max="100000" inputmode="numeric" value="${st && st.src === "manual" ? st.solved : ""}" placeholder=" "><label for="n-${p.id}">${p.auto ? "Solved count (only if the lookup fails)" : "Problems solved"}</label></div>
        ${m ? `<p class="alert ${m.kind}">${esc(m.text)}</p>` : ""}
        <div class="cp-actions"><button class="btn btn-primary btn-sm" type="submit">Save</button>${h ? `<button class="btn btn-ghost btn-sm" type="button" data-act="cancel">Cancel</button><button class="linkbtn" type="button" data-act="unlink">Unlink</button>` : ""}</div>
      </form>`;
    return `<div class="cp-card" data-pid="${p.id}" style="--c:${p.color}">${head}
        <div class="cp-num">${busy.has(p.id) ? '<span class="spinner cp-spin"></span>' : `<b>${st && st.solved != null ? st.solved.toLocaleString("en-US") : "—"}</b><span>solved</span>`}</div>
        ${statExtra(p, st)}
        ${m ? `<p class="alert ${m.kind}">${esc(m.text)}</p>` : ""}
        <div class="cp-actions">${p.auto ? `<button class="btn btn-ghost btn-sm" data-act="refresh"${busy.has(p.id) ? " disabled" : ""}>Refresh</button>` : ""}<button class="btn btn-ghost btn-sm" data-act="edit">Edit</button>
          <span class="cp-time">${st ? "Updated " + agoShort(st.at) : ""}</span></div>
      </div>`;
  }

  function draw() {
    const total = totalSolved(coding), linked = PLATFORMS.filter(p => coding.handles[p.id]).length;
    box.innerHTML = `<section class="block" style="padding-bottom:0">
      <div class="cp-top"><div class="sec-head"><span class="eyebrow">Coding profiles</span><h2>Your coding profiles</h2>
        <p class="muted">Link your accounts to show your solved counts here. Your instructor can see them too.</p></div>
        <div class="cp-total"><b>${total.toLocaleString("en-US")}</b><span>solved across ${linked} of ${PLATFORMS.length} platforms</span></div></div>
      <div class="cp-grid">${PLATFORMS.map(card).join("")}</div>
      <p class="fine">Codeforces counts come from its official API. LeetCode and GeeksforGeeks counts come from free community-run services that may be slow or offline. CodeChef counts, and any typed numbers, are self-reported; your instructor can check them on your profile.</p>
    </section>`;
  }

  box.addEventListener("submit", async e => {
    const f = e.target.closest(".cp-card"); if (!f) return; e.preventDefault();
    const pid = f.dataset.pid, h = f.querySelector(`#h-${pid}`).value.trim(), nRaw = f.querySelector(`#n-${pid}`).value.trim();
    const manual = nRaw === "" ? null : Math.max(0, Math.min(100000, parseInt(nRaw, 10) || 0));
    if (!HANDLE_RE.test(h)) { msgs[pid] = { kind: "err", text: "Enter a valid username: letters, numbers, dots, dashes or underscores." }; draw(); return; }
    const p = PLATFORMS.find(x => x.id === pid);
    if (!p.auto && manual == null) { msgs[pid] = { kind: "err", text: "Enter how many problems you've solved on " + p.name + "." }; draw(); return; }
    if (coding.handles[pid] !== h) delete coding.stats[pid];
    coding.handles[pid] = h; editing.delete(pid);
    await lookup(pid, manual);
  });
  box.addEventListener("click", async e => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const pid = b.closest(".cp-card").dataset.pid, act = b.dataset.act;
    if (act === "edit") { editing.add(pid); msgs[pid] = null; draw(); document.getElementById("h-" + pid)?.focus(); }
    if (act === "cancel") { editing.delete(pid); msgs[pid] = null; draw(); }
    if (act === "refresh") await lookup(pid, null);
    if (act === "unlink") { delete coding.handles[pid]; delete coding.stats[pid]; msgs[pid] = null; await persist(); draw(); }
  });
  draw();
}
