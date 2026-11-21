import json, re, sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/c2f4144c-e47f-55b9-ac0f-58d21a2c6cc1/scratchpad/ham2')
from lib import G
IB = json.load(open('/tmp/claude-0/-home-claude/c2f4144c-e47f-55b9-ac0f-58d21a2c6cc1/scratchpad/mock2/itembig.json'))
def load(k):
    g = G(32, 32)
    for col, d in re.findall(r'<path fill="(#[0-9a-fA-F]{6})" d="([^"]*)"', IB[k]['svg']):
        for x, y, w, h in re.findall(r'M(-?\d+) (-?\d+)h(\d+)v(\d+)', d):
            for yy in range(int(y), int(y) + int(h)):
                for xx in range(int(x), int(x) + int(w)): g.put(xx, yy, col.lower())
    return g
def show(g):
    cs = sorted({c for r in g.p for c in r if c}); m = {c: chr(65 + i) for i, c in enumerate(cs)}
    print(' '.join(f'{m[c]}={c}' for c in cs))
    for r in g.p: print(''.join(m[c] if c else '.' for c in r))
