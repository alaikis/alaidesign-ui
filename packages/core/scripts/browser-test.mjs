// 浏览器实测（原子组件）：import 即自动 define，创建元素并检查渲染。
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:?)/i, '$1'));
const coreRoot = path.resolve(here, '..');
const compDir = path.resolve(coreRoot, 'dist/components');

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/' || p === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
    res.end('<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:sans-serif;padding:20px}</style></head><body></body></html>');
    return;
  }
  const fp = path.join(compDir, p.slice(1));
  if (!fp.startsWith(compDir)) { res.writeHead(403); res.end(); return; }
  fs.readFile(fp, (e, d) => {
    if (e) { res.writeHead(404); res.end('nf'); }
    else { res.writeHead(200, { 'Content-Type': 'text/javascript', 'Access-Control-Allow-Origin': '*' }); res.end(d); }
  });
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const cases = [
  { rel: 'button/button', tag: 'alu-button', attrs: { variant: 'destructive' } },
  { rel: 'badge/badge', tag: 'alu-badge', attrs: {} },
  { rel: 'card/card', tag: 'alu-card', attrs: {} },
  { rel: 'checkbox/checkbox', tag: 'alu-checkbox', attrs: {} },
  { rel: 'separator/separator', tag: 'alu-separator', attrs: {} },
  { rel: 'skeleton', tag: 'alu-skeleton', attrs: {} },
  { rel: 'input/input', tag: 'alu-input', attrs: { placeholder: 'Type' } },
  { rel: 'textarea/textarea', tag: 'alu-textarea', attrs: { placeholder: 'Text' } },
  { rel: 'switch/switch', tag: 'alu-switch', attrs: {} },
  { rel: 'select/select', tag: 'alu-select', attrs: {} },
  { rel: 'breadcrumb/breadcrumb', tag: 'alu-breadcrumb', attrs: {} },
  { rel: 'table/data-table', tag: 'alu-data-table', attrs: {} },
  { rel: 'date-picker/date-picker', tag: 'alu-date-picker', attrs: {} },
];

const browser = await chromium.launch({ channel: 'chromium' });
const results = [];
for (const c of cases) {
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(base + '/');
  const r = await page.evaluate(async ({ f, tag, attrs }) => {
    try {
      await import(f);
      if (!customElements.get(tag)) return { ok: false, err: 'not defined' };
      const el = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v);
      document.body.appendChild(el);
      await new Promise((res) => setTimeout(res, 120));
      const fc = el.firstElementChild;
      return { ok: true, defined: true, innerLen: el.innerHTML.length, first: fc ? fc.tagName + '.' + (fc.className || '').split(' ').slice(0, 2).join('.') : null };
    } catch (e) { return { ok: false, err: e.message }; }
  }, { f: `${base}/${c.rel}.js`, tag: c.tag, attrs: c.attrs });
  results.push({ name: c.rel, ...r, errs: errs.slice(0, 2) });
  await page.close();
}

console.log('\n===== 原子组件 实测 =====');
for (const r of results) {
  console.log(`${r.ok ? '✅' : '❌'} ${r.name.padEnd(24)} innerLen=${r.innerLen ?? '-'} first=${r.first || '-'}${r.err || ''}${r.errs?.length ? ' ERR[' + r.errs.join('|') + ']' : ''}`);
}
const n = results.filter((r) => r.ok).length;
console.log(`\n${n}/${results.length} 通过`);
await browser.close();
server.close();
process.exit(0);
