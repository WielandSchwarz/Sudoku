// fast harbour level search: random boards, BFS for the fewest moves, bucket by difficulty
const N = 6, fs = require('fs');
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function gen(R, nb) {
  const P = [['h', 3]], S = [[Math.floor(R() * 2), 2]]; let tries = 0;
  const occ = () => { const g = Array.from({ length: N }, () => Array(N).fill(-1)); P.forEach((p, i) => { for (let k = 0; k < p[1]; k++) g[S[i][1] + (p[0] === 'v' ? k : 0)][S[i][0] + (p[0] === 'h' ? k : 0)] = i; }); return g; };
  while (P.length < nb && tries++ < 400) {
    const o = R() < .5 ? 'h' : 'v', L = R() < .67 ? 2 : 3; let c, r;
    if (o === 'h') { c = Math.floor(R() * (N - L + 1)); r = [0, 1, 3, 4, 5][Math.floor(R() * 5)]; } else { c = Math.floor(R() * N); r = Math.floor(R() * (N - L + 1)); }
    const g = occ(); let ok = true; for (let k = 0; k < L; k++) if (g[r + (o === 'v' ? k : 0)][c + (o === 'h' ? k : 0)] !== -1) ok = false;
    if (ok) { P.push([o, L]); S.push([c, r]); }
  }
  return [P, S];
}
function solve(P, S0) {
  const n = P.length, pos0 = S0.map(s => P.indexOf ? 0 : 0);
  const enc = st => st.join(','), start = S0.map((s, i) => P[i][0] === 'h' ? s[0] : s[1]), fixed = S0.map((s, i) => P[i][0] === 'h' ? s[1] : s[0]);
  const seen = new Map([[enc(start), 0]]); let q = [start], d = 0;
  while (q.length) {
    const nq = [];
    for (const st of q) {
      if (st[0] === N - 3) return d;
      const g = Array.from({ length: N }, () => Array(N).fill(-1));
      for (let i = 0; i < n; i++) for (let k = 0; k < P[i][1]; k++) { if (P[i][0] === 'h') g[fixed[i]][st[i] + k] = i; else g[st[i] + k][fixed[i]] = i; }
      for (let i = 0; i < n; i++) {
        for (const dir of [-1, 1]) {
          let k = 1;
          while (true) {
            const np = st[i] + dir * k, cell = dir < 0 ? np : st[i] + P[i][1] - 1 + k;
            if (cell < 0 || cell >= N) break;
            const v = P[i][0] === 'h' ? g[fixed[i]][cell] : g[cell][fixed[i]]; if (v !== -1) break;
            const ns = st.slice(); ns[i] = np; const key = enc(ns);
            if (!seen.has(key)) { seen.set(key, d + 1); nq.push(ns); }
            k++;
          }
        }
      }
    }
    q = nq; d++;
    if (seen.size > 400000) return null;
  }
  return null;
}
const buckets = {}, R = rng(12345), t0 = Date.now();
while (Date.now() - t0 < 240000) {
  const nb = 9 + Math.floor(R() * 6), [P, S] = gen(R, nb);
  if (S[0][0] + 3 >= N) continue;
  // the liner must not have a clear way out at the start
  const m = solve(P, S); if (!m || m < 3) continue;
  (buckets[m] = buckets[m] || []).push({ p: P.map((p, i) => [p[0], p[1], S[i][0], S[i][1]]), best: m });
}
const counts = {}; Object.keys(buckets).forEach(k => counts[k] = buckets[k].length); console.log(JSON.stringify(counts));
fs.writeFileSync('rush_buckets.json', JSON.stringify(Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.slice(0, 6)]))));
