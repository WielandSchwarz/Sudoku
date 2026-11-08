var RP_SRC = [
  { name: "Blumen gießen", src: { c: 0, r: 1, d: "l" }, st: [{ k: "plant", sc: 6, side: "l" }], blocks: [], tray: { S3: 1, S2: 2, S1: 2, B: 1 } },
  { name: "Die Dusche", src: { c: 0, r: 0, d: "l" }, st: [{ k: "shower", sc: 6, side: "l" }], blocks: [[3, 0], [3, 1]], beam: [3, 0, 2], tray: { S3: 1, S2: 2, S1: 3, B: 4 } },
  { name: "Kaffee und Blume", src: { c: 4, r: 0, d: "u" }, st: [{ k: "coffee", sc: 0, side: "r" }, { k: "plant", sc: 7, side: "l" }], blocks: [[4, 2]], tray: { S3: 1, S2: 3, S1: 3, B: 3, T: 1 } },
  { name: "Die Badewanne", src: { c: 7, r: 0, d: "u" }, st: [{ k: "tub", sc: 0, side: "l" }, { k: "sink", sc: 6, side: "r" }], blocks: [[4, 0], [4, 1], [4, 2]], beam: [4, 0, 3], tray: { S3: 2, S2: 3, S1: 4, B: 6, T: 1 } },
  { name: "Badetag", src: { c: 0, r: 0, d: "l" }, st: [{ k: "shower", sc: 0, side: "l" }, { k: "tub", sc: 5, side: "l" }, { k: "plant", sc: 8, side: "l" }], blocks: [[3, 1], [4, 1]], tray: { S3: 2, S2: 3, S1: 3, B: 3, T: 2 } },
  { name: "Morgenroutine", src: { c: 0, r: 1, d: "l" }, st: [{ k: "coffee", sc: 3, side: "l" }, { k: "sink", sc: 7, side: "l" }], blocks: [[2, 0], [2, 1], [5, 1], [5, 2], [5, 3], [5, 4]], beam: [2, 0, 2], post: [5, 1, 4], tray: { S3: 1, S2: 3, S1: 4, B: 4, T: 1 } },
  { name: "Knapp bemessen", src: { c: 2, r: 0, d: "u" }, st: [{ k: "coffee", sc: 0, side: "l" }, { k: "plant", sc: 4, side: "l" }, { k: "shower", sc: 7, side: "r" }], blocks: [[3, 1], [5, 1], [6, 2], [1, 2]], tray: { S2: 4, S1: 6, B: 4, T: 2 } },
  { name: "Die große Anlage", src: { c: 5, r: 0, d: "u" }, st: [{ k: "sink", sc: 0, side: "l" }, { k: "coffee", sc: 2, side: "r" }, { k: "plant", sc: 5, side: "l" }, { k: "tub", sc: 6, side: "r" }], blocks: [[4, 0], [4, 1], [2, 1], [7, 2], [1, 1]], beam: [4, 0, 2], tray: { S3: 2, S2: 3, S1: 4, B: 5, T: 3 } }
];
var RP_SIZE = { shower: [2, 2], tub: [3, 2], coffee: [2, 2], sink: [2, 2], plant: [1, 2] };
function rpNorm(S) {
  var L = JSON.parse(JSON.stringify(S)); L.targets = []; L.space = [];
  L.st.forEach(function (t) {
    var w = RP_SIZE[t.k][0], h = RP_SIZE[t.k][1]; t.w = w; t.h = h; t.sr = 5 - h;
    for (var x = 0; x < w; x++) for (var y = 0; y < h; y++) { L.blocks.push([t.sc + x, t.sr + y]); L.space.push([t.sc + x, t.sr + y]); }
    L.targets.push({ c: t.side === "l" ? t.sc : t.sc + w - 1, r: t.sr - 1, d: "d", k: t.k });
  });
  if (L.bed) { L.blocks.push(L.bed); L.space.push(L.bed); }
  return L;
}
var RP_LEVELS = RP_SRC.map(rpNorm);
