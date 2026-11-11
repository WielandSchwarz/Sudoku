// Level generator for the pipe puzzle: builds a random bathroom (stations, cubbies, beams), routes a valid pipe network
// from the tap(s) to every station, turns it into pieces, checks it with the game's own flow logic, and sets tray + par.
const fs = require('fs');
eval(fs.readFileSync(__dirname + '/../ham2/pipelogic.js', 'utf8') + ';global.PL=PL;');
const ORIG = JSON.parse(fs.readFileSync(__dirname + '/../ham2/rplevels.json', 'utf8'));
let seed = +process.argv[2] || 7;
function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
function pick(a) { return a[Math.floor(rnd() * a.length)]; }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const C = 9, R = 5, DX = { l: -1, r: 1, u: 0, d: 0 }, DY = { l: 0, r: 0, u: -1, d: 1 }, OPP = { l: 'r', r: 'l', u: 'd', d: 'u' };
const W = { plant: 1, shower: 2, coffee: 2, sink: 2, tub: 3 };
const NEED = { plant: 'c', shower: 'w', coffee: 'w', tub: 'w', sink: null };
const key = (c, r) => c + ',' + r;

function placeStations(kinds) {
  // left to right, random gaps, inside the 9 columns
  const total = kinds.reduce((a, k) => a + W[k], 0); if (total > C) return null;
  let free = C - total, gaps = []; for (let i = 0; i <= kinds.length; i++) gaps.push(0);
  while (free-- > 0) gaps[ri(0, kinds.length)]++;
  let x = gaps[0], st = [];
  kinds.forEach((k, i) => { st.push({ k, sc: x, side: rnd() < .5 ? 'l' : 'r', w: W[k], h: 2, sr: 3 }); x += W[k] + gaps[i + 1]; });
  return st;
}
// route: randomized Dijkstra from a target cell to any cell of the network; it may jump straight across the other network (a crossing)
function route(L, net, other, start, opts) {
  const blocked = PL.blockSet(L), cost = {}, prev = {}, Q = [];
  const sk = key(start[0], start[1]); if (blocked[sk] || other[sk] || net[sk]) return null;
  cost[sk] = 0; Q.push([0, start[0], start[1]]);
  const free = (c, r) => c >= 0 && r >= 0 && c < C && r < R && !blocked[key(c, r)];
  while (Q.length) {
    Q.sort((a, b) => a[0] - b[0]); const [d, c, r] = Q.shift(), k = key(c, r);
    if (d > cost[k]) continue;
    if (net[k]) { const p = []; let q = k; while (q !== sk) { p.unshift(q); q = prev[q]; } p.unshift(sk); return p; }
    for (const dir of ['l', 'r', 'u', 'd']) {
      let nc = c + DX[dir], nr = r + DY[dir], nk = key(nc, nr), extra = 0;
      if (!free(nc, nr)) continue;
      if (other[nk]) {
        const straight = dir === 'l' || dir === 'r' ? 'ud' : 'lr';
        if (!opts.cross || norm(other[nk]) !== straight) continue;
        nc += DX[dir]; nr += DY[dir]; nk = key(nc, nr); extra = 2;
        if (!free(nc, nr) || other[nk]) continue;
      }
      if (net[nk]) { const arms = net[nk]; if (arms.length >= 3 || arms.indexOf(OPP[dir]) >= 0) continue; }
      const nd = d + 1 + extra + rnd() * opts.wig;
      if (cost[nk] == null || nd < cost[nk]) { cost[nk] = nd; prev[nk] = k; Q.push([nd, nc, nr]); }
    }
  }
  return null;
}
function addArm(net, k, a) { if (net[k].indexOf(a) < 0) net[k] = net[k] + a; }
function grow(L, src, tgts, other, opts, X) {
  const net = {}; net[key(src.c, src.r)] = src.d;
  for (const t of tgts) {
    const path = route(L, net, other, [t.c, t.r], opts); if (!path) return null;
    const cells = path.map(p => p.split(',').map(Number));
    net[path[0]] = 'd';
    for (let i = 0; i < cells.length - 1; i++) {
      const [c, r] = cells[i], [nc, nr] = cells[i + 1], dist = Math.abs(nc - c) + Math.abs(nr - r);
      const dir = nc > c ? 'r' : nc < c ? 'l' : nr > r ? 'd' : 'u', k = key(c, r), nk = key(nc, nr);
      if (dist === 2) X[key(c + DX[dir], r + DY[dir])] = 1;   // jumped over the other pipe
      addArm(net, k, dir); net[nk] = net[nk] || ''; addArm(net, nk, OPP[dir]);
      if (net[nk].length > 3) return null;
    }
  }
  return net;
}
function norm(a) { return ['l', 'r', 'u', 'd'].filter(x => a.indexOf(x) >= 0).join(''); }
function toPieces(net, X) {
  const pcs = [], used = {};
  const BEND = { rd: 0, dl: 1, ld: 1, lu: 2, ul: 2, ur: 3, ru: 3, dr: 0 }, TEE = { lrd: 0, lud: 1, lru: 2, rud: 3 };
  for (const k in X) { const [c, r] = k.split(',').map(Number); pcs.push({ t: 'X', c, r, o: 0 }); used[k] = 1; }
  // straight runs first
  const isH = k => net[k] && norm(net[k]) === 'lr' && !used[k], isV = k => net[k] && norm(net[k]) === 'ud' && !used[k];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (isH(key(c, r))) { let n = 0; while (c + n < C && isH(key(c + n, r))) n++;
      let x = c; while (n > 0) { const L = Math.min(n, pick(n >= 3 ? [3, 3, 2] : n === 2 ? [2, 2, 1] : [1])); pcs.push({ t: 'S' + L, c: x, r, o: 'h' }); for (let i = 0; i < L; i++) used[key(x + i, r)] = 1; x += L; n -= L; } }
  }
  for (let c = 0; c < C; c++) for (let r = 0; r < R; r++) {
    if (isV(key(c, r))) { let n = 0; while (r + n < R && isV(key(c, r + n))) n++;
      let y = r; while (n > 0) { const L = Math.min(n, pick(n >= 3 ? [3, 3, 2] : n === 2 ? [2, 2, 1] : [1])); pcs.push({ t: 'S' + L, c, r: y, o: 'v' }); for (let i = 0; i < L; i++) used[key(c, y + i)] = 1; y += L; n -= L; } }
  }
  for (const k in net) { if (used[k]) continue; const a = norm(net[k]), [c, r] = k.split(',').map(Number);
    if (a.length === 2) { const o = BEND[a]; if (o == null) return null; pcs.push({ t: 'B', c, r, o }); }
    else if (a.length === 3) { const o = TEE[a]; if (o == null) return null; pcs.push({ t: 'T', c, r, o }); }
    else return null; }
  return pcs;
}
// merge the two networks' cell arms (crossings become X)
function make(tier) {
  const temp = tier >= 4;
  const nSt = tier === 1 ? 1 : tier === 2 ? 2 : tier === 3 ? ri(3, 4) : tier === 4 ? 2 : 3;
  let pool = temp ? ['plant', 'shower', 'coffee', 'sink', 'tub', 'plant'] : ['plant', 'shower', 'coffee', 'sink', 'tub'];
  let kinds = []; for (let i = 0; i < nSt; i++) kinds.push(pick(pool));
  if (temp) { if (!kinds.includes('plant')) kinds[0] = 'plant'; if (!kinds.some(k => NEED[k] === 'w')) kinds[kinds.length - 1] = pick(['shower', 'coffee']); }
  kinds = shuffle(kinds);
  const st = placeStations(kinds); if (!st) return null;
  const L = { name: '', st, blocks: [], tray: {}, targets: [], space: [] };
  st.forEach(s => { for (let x = s.sc; x < s.sc + s.w; x++) for (let y = 3; y < 5; y++) { L.blocks.push([x, y]); L.space.push([x, y]); }
    const tc = s.side === 'l' ? s.sc : s.sc + s.w - 1, t = { c: tc, r: 2, d: 'd', k: s.k }; if (temp && NEED[s.k]) { t.need = NEED[s.k]; s.need = NEED[s.k]; } L.targets.push(t); });
  // the taps
  if (temp || rnd() < .6) L.src = { c: 0, r: ri(0, 2), d: 'l' }; else L.src = { c: ri(1, 7), r: 0, d: 'u' };
  if (temp) L.src2 = { c: ri(3, 7), r: 0, d: 'u', temp: 'c' };
  const tcells = {}; L.targets.forEach(t => tcells[key(t.c, t.r)] = 1);
  const nogo = k => tcells[k] || k === key(L.src.c, L.src.r) || L.src2 && k === key(L.src2.c, L.src2.r);
  // obstacles: a beam from the ceiling, a post from the floor, single cubbies
  const nB = tier === 1 ? ri(0, 1) : tier === 2 ? ri(1, 2) : ri(1, 3);
  if (rnd() < .5) { const c = ri(2, 7), len = ri(1, 2), cells = []; for (let y = 0; y < len; y++) cells.push([c, y]);
    if (!cells.some(q => nogo(key(q[0], q[1])))) { L.beam = [c, 0, len]; cells.forEach(q => L.blocks.push(q)); } }
  for (let i = 0; i < nB; i++) { const q = [ri(1, 8), ri(0, 2)]; if (!nogo(key(q[0], q[1])) && !L.blocks.some(b => b[0] === q[0] && b[1] === q[1])) L.blocks.push(q); }
  for (let i = 0; i < (tier >= 3 ? 2 : 1); i++) { const fc = []; for (let c = 0; c < C; c++) if (!L.blocks.some(b => b[0] === c && b[1] === 3)) fc.push(c);
    if (fc.length && rnd() < .5) { const c = pick(fc); L.blocks.push([c, 3]); L.blocks.push([c, 4]); } }
  const wig = tier === 1 ? .6 : tier === 2 ? 1.2 : 1.8;
  // networks
  let nets, X = {};
  if (!temp) {
    const net = grow(L, L.src, shuffle(L.targets.slice()), {}, { wig }, X); if (!net) return null; nets = [net];
  } else {
    const w = L.targets.filter(t => t.need === 'w'), c = L.targets.filter(t => t.need === 'c'), n = L.targets.filter(t => !t.need);
    n.forEach(t => (rnd() < .5 ? w : c).push(t));
    if (!w.length || !c.length) return null;
    const nw = grow(L, L.src, shuffle(w), {}, { wig }, X); if (!nw) return null;
    const nc = grow(L, L.src2, shuffle(c), nw, { wig, cross: true }, X); if (!nc) return null;
    nets = [nw, nc];
  }
  const net = Object.assign({}, ...nets);
  for (const k in X) delete net[k];
  // the arms at the taps point out of the board: that is the inlet, not a piece arm to the outside... keep it, the source cell needs that arm
  const pcs = toPieces(net, X); if (!pcs) return null;
  if (!PL.solved(L, pcs)) return null;
  // tray: the solution plus a few spare pieces; par: try to beat the constructed solution
  const tray = {}; pcs.forEach(p => tray[p.t] = (tray[p.t] || 0) + 1);
  const spare = tier === 1 ? ri(1, 2) : tier === 2 ? 2 : 3;
  for (let i = 0; i < spare; i++) { const t = pick(['S1', 'S1', 'S2', 'B', 'B', temp ? 'X' : 'T']); tray[t] = (tray[t] || 0) + 1; }
  L.tray = tray; L.par = pcs.length; L.nodeLimit = 4e5;
  const better = PL.solve(L, pcs.length); if (better.n > 0 && better.n < L.par) L.par = better.n;
  delete L.nodeLimit;
  L.hasX = Object.keys(X).length > 0; L.nT = pcs.filter(p => p.t === 'T').length; L.nPc = pcs.length;
  return L;
}
const NAMES = {
  plant: ['Blumen gießen', 'Durstige Blume', 'Die Zimmerpflanze'], shower: ['Die Dusche', 'Duschzeit', 'Frisch geduscht'], coffee: ['Kaffeepause', 'Erst mal Kaffee', 'Morgenkaffee'],
  sink: ['Zähneputzen', 'Hände waschen', 'Am Waschbecken'], tub: ['Die Badewanne', 'Badezeit', 'Schaumbad'] };
const SHORT = { plant: 'Blume', shower: 'Dusche', coffee: 'Kaffee', sink: 'Waschbecken', tub: 'Wanne' };
const BIG = ['Morgenroutine', 'Badetag', 'Hausputz', 'Wellnesstag', 'Die große Anlage', 'Volles Programm', 'Alles auf einmal', 'Rohrsalat', 'Knapp bemessen', 'Großes Planschen', 'Viel zu tun', 'Rushhour im Bad'];
const TEMP = ['Warm und kalt', 'Nicht vermischen!', 'Heiß und kalt', 'Zwei Leitungen', 'Kalt erwischt', 'Wechselbad', 'Lauwarm verboten', 'Frühstück', 'Großer Waschtag', 'Kalt und warm', 'Bloß nicht mischen', 'Kühler Kopf'];
function name(L, tier) {
  const ks = L.st.map(s => s.k);
  if (tier >= 4) return pick(TEMP);
  if (ks.length === 1) return pick(NAMES[ks[0]]);
  if (ks.length === 2 && ks[0] !== ks[1]) return SHORT[ks[0]] + ' und ' + SHORT[ks[1]];
  return pick(BIG);
}
const WANT = { 1: [3, 6], 2: [6, 9], 3: [8, 13], 4: [6, 9], 5: [8, 13] };
const COUNT = +process.argv[3] || 24, out = { 1: [], 2: [], 3: [], 4: [], 5: [] }, seen = {};
const TIERS = process.argv[4] ? process.argv[4].split(',').map(Number) : [1, 2, 3, 4, 5];
for (const tier of TIERS) {
  let tries = 0;
  while (out[tier].length < COUNT && tries < 200000) {
    tries++; const L = make(tier); if (!L) continue;
    if (L.par < WANT[tier][0] || L.par > WANT[tier][1]) continue;
    if (tier === 5 && !L.hasX && out[tier].filter(l => !l.hasX).length > COUNT / 2) continue;   // half of the hardest ones need the crossing
    if (tier === 4 && L.hasX) continue;
    const sig = JSON.stringify([L.st, L.blocks.slice().sort(), L.src, L.src2]); if (seen[sig]) continue; seen[sig] = 1;
    L.name = name(L, tier); delete L.hasX; delete L.nT; delete L.nPc;
    out[tier].push(L);
  }
  console.error('tier', tier, out[tier].length, 'tries', tries);
}
fs.writeFileSync(__dirname + '/pool_' + TIERS.join('') + '.json', JSON.stringify(out));
