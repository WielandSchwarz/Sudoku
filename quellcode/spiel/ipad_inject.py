# ---------------- optional "big screen" mode for tablets: the whole app is scaled up evenly ----------------
def _vwfix(css):
    css = re.sub(r'(\d*\.?\d+)(?:d|s)?vw\b', lambda m: 'calc(' + m.group(1) + ' * var(--bs-vw, 1vw))', css)
    return re.sub(r'(\d*\.?\d+)(?:d|s)?vh\b', lambda m: 'calc(' + m.group(1) + ' * var(--bs-vh, 1vh))', css)
src = re.sub(r'<style>(.*?)</style>', lambda m: '<style>' + _vwfix(m.group(1)) + '</style>', src, flags=re.S)
src = rep(src, 'width:min(92vw,520px)', 'width:min(calc(92 * var(--bs-vw, 1vw)),520px)')
_s = src.index('<section class="start" id="scr-start">'); _e = src.index('</section>', _s)
src = src[:_e] + '''<div class="account acc-start bs-card" id="bs-card" hidden><div class="bs-row"><div><strong class="acc-title">Großer Bildschirm</strong><p class="acc-text">Alles größer, passend fürs iPad</p></div><button type="button" class="bs-tog" id="bs-tog" role="switch" aria-checked="false" aria-label="Großer Bildschirm"><i></i></button></div></div>
''' + src[_e:]
src = rep(src, '\n</style>', """
.bs-card .bs-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.bs-card .acc-text { margin: 4px 0 0; }
.bs-tog { flex: none; position: relative; width: 52px; height: 30px; border: 0; border-radius: 15px; background: #e8d6c4; cursor: pointer; transition: background .2s; }
.bs-tog i { position: absolute; left: 3px; top: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: transform .2s; }
.bs-tog[aria-checked="true"] { background: var(--chip-on); }
.bs-tog[aria-checked="true"] i { transform: translateX(22px); }
html.bs-on, html.bs-on body { height: 100%; overflow: hidden; }
#bs-outer { position: fixed; left: 0; top: 0; overflow: hidden; transform-origin: 0 0; background: var(--paper); }
#bs-inner { height: 100%; overflow-x: hidden; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
</style>""", 1)
src = src.rstrip('\n') + '''
<script>
(function () {   /* big screen: the page runs in a phone-sized frame that is scaled up evenly (one setting per device) */
  var KEY = "hamster-bigscreen", on = false, card = document.getElementById("bs-card"), tog = document.getElementById("bs-tog");
  try { on = localStorage.getItem(KEY) === "1"; } catch (e) {}
  function big() { return Math.min(screen.width, screen.height) >= 700; }
  if (card && big()) { card.hidden = false; tog.setAttribute("aria-checked", on ? "true" : "false"); }
  if (tog) tog.addEventListener("click", function () {
    on = !on; tog.setAttribute("aria-checked", on ? "true" : "false");
    try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) {}
    setTimeout(function () { location.reload(); }, 250);
  });
  if (!on || !big()) return;
  var outer = document.createElement("div"), inner = document.createElement("div"); outer.id = "bs-outer"; inner.id = "bs-inner";
  function adopt(n) { return n !== outer && !(n.nodeType === 1 && /^(SCRIPT|STYLE|LINK|META)$/.test(n.tagName)); }
  [].slice.call(document.body.childNodes).filter(adopt).forEach(function (n) { inner.appendChild(n); });
  outer.appendChild(inner); document.body.appendChild(outer); document.documentElement.classList.add("bs-on");
  new MutationObserver(function (ms) { ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.parentNode === document.body && adopt(n)) inner.appendChild(n); }); }); }).observe(document.body, { childList: true });
  function fit() {
    var W = window.innerWidth, H = window.innerHeight, z = Math.min(W / 560, H / 760);
    z = Math.max(1, Math.floor((1 + z) / 2 * 20) / 20);   /* halfway between normal and filling the screen: more room around */
    outer.style.width = (W / z) + "px"; outer.style.height = (H / z) + "px"; outer.style.transform = "scale(" + z + ")";
    var r = document.documentElement.style; r.setProperty("--bs-vw", (W / z / 100) + "px"); r.setProperty("--bs-vh", (H / z / 100) + "px");
  }
  fit(); window.addEventListener("resize", fit); window.addEventListener("orientationchange", function () { setTimeout(fit, 300); });
  var st = window.scrollTo.bind(window);
  window.scrollTo = function (a, b) { if (a && typeof a === "object") inner.scrollTo(a); else inner.scrollTop = b || 0; };
})();
</script>
'''
