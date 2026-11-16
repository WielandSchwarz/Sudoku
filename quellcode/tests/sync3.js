const { chromium } = require('playwright');
const DB = { state: null, su: 0, seen: [] }; let saves = 0;
async function setup(ctx) {
  await ctx.route('https://sudoku-sync.wieland-schwarz.workers.dev/**', async (route) => {
    const req = route.request(), url = req.url(), b = JSON.parse(req.postData() || '{}');
    if (url.endsWith('/api/login')) {
      if (b.create) { DB.state = b.state; DB.su = b.stateUpdated || Date.now(); DB.seen = b.seen || []; return route.fulfill({ json: { ok: true, created: true, state: DB.state, stateUpdated: DB.su, seen: DB.seen } }); }
      return route.fulfill({ json: { ok: true, created: false, state: DB.state, stateUpdated: DB.su, seen: DB.seen } });
    }
    saves++;
    if ((b.stateUpdated || 0) > DB.su) { DB.state = b.state; DB.su = b.stateUpdated; }
    DB.seen = [...new Set(DB.seen.concat(b.seen || []))];
    return route.fulfill({ json: { ok: true, state: DB.state, stateUpdated: DB.su, seen: DB.seen } });
  });
}
const needs = (p) => p.evaluate(() => [...document.querySelectorAll('#needs .bar')].map(b => +b.getAttribute('aria-valuenow')).join(','));
(async () => {
  const b = await chromium.launch(); const errs = [];
  const A = await b.newContext({ viewport: { width: 390, height: 844 } }); await setup(A); const pa = await A.newPage(); pa.on('pageerror', e => errs.push('A ' + e));
  await pa.goto('http://localhost:8765/'); await pa.waitForTimeout(1500);
  await pa.click('#go-hamster'); await pa.waitForTimeout(500); await pa.fill('#name-input', 'Gaston'); await pa.click('#name-go'); await pa.waitForTimeout(4000);
  await pa.evaluate(() => document.getElementById('ham-close').click()); await pa.waitForTimeout(800);
  await pa.fill('#acc-name', 'Testkonto'); await pa.fill('#acc-pin', '1234'); await pa.click('#acc-create'); await pa.waitForTimeout(1500);
  console.log('A created; server has hamster:', !!(DB.state && DB.state.hamster && DB.state.hamster.name));
  const B = await b.newContext({ viewport: { width: 390, height: 844 } }); await setup(B); const pb = await B.newPage(); pb.on('pageerror', e => errs.push('B ' + e));
  await pb.goto('http://localhost:8765/'); await pb.waitForTimeout(1500);
  await pb.fill('#acc-name', 'Testkonto'); await pb.fill('#acc-pin', '1234'); await pb.click('#acc-login'); await pb.waitForTimeout(2000);
  console.log('B name', await pb.evaluate(() => document.getElementById('start-ham-name').textContent));
  await pa.click('#go-hamster'); await pa.waitForTimeout(1500);
  await pb.click('#go-hamster'); await pb.waitForTimeout(3000);
  console.log('before  A', await needs(pa), ' B', await needs(pb));
  const vis = (p, v) => p.evaluate((v) => { window.__vs = v; if (!window.__vsDef) { window.__vsDef = 1; Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => window.__vs }); } document.dispatchEvent(new Event('visibilitychange')); }, v);
  await vis(pa, 'hidden'); await pa.waitForTimeout(500);
  for (let i = 0; i < 4; i++) { await pb.evaluate(() => document.getElementById('a-fun') ? document.getElementById('a-fun').click() : document.getElementById('a-pet').click()); await pb.waitForTimeout(2500); }
  await pb.evaluate(() => document.getElementById('a-pet').click()); await pb.waitForTimeout(2500);
  await pb.waitForTimeout(16000);
  console.log('B acted while A was away:', await needs(pb), 'server su', DB.su);
  await vis(pa, 'visible'); await pa.evaluate(() => document.getElementById('a-pet').click());   // A acts right away on its old state
  await pa.waitForTimeout(12000);
  await pb.waitForTimeout(45000);
  console.log('after  A', await needs(pa), ' B', await needs(pb));
  console.log(errs.slice(0, 3)); await b.close();
})();
