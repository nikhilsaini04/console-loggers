// Coding-platform accounts: profile links and solved-count lookups.
// Codeforces has an official public API. LeetCode and GeeksforGeeks have no official API, so community-run
// APIs are tried and the student can type the number if they don't answer. CodeChef is entered by hand.

export const HANDLE_RE = /^[A-Za-z0-9_.-]{1,40}$/;

export const PLATFORMS = [
  { id: "leetcode", name: "LeetCode", short: "LC", color: "#ffd166", auto: "community",
    url: h => `https://leetcode.com/u/${encodeURIComponent(h)}/`, hint: "Your LeetCode username" },
  { id: "codechef", name: "CodeChef", short: "CC", color: "#a78bfa", auto: null,
    url: h => `https://www.codechef.com/users/${encodeURIComponent(h)}`, hint: "Your CodeChef username" },
  { id: "gfg", name: "GeeksforGeeks", short: "GFG", color: "#2cff8f", auto: "community",
    url: h => `https://www.geeksforgeeks.org/user/${encodeURIComponent(h)}/`, hint: "Your GeeksforGeeks username" },
  { id: "codeforces", name: "Codeforces", short: "CF", color: "#22e6ff", auto: "official",
    url: h => `https://codeforces.com/profile/${encodeURIComponent(h)}`, hint: "Your Codeforces handle" }
];

async function getJSON(url, ms = 15000) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

const FETCHERS = {
  // Official API: counts unique accepted problems, plus current rating and rank.
  async codeforces(h) {
    const info = await getJSON(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(h)}`);
    if (info.status !== "OK") throw new Error(info.comment || "Handle not found");
    const st = await getJSON(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(h)}`, 25000);
    if (st.status !== "OK") throw new Error(st.comment || "Couldn't read submissions");
    const solved = new Set(st.result.filter(s => s.verdict === "OK" && s.problem).map(s => `${s.problem.contestId}-${s.problem.index}`));
    const u = info.result[0] || {};
    return { solved: solved.size, rating: u.rating || null, rank: u.rank || null };
  },
  // Community API (alfa-leetcode-api). Not run by LeetCode; may be slow on first request.
  async leetcode(h) {
    const d = await getJSON(`https://alfa-leetcode-api.onrender.com/${encodeURIComponent(h)}/solved`, 25000);
    if (d == null || d.errors || d.solvedProblem == null) throw new Error("User not found");
    return { solved: +d.solvedProblem, easy: +d.easySolved || 0, medium: +d.mediumSolved || 0, hard: +d.hardSolved || 0 };
  },
  // Community API for GeeksforGeeks. Not run by GeeksforGeeks.
  async gfg(h) {
    const d = await getJSON(`https://geekforgeekapi.onrender.com/coding-stats?username=${encodeURIComponent(h)}`, 25000);
    const n = parseInt(d && (d.problems_solved ?? d.totalProblemsSolved), 10);
    if (!Number.isFinite(n)) throw new Error("User not found");
    return { solved: n, score: d.coding_score ? +d.coding_score : null };
  }
};

// Returns { solved, ...extra, src: "official" | "community", at } or throws.
export async function fetchStats(platformId, handle) {
  const f = FETCHERS[platformId];
  if (!f) throw new Error("No automatic lookup for this platform");
  const r = await f(handle);
  const p = PLATFORMS.find(x => x.id === platformId);
  return { ...r, src: p.auto, at: Date.now() };
}

export function totalSolved(coding) {
  return PLATFORMS.reduce((sum, p) => sum + (+(coding?.stats?.[p.id]?.solved) || 0), 0);
}
