# Live build without the plain sudoku source: take the current live app and swap in the freshly built hamster (css, markup, script).
import re, json, os, sys
D = '/tmp/claude-0/-home-claude/c2f4144c-e47f-55b9-ac0f-58d21a2c6cc1/scratchpad/ham2/'
H = '/home/claude/'
BASE = sys.argv[1]                       # the current live artifact page (as saved by the artifact service)
VERSION = os.environ.get('APPVERSION'); DATE = os.environ.get('APPDATE')
code = open(D + 'build_app.py').read()
head = code[:code.index('# ---------------- sudoku side')]
g = {}; exec(head, g)
html, js, scoped, rep = g['html'], g['js'], g['scoped'], g['rep']
ip = open(D + 'ipad_inject.py').read(); exec(ip[:ip.index('src = re.sub(')], g); vwfix = g['_vwfix']

page = open(BASE).read()
src = page[page.index('<title>Sudoku & Hamster</title>'):]
src = src[:src.rindex('</body></html>')].rstrip('\n') + '\n'

# 1) hamster css: from the marker up to the account css that was added after it
a = src.index('/* ===== hamster ===== */\n') + len('/* ===== hamster ===== */\n'); b = src.index('\n.account.acc-start { margin-top: 14px;', a)
src = src[:a] + vwfix(scoped) + src[b:]
# 2) hamster markup, keeping the account box and the big-screen card that live at the end of the start screen
a = src.index('<div id="ham-root">'); b = src.index('<div class="app" id="app" hidden>')
old = src[a:b]
s0 = old.index('<section class="start" id="scr-start">'); e0 = old.index('</section>', s0); x0 = old.index('<div class="account acc-start"', s0)
extra = old[x0:e0]
s1 = html.index('<section class="start" id="scr-start">'); e1 = html.index('</section>', s1)
new_html = html[:e1].rstrip(' ') + extra + html[e1:] if False else html[:e1] + extra + html[e1:]
src = src[:a] + new_html + src[b:]
# 3) hamster script: the first script after the sudoku markup, ending right before the sudoku's own script
a = src.index('<div class="app" id="app" hidden>'); sa = src.index('<script>\n', a) + len('<script>\n'); sb = src.index('\n</script>\n<script>\n(function () {', sa)
assert src[sa:sa + 60].split('\n')[0] == js[:60].split('\n')[0], (src[sa:sa + 80], js[:80])
src = src[:sa] + js + src[sb:]
# 4) version
src = re.sub(r'<p class="opt-version">Version \d+ · [0-9.]+</p>', '<p class="opt-version">Version ' + VERSION + ' · ' + DATE + '</p>', src, 1)
open(H + 'sudoku.html', 'w').write(src)
# pwa wrapper exactly as build_app makes it
tail = code[code.index('# ---------------- pwa and offline wrappers'):]
g2 = dict(g, src=src, H=H, VERSION=VERSION, re=re)
exec(tail, g2)
