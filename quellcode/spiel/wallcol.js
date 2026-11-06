// Own colours for every wallpaper (same algorithm as tapete_farben.py).
// recolorWallSvg(svg, grund, muster): grund / muster are "#rrggbb" or null (= original colours).
// ground  = the colour covering most of the tile -> replaced by `grund`
// pattern = all other colours -> mean pattern colour moves towards `muster`, original contrast (x1.4) kept,
//           light dots / dark lines keep their offset
var WALL_GRUND = [null, "#f7ead2", "#fbf8f2", "#dfe6cf", "#f2d9d4", "#d9e6ee", "#f7eabf", "#e5def0", "#5b7860", "#46557a"];
var WALL_MUSTER = [null, "#b08a68", "#e2a0a8", "#d07068", "#9ab884", "#8aa8c8", "#e0b860", "#b0a0cc", "#ffffff", "#6a5a50"];

function recolorWallSvg(svg, grund, muster) {
  function rgb(h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16) / 255; }); }
  function hex(c) { return "#" + c.map(function (v) { var n = Math.max(0, Math.min(255, Math.floor(v * 255 + 0.5))); return (n < 16 ? "0" : "") + n.toString(16); }).join(""); }
  var cnt = {}, re = /<path fill="(#[0-9a-fA-F]{6})" d="([^"]+)"/g, m;
  while ((m = re.exec(svg))) {
    var c = m[1].toLowerCase(), n = 0, r2 = /h(\d+)v1/g, k;
    while ((k = r2.exec(m[2]))) n += +k[1];
    cnt[c] = (cnt[c] || 0) + n;
  }
  var cols = Object.keys(cnt); if (!cols.length) return svg;
  var ground = cols.reduce(function (a, b) { return cnt[b] > cnt[a] ? b : a; });
  var pats = cols.filter(function (c) { return c !== ground; }), map = {};
  var g0 = rgb(ground), gn = grund ? rgb(grund) : g0;
  if (grund) map[ground] = grund;
  if (muster && pats.length) {
    var w = 0, m0 = [0, 0, 0];
    pats.forEach(function (c) { w += cnt[c]; });
    for (var k = 0; k < 3; k++) { var acc = 0; pats.forEach(function (c) { acc += rgb(c)[k] * cnt[c]; }); m0[k] = acc / w; }
    var D = [m0[0] - g0[0], m0[1] - g0[1], m0[2] - g0[2]], dl2 = D[0] * D[0] + D[1] * D[1] + D[2] * D[2];
    var pn = rgb(muster), dr = [pn[0] - gn[0], pn[1] - gn[1], pn[2] - gn[2]];
    var pl = Math.pow(dr[0] * dr[0] + dr[1] * dr[1] + dr[2] * dr[2], 0.5);
    var sc = pl > 0 ? Math.min(1, Math.pow(dl2, 0.5) * 1.4 / pl) : 0;
    var mn = [gn[0] + dr[0] * sc, gn[1] + dr[1] * sc, gn[2] + dr[2] * sc];
    pats.forEach(function (c) {
      var cv = rgb(c);
      var a = dl2 > 0 ? ((cv[0] - g0[0]) * D[0] + (cv[1] - g0[1]) * D[1] + (cv[2] - g0[2]) * D[2]) / dl2 : 1;
      map[c] = hex([0, 1, 2].map(function (k) { return gn[k] + a * (mn[k] - gn[k]) + (cv[k] - (g0[k] + a * D[k])); }));
    });
  }
  return svg.replace(/fill="(#[0-9a-fA-F]{6})"/g, function (all, c) { return 'fill="' + (map[c.toLowerCase()] || c) + '"'; });
}
