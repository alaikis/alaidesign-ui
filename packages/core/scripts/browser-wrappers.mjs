import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:?)/i, '$1'));
const coreRoot = path.resolve(here, '..');
const compDir = path.resolve(coreRoot, 'dist/components');
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') { res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' }); res.end('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>'); return; }
  const fp = path.join(compDir, p.slice(1));
  fs.readFile(fp, (e, d) => { if (e) { res.writeHead(404); res.end('nf'); } else { res.writeHead(200, { 'Content-Type': 'text/javascript', 'Access-Control-Allow-Origin': '*' }); res.end(d); } });
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chromium' });
const results = [];

async function run(name, mod, fn) {
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(base + '/');
  let out;
  try {
    out = await page.evaluate(async ({ f, src }) => {
      await import(f);
      // eslint-disable-next-line no-new-func
      const fn = new Function('return (' + src + ')')();
      return await fn();
    }, { f: `${base}/${mod}.js`, src: fn.toString() });
  } catch (e) { out = { ok: false, err: e.message }; }
  results.push({ name, ...out, errs: errs.slice(0, 3) });
  await page.close();
}

// dialog
await run('dialog', 'wc/dialog', async () => {
  const el = document.createElement('alu-dialog');
  el.setAttribute('trigger', 'Open'); el.setAttribute('title', 'T'); el.setAttribute('description', 'D');
  el.innerHTML = '<p id="bd">body</p>';
  document.body.appendChild(el);
  await new Promise((r) => setTimeout(r, 120));
  const trig = el.querySelector('[data-slot="dialog-trigger"]'); trig.click();
  await new Promise((r) => setTimeout(r, 250));
  const c = document.querySelector('[data-slot="dialog-content"]');
  return { ok: !!c && el.open === true, content: c ? c.textContent.trim().slice(0, 60) : null, body: !!document.getElementById('bd') };
});

// sheet
await run('sheet', 'wc/sheet', async () => {
  const el = document.createElement('alu-sheet');
  el.setAttribute('trigger', 'Open'); el.setAttribute('title', 'ST'); el.setAttribute('side', 'right');
  el.innerHTML = '<p id="sbd">sheet body</p>';
  document.body.appendChild(el);
  await new Promise((r) => setTimeout(r, 120));
  el.querySelector('[data-slot="sheet-trigger"]').click();
  await new Promise((r) => setTimeout(r, 250));
  const c = document.querySelector('[data-slot="sheet-content"]');
  return { ok: !!c && el.open === true, content: c ? c.textContent.trim().slice(0, 60) : null };
});

// tabs
await run('tabs', 'wc/tabs', async () => {
  const el = document.createElement('alu-tabs');
  el.tabs = [
    { value: 'a', label: 'Tab A', html: '<b id="ca">Content A</b>' },
    { value: 'b', label: 'Tab B', html: 'Content B' },
  ];
  el.value = 'a';
  document.body.appendChild(el);
  await new Promise((r) => setTimeout(r, 200));
  const triggers = el.querySelectorAll('[data-slot="tabs-trigger"]');
  const activeA = !!document.getElementById('ca');
  triggers[1]?.click();
  await new Promise((r) => setTimeout(r, 200));
  return { ok: triggers.length === 2 && activeA, triggerCount: triggers.length, activeA, valueAfter: el.value };
});

// tooltip
await run('tooltip', 'wc/tooltip', async () => {
  const el = document.createElement('alu-tooltip');
  el.setAttribute('content', 'Tooltip text');
  el.innerHTML = '<button id="tt">Hover</button>';
  document.body.appendChild(el);
  await new Promise((r) => setTimeout(r, 150));
  const trig = el.querySelector('[data-slot="tooltip-trigger"]');
  const ok1 = !!trig;
  if (trig) { trig.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true })); trig.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); trig.focus?.(); }
  await new Promise((r) => setTimeout(r, 900));
  const content = document.querySelector('[data-slot="tooltip-content"]');
  return { ok: ok1, trigger: ok1, tooltipShown: !!content, tooltipText: content ? content.textContent.trim() : null };
});

// radio-group
await run('radio-group', 'wc/radio-group', async () => {
  const el = document.createElement('alu-radio-group');
  el.options = [{ value: '1', label: 'One' }, { value: '2', label: 'Two' }];
  el.value = '1';
  document.body.appendChild(el);
  await new Promise((r) => setTimeout(r, 200));
  const items = el.querySelectorAll('[role="radio"], button[data-slot], [data-slot="radio-group-item"], button');
  const labels = el.textContent;
  return { ok: labels.includes('One') && labels.includes('Two'), itemCount: items.length, text: labels.trim().slice(0, 40), value: el.value };
});

// avatar
await run('avatar', 'wc/avatar', async () => {
  const el = document.createElement('alu-avatar');
  el.setAttribute('fallback', 'AB');
  el.setAttribute('alt', 'User');
  document.body.appendChild(el);
  await new Promise((r) => setTimeout(r, 200));
  return { ok: el.textContent.includes('AB'), text: el.textContent.trim(), html: el.innerHTML.slice(0, 100) };
});

// dropdown-menu
await run('dropdown-menu', 'wc/dropdown-menu', async () => {
  const el = document.createElement('alu-dropdown-menu');
  el.items = [{ label: 'Edit', value: 'edit' }, { separator: true }, { label: 'Delete', value: 'del', destructive: true }];
  let picked = null;
  el.onselect = (v) => { picked = v; };
  document.body.appendChild(el);
  await new Promise((r) => setTimeout(r, 150));
  const trig = el.querySelector('[data-slot="dropdown-menu-trigger"]');
  trig?.click();
  await new Promise((r) => setTimeout(r, 250));
  const content = document.querySelector('[data-slot="dropdown-menu-content"]');
  const items = content ? content.querySelectorAll('[data-slot="dropdown-menu-item"]') : [];
  if (items[0]) { items[0].click(); }
  await new Promise((r) => setTimeout(r, 150));
  return { ok: !!content && items.length === 2, opened: !!content, itemCount: items.length, picked };
});

console.log('\n===== 复合组件单元素封装 实测 =====');
for (const r of results) {
  console.log(`${r.ok ? '✅' : '❌'} ${r.name.padEnd(14)} ${JSON.stringify({ ...r, name: undefined, ok: undefined, errs: undefined })}${r.errs?.length ? ' ERR[' + r.errs.join('|') + ']' : ''}`);
}
await browser.close();
server.close();
process.exit(0);
