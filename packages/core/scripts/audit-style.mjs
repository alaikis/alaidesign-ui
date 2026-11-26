import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
const site = 'E:/workspace/adesgin-ui-site/dist';
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = http.createServer((req, res) => { let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p === '/' || !path.extname(p)) p = '/index.html'; fs.readFile(path.join(site, p), (e, d) => { if (e) { res.writeHead(404); res.end('nf'); } else { res.writeHead(200, { 'Content-Type': mime[path.extname(p)] || 'text/plain' }); res.end(d); } }); });
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
const errs = []; page.on('pageerror', (e) => errs.push(e.message));
await page.route('**/*', (route) => { const u = route.request().url(); if (u.startsWith(base) || u.startsWith('data:')) return route.continue(); return route.abort(); });
await page.goto(base + '/components', { waitUntil: 'commit' });
await page.waitForTimeout(2500);

const rep = await page.evaluate(() => {
  const colorBg = /\bbg-(primary|card|muted|secondary|destructive|success|warning|info|accent|popover|background|border|input)\b/;
  const rounded = /\brounded(-[a-z0-9]+)?\b/;
  const borderCol = /\bborder-(border|input|primary|destructive)\b/;
  const out = [];
  for (const sec of document.querySelectorAll('[data-component]')) {
    const key = sec.getAttribute('data-component');
    const box = sec.querySelector(`[data-demo="${key}"]`);
    if (!box) continue;
    let colorMiss = 0, radiusMiss = 0, borderMiss = 0, iconMissing = 0, elems = 0;
    const samples = [];
    for (const el of box.querySelectorAll('*')) {
      if (!(el instanceof HTMLElement)) continue;
      elems++;
      const _cls = (el.className && typeof el.className === 'string') ? el.className : ''; const tokens = _cls.split(/\\s+/).filter(t=>t && !t.includes(':')); const cls = tokens.join(' ');
      const s = getComputedStyle(el);
      if (colorBg.test(cls) && (s.backgroundColor === 'rgba(0, 0, 0, 0)' || s.backgroundColor === 'transparent')) { colorMiss++; if (samples.length < 3) samples.push('bg:.' + cls.match(colorBg)[0]); }
      if (rounded.test(cls) && s.borderRadius === '0px' && !/rounded-none/.test(cls)) { radiusMiss++; if (samples.length < 3) samples.push('radius:.' + cls.match(rounded)[0]); }
      if (tokens.includes('border') && parseFloat(s.borderTopWidth) === 0) { borderMiss++; if (samples.length < 3) samples.push('border:.' + cls.match(borderCol)[0]); }
      // 图标占位：空 span 且尺寸很小
      if (el.tagName === 'SPAN' && el.childElementCount === 0 && (el.textContent || '').trim() === '') {
        const r = el.getBoundingClientRect();
        if (r.width <= 24 && r.height <= 24) iconMissing++;
      }
    }
    out.push({ key, elems, colorMiss, radiusMiss, borderMiss, iconMissing, samples });
  }
  return out;
});

console.log('demo\t elems colorMiss radiusMiss borderMiss iconMissing');
for (const r of rep) {
  const flag = (r.colorMiss || r.radiusMiss || r.borderMiss || r.iconMissing) ? '  <--' : '';
  console.log(`${r.key.padEnd(16)} ${String(r.elems).padStart(4)}  ${String(r.colorMiss).padStart(6)}  ${String(r.radiusMiss).padStart(6)}  ${String(r.borderMiss).padStart(6)}  ${String(r.iconMissing).padStart(6)}${flag}`);
  if (r.samples.length) console.log('     samples:', r.samples.join(' | '));
}
console.log('\nerrors:', errs.slice(0, 5));
await browser.close(); server.close(); process.exit(0);
