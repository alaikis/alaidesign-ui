import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:?)/i, '$1'));
const distDir = path.resolve(path.resolve(here, '..'), 'dist');
const mime = { '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => { const p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/alaidesign.css"></head><body></body></html>'); return; } fs.readFile(path.join(distDir, p.slice(1)), (e, d) => { if (e) { res.writeHead(404); res.end('nf'); } else { res.writeHead(200, { 'Content-Type': mime[path.extname(p)] || 'application/octet-stream' }); res.end(d); } }); });
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage();
const errs = []; page.on('pageerror', (e) => errs.push(e.message));
// 阻断所有外网，模拟离线（图标必须来自内联集合）
await page.route('**/*', (route) => { const u = route.request().url(); if (u.startsWith(base) || u.startsWith('data:')) return route.continue(); return route.abort(); });
await page.goto(base + '/', { waitUntil: 'load' });
await page.evaluate((b) => import(b + '/index.js'), base);
await page.waitForTimeout(400);
const r = await page.evaluate(async () => {
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));
  const mk = (tag, attrs = {}, props = {}) => { const el = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v); for (const [k, v] of Object.entries(props)) el[k] = v; document.body.appendChild(el); return el; };
  const es = mk('alu-empty-state', { title: 'Empty' });
  const ph = mk('alu-page-header', { title: 'Page', icon: 'lucide:package' });
  const sb = mk('alu-search-bar', { placeholder: 'Search' });
  const dt = mk('alu-data-table', {}, { columns: [{ key: 'id', title: 'ID', sortable: true }], data: [{ id: '1' }] });
  const son = mk('alu-sonner', { type: 'success', description: 'ok' });
  await wait(400);
  return {
    emptyState: es.querySelectorAll('svg').length,
    pageHeader: ph.querySelectorAll('svg').length,
    searchBar: sb.querySelectorAll('svg').length,
    dataTable: dt.querySelectorAll('svg').length,
    sonner: son.querySelectorAll('svg').length,
  };
});
console.log(JSON.stringify(r, null, 2));
console.log('pageerrors:', errs.slice(0, 5));
await browser.close(); server.close(); process.exit(0);
