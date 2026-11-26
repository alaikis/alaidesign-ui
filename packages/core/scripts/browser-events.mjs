import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:?)/i, '$1'));
const coreRoot = path.resolve(here, '..');
const distDir = path.resolve(coreRoot, 'dist');
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') { res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' }); res.end('<!doctype html><html><head><meta charset="utf-8"><style>body{padding:20px}</style></head><body></body></html>'); return; }
  const fp = path.join(distDir, p.slice(1));
  fs.readFile(fp, (e, d) => { if (e) { res.writeHead(404); res.end('nf'); } else { res.writeHead(200, { 'Content-Type': 'text/javascript', 'Access-Control-Allow-Origin': '*' }); res.end(d); } });
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
await page.goto(base + '/');
await page.evaluate((b) => import(b + '/index.js'), base);
await page.evaluate(() => new Promise((r) => setTimeout(r, 200)));

const result = await page.evaluate(async () => {
  const out = {};
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const capture = (el, ev) => { const box = { fired: false, detail: null, type: null }; el.addEventListener(ev, (e) => { box.fired = true; box.detail = e.detail ?? null; box.type = e.type; }); return box; };

  // button 渲染
  const btn = document.createElement('alu-button'); btn.innerHTML = 'Go'; document.body.appendChild(btn); await wait(80);
  out.buttonRendered = !!btn.querySelector('button');

  // checkbox change
  const cb = document.createElement('alu-checkbox'); document.body.appendChild(cb); await wait(80);
  const cbBox = capture(cb, 'change');
  const inner = cb.querySelector('button'); inner && inner.click(); await wait(150);
  out.checkbox = cbBox;

  // dialog open/close
  const dlg = document.createElement('alu-dialog'); dlg.setAttribute('trigger', 'Open'); dlg.setAttribute('title', 'T'); document.body.appendChild(dlg); await wait(100);
  const openBox = capture(dlg, 'open');
  const closeBox = capture(dlg, 'close');
  dlg.querySelector('[data-slot="dialog-trigger"]')?.click(); await wait(250);
  const content = document.querySelector('[data-slot="dialog-content"]');
  // 关闭：按 Escape
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await wait(250);
  out.dialog = { openedOnce: openBox.fired, closedOnce: closeBox.fired, hadContent: !!content };

  // tabs tab-change
  const tabs = document.createElement('alu-tabs');
  tabs.tabs = [{ value: 'a', label: 'A', html: 'CA' }, { value: 'b', label: 'B', html: 'CB' }];
  tabs.value = 'a';
  document.body.appendChild(tabs); await wait(150);
  const tabBox = capture(tabs, 'tab-change');
  tabs.querySelectorAll('[data-slot="tabs-trigger"]')[1]?.click(); await wait(150);
  out.tabs = tabBox;

  // input 原生 input 事件冒泡
  const inp = document.createElement('alu-input'); document.body.appendChild(inp); await wait(80);
  const inpBox = capture(inp, 'input');
  const innerInput = inp.querySelector('input');
  if (innerInput) { innerInput.value = 'x'; innerInput.dispatchEvent(new Event('input', { bubbles: true })); }
  await wait(80);
  out.input = { fired: inpBox.fired, type: inpBox.type };

  // select 原生 change 冒泡
  const sel = document.createElement('alu-select'); sel.innerHTML = '<option value="1">1</option><option value="2">2</option>'; document.body.appendChild(sel); await wait(80);
  const selBox = capture(sel, 'change');
  const innerSel = sel.querySelector('select');
  if (innerSel) { innerSel.value = '2'; innerSel.dispatchEvent(new Event('change', { bubbles: true })); }
  await wait(80);
  out.select = { fired: selBox.fired, type: selBox.type };

  return out;
});

console.log(JSON.stringify(result, null, 2));
console.log('pageerrors:', errs.slice(0, 5));
await browser.close();
server.close();
process.exit(0);
