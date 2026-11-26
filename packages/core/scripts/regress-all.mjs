import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:?)/i, '$1'));
const coreRoot = path.resolve(here, '..');
const distDir = path.resolve(coreRoot, 'dist');
const manifest = JSON.parse(fs.readFileSync(path.join(distDir, 'manifest.json'), 'utf8'));

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html><html><head><meta charset="utf-8"><style>body{padding:16px}</style></head><body></body></html>'); return; }
  fs.readFile(path.join(distDir, p.slice(1)), (e, d) => { if (e) { res.writeHead(404); res.end('nf'); } else { res.writeHead(200, { 'Content-Type': 'text/javascript', 'Access-Control-Allow-Origin': '*' }); res.end(d); } });
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chromium' });

function setupFor(tag) {
  const s = { attrs: {}, props: {}, html: 'Hello' };
  if (tag === 'alu-input') s.attrs.placeholder = 'Type';
  else if (tag === 'alu-textarea') s.attrs.placeholder = 'Type';
  else if (tag === 'alu-select') { s.attrs.placeholder = 'Pick'; s.props.options = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]; }
  else if (tag === 'alu-data-table') { s.attrs['empty-text'] = 'None'; s.props.columns = [{ key: 'id', title: 'ID' }]; s.props.data = [{ id: '1' }, { id: '2' }]; s.props.pagination = { total: 2, pageSize: 10 }; }
  else if (tag === 'alu-pagination') { s.attrs = { count: '100', 'per-page': '10', page: '1', 'sibling-count': '1' }; s.html = ''; }
  else if (tag === 'alu-tabs') { s.props.tabs = [{ value: 'a', label: 'A', html: 'A' }, { value: 'b', label: 'B', html: 'B' }]; s.props.value = 'a'; s.html = ''; }
  else if (tag === 'alu-radio-group') { s.props.options = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]; s.props.value = 'a'; s.html = ''; }
  else if (tag === 'alu-dropdown-menu') { s.attrs.trigger = 'Menu'; s.props.items = [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]; s.html = ''; }
  else if (tag === 'alu-avatar') s.attrs.fallback = 'AB';
  else if (tag === 'alu-dialog' || tag === 'alu-sheet') { s.attrs.trigger = 'Open'; s.attrs.title = 'T'; }
  else if (tag === 'alu-tooltip') { s.attrs.content = 'Tip'; s.html = 'Hover'; }
  else if (tag === 'alu-search-bar') s.attrs.placeholder = 'Search';
  else if (tag === 'alu-form-field') s.attrs.label = 'Field';
  else if (tag === 'alu-sonner') { s.attrs.type = 'success'; s.attrs.description = 'ok'; s.html = ''; }
  else if (tag === 'alu-signature-pad') { s.attrs.width = '200'; s.attrs.height = '100'; s.html = ''; }
  else if (tag === 'alu-date-picker') s.html = '';
  else if (tag === 'alu-switch') s.html = '';
  else if (tag === 'alu-separator' || tag === 'alu-skeleton' || tag === 'alu-skeleton-card' || tag === 'alu-skeleton-table' || tag === 'alu-skeleton-page') s.html = '';
  else if (tag === 'alu-page-header') s.attrs.title = 'Page';
  else if (tag === 'alu-empty-state') s.attrs.title = 'Empty';
  else if (tag === 'alu-error-state') { s.attrs.title = 'Err'; s.attrs.message = 'm'; }
  else if (tag === 'alu-checkbox') s.html = 'Check';
  return s;
}

const results = [];
for (const { key, tag } of manifest) {
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(base + '/');
  const setup = setupFor(tag);
  let r;
  try {
    r = await page.evaluate(async ({ modPath, tag, attrs, props, html }) => {
      const wait = (ms) => new Promise((res) => setTimeout(res, ms));
      await import(modPath);
      if (!customElements.get(tag)) return { defined: false };
      const el = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, String(v));
      if (html) el.innerHTML = html;
      if (props) { for (const [k, v] of Object.entries(props)) el[k] = v; }
      document.body.appendChild(el);
      await wait(160);
      const q = (s) => el.querySelector(s);
      const out = { defined: true, children: el.children.length, textLen: (el.textContent || '').trim().length, extra: {} };
      if (tag === 'alu-input' || tag === 'alu-textarea') out.extra.inner = !!q('input,textarea');
      if (tag === 'alu-select') { const sel = q('select'); out.extra.options = sel ? sel.options.length : 0; }
      if (tag === 'alu-checkbox' || tag === 'alu-switch') { let fired = false; el.addEventListener('change', () => (fired = true)); const b = q('button'); const before = el.getAttribute('aria-checked') || el.getAttribute('data-state'); b && b.click(); await wait(120); out.extra.changeFired = fired; out.extra.state = (el.getAttribute('aria-checked') || el.getAttribute('data-state')) + ' / before ' + before; }
      if (tag === 'alu-button') out.extra.hasButton = !!q('button');
      if (tag === 'alu-tabs') { const trs = el.querySelectorAll('[data-slot="tabs-trigger"]'); out.extra.triggers = trs.length; let fired = false; el.addEventListener('tab-change', () => (fired = true)); trs[1] && trs[1].click(); await wait(120); out.extra.tabChange = fired; }
      if (tag === 'alu-dialog' || tag === 'alu-sheet') { let opened = false; el.addEventListener('open', () => (opened = true)); const t = q('[data-slot="dialog-trigger"],[data-slot="sheet-trigger"]'); t && t.click(); await wait(220); out.extra.opened = opened; out.extra.content = !!document.querySelector('[data-slot="dialog-content"],[data-slot="sheet-content"]'); el.open = false; }
      if (tag === 'alu-data-table') out.extra.rows = el.querySelectorAll('tbody tr').length;
      if (tag === 'alu-pagination') out.extra.buttons = el.querySelectorAll('button,a').length;
      return out;
    }, { modPath: `${base}/components/${key}.js`, tag, attrs: setup.attrs, props: setup.props, html: setup.html });
  } catch (e) {
    r = { defined: false, err: e.message };
  }
  results.push({ key, tag, ...r, pageErrors: errs.slice(0, 2) });
  await page.close();
}

// 判定
function judge(r) {
  const fails = [];
  if (!r.defined) fails.push('未定义');
  if (r.pageErrors && r.pageErrors.length) fails.push('报错:' + r.pageErrors.join('|'));
  if (r.err) fails.push(r.err);
  if (r.defined && (r.children || 0) === 0 && (r.textLen || 0) === 0) fails.push('空渲染');
  const e = r.extra || {};
  if (r.tag === 'alu-input' || r.tag === 'alu-textarea') if (!e.inner) fails.push('无内层输入');
  if (r.tag === 'alu-select') if (!e.options) fails.push('options=0');
  if (r.tag === 'alu-checkbox' || r.tag === 'alu-switch') if (!e.changeFired) fails.push('change未触发');
  if (r.tag === 'alu-button') if (!e.hasButton) fails.push('无button');
  if (r.tag === 'alu-tabs') { if (!e.triggers) fails.push('triggers=0'); if (!e.tabChange) fails.push('tab-change未触发'); }
  if (r.tag === 'alu-dialog' || r.tag === 'alu-sheet') { if (!e.opened) fails.push('open未触发'); if (!e.content) fails.push('内容未出现'); }
  if (r.tag === 'alu-data-table') if ((e.rows || 0) < 2) fails.push('数据行不足:' + (e.rows || 0));
  if (r.tag === 'alu-pagination') if (!e.buttons) fails.push('无分页按钮');
  return fails;
}

let pass = 0; const bad = [];
for (const r of results) {
  const fails = judge(r);
  if (fails.length) { bad.push({ tag: r.tag, fails }); console.log(`❌ ${r.tag.padEnd(26)} ${fails.join('; ')}`); }
  else { pass++; console.log(`✅ ${r.tag.padEnd(26)} children=${r.children} text=${r.textLen} ${JSON.stringify(r.extra)}`); }
}
console.log(`\n通过 ${pass} / 失败 ${bad.length} / 共 ${results.length}`);
if (bad.length) console.log('失败清单:', JSON.stringify(bad, null, 2));
await browser.close(); server.close(); process.exit(0);
