# the workshop's driftwood bed, 66 wide (exec'd by bed_layers.py; makes DB, DF)
C(dr1='#d8b878', dr2='#b8945a', dr3='#ecd49c', dr4='#987442', dfe='#fff6e4', dfe2='#e8dcc8', dfe3='#c8b8a0', dst='#8a6a44', dst2='#6a4e30', dst3='#a8865a', dst4='#4e3820',
  dsh='#f4c8b0', dsh2='#d89a80', dsh3='#fbe2d4', dmo='#7aaa52', dmo2='#5a8a3a', dmo3='#9ac86a', drope='#c8a878', drope2='#a88858')
def _drift_back():
    g = G(BW, 56); rnd = random.Random(5); R = BW - 7
    for x in (2, R):
        g.rect(x, 4, x + 4, 50, 'dst'); g.rect(x, 4, x, 50, 'dst3'); g.rect(x + 4, 4, x + 4, 50, 'dst2'); rell(g, x + 2, 4, 3, 2.2, 0, 'dst3')
    for y in (10, 28):
        g.rect(4, y, R + 2, y + 2, 'dst'); g.rect(4, y, R + 2, y, 'dst3'); g.rect(4, y + 2, R + 2, y + 2, 'dst2')
        for x in (6, R - 1): g.rect(x - 1, y - 1, x + 2, y + 3, 'drope'); g.rect(x - 1, y + 1, x + 2, y + 1, 'drope2')
    for y in range(13, 28):
        for x in range(7, R):
            cell = ((x // 4) + (y // 3)) % 2; c = 'dr1'
            if y % 3 == 0: c = 'dr2'
            elif cell and x % 4 == 0: c = 'dr4'
            elif not cell and (x + 2) % 4 == 0: c = 'dr3'
            g.put(x, y, c)
    for (fx, fy, d) in ((14, 4, 1), (18, 3, -1), (50, 4, -1)):
        for t in range(8): g.put(fx + d * (t // 3), fy + t, 'dfe2'); g.put(fx + d * (t // 3) + 1, fy + t, 'dfe')
    for (sx, sy) in ((30, 5), (36, 6)):
        rell(g, sx, sy, 3, 2.4, 0, 'dsh'); g.put(sx - 1, sy, 'dsh2'); g.put(sx + 1, sy, 'dsh2'); g.put(sx, sy - 1, 'dsh3')
    g.rect(24, 9, 42, 9, 'drope')
    g.rect(6, 34, R, 50, 'dmo'); g.rect(6, 34, R, 35, 'dmo3'); g.rect(6, 49, R, 50, 'dmo2')
    for k in range(50): g.put(rnd.randint(7, R - 1), rnd.randint(36, 48), rnd.choice(['dmo2', 'dmo3', 'dmo']))
    rell(g, BW // 2, 37, 14, 5, 0, 'dfe'); g.rect(BW // 2 - 13, 40, BW // 2 + 13, 41, 'dfe2'); g.put(BW // 2 - 6, 35, 'dfe3'); g.put(BW // 2 + 4, 36, 'dfe3')
    g.outline('K'); return g
def _drift_front():
    g = G(BW, 24); rnd = random.Random(6); R = BW - 1
    for y in range(0, 14):
        for x in range(4, R - 3): g.put(x, y, 'dmo' if ((x // 11) + (y // 7)) % 2 else 'dmo3')
    for x in range(4, R - 3, 11):
        for y in range(0, 14): g.put(x, y, 'dmo2')
        for t in range(5): g.put(x + 5, 2 + t * 2, 'dmo2')
    for x in range(4, R - 3): g.put(x, 13, 'dfe'); g.put(x, 14, 'dfe2' if x % 3 else 'dfe3')
    g.rect(0, 15, R, 21, 'dst'); g.rect(0, 15, R, 15, 'dst3'); g.rect(0, 21, R, 21, 'dst2')
    for k in range(10): x = rnd.randint(2, R - 2); g.put(x, rnd.randint(16, 20), 'dst4'); g.put(x + 1, rnd.randint(16, 20), 'dst3')
    for x in (10, R - 10): g.rect(x - 1, 14, x + 2, 22, 'drope'); g.rect(x - 1, 17, x + 2, 17, 'drope2')
    g.rect(4, 22, 7, 23, 'dst2'); g.rect(R - 7, 22, R - 4, 23, 'dst2')
    g.outline('K'); return g
DB, DF = _drift_back(), _drift_front()
