import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:?)/i, '$1'));
const distDir = path.resolve(path.resolve(here, '..'), 'dist');
const mime = { '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/alaidesign.css"></head><body></body></html>'); return; }
  fs.readFile(path.join(distDir, p.slice(1)), (e, d) => { if (e) { res.writeHead(404); res.end('nf'); } else { res.writeHead(200, { 'Content-Type': mime[path.extname(p)] || 'application/octet-stream' }); res.end(d); } });
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage();
const errs = []; page.on('pageerror', (e) => errs.push(e.message));
await page.goto(base + '/', { waitUntil: 'load' });
await page.evaluate((b) => import(b + '/index.js'), base);
await page.waitForTimeout(300);
const r = await page.evaluate(async () => {
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));
  const cs = (el) => { const s = getComputedStyle(el); return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius, pad: s.padding }; };
  const mk = (tag, html, attrs = {}) => { const el = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v); if (html) el.innerHTML = html; document.body.appendChild(el); return el; };
  const btn = mk('alu-button', 'Go'); const badge = mk('alu-badge', 'B'); const card = mk('alu-card', 'C'); const inp = mk('alu-input', '', { placeholder: 'x' });
  await wait(150);
  const out = {
    button: btn.querySelector('button') ? cs(btn.querySelector('button')) : null,
    badge: badge.querySelector('span') ? cs(badge.querySelector('span')) : null,
    card: card.firstElementChild ? cs(card.firstElementChild) : null,
    input: inp.querySelector('input') ? cs(inp.querySelector('input')) : null,
  };
  // dark 验证
  document.documentElement.classList.add('dark');
  await wait(60);
  out.darkCard = card.firstElementChild ? cs(card.firstElementChild) : null;
  return out;
});
console.log(JSON.stringify(r, null, 2));
console.log('pageerrors:', errs.slice(0, 5));
await browser.close(); server.close(); process.exit(0);
