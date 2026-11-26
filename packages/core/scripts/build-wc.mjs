// 编译 Svelte 组件 → Web Components（light DOM + default slot），
// 并通过运行时适配器把“回调 prop”桥接为文档承诺的 DOM CustomEvent。
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { build } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));
const coreRoot = path.resolve(here, '..');
const repoRoot = path.resolve(here, '../../..');
const uiRoot = path.resolve(repoRoot, 'src/lib/components/ui');
const wcRoot = path.resolve(repoRoot, 'src/lib/components/wc');
const runtime = path.resolve(coreRoot, 'src/runtime/define-element.js');
const genDir = path.resolve(coreRoot, '.gen');
const outDir = path.resolve(coreRoot, 'dist/components');

const COMPOUND = new Set(['avatar', 'dialog', 'dropdown-menu', 'radio-group', 'sheet', 'tabs', 'tooltip']);
// 依赖父级 Svelte context、不应作为独立元素的子部件（pagination 由自包含的 alu-pagination 提供）
const EXCLUDE_ENTRY = new Set([
  'pagination/pagination-link',
  'pagination/pagination-next',
  'pagination/pagination-previous',
  'pagination/pagination-next-button',
  'pagination/pagination-prev-button',
  'pagination/pagination-item',
  'pagination/pagination-content',
  'pagination/pagination-ellipsis',
]);
const RESERVED = new Set(['class', 'className', 'children', 'ref', '$$slots', '$$events', '$$legacy', '$$host']);

// 组件 key → 事件桥（回调 prop → 文档 DOM 事件）
const E = (prop, make) => ({ prop, make });
const openClose = (prop) => E(prop, '(o) => (o ? [["open",{open:true}]] : [["close",{open:false}]])');
const EVENT_BINDINGS = {
  'checkbox/checkbox': [E('onCheckedChange', 'v => [["change",{checked:v}]]')],
  'switch/switch': [E('onCheckedChange', 'v => [["change",{checked:v}]]')],
  'pagination/pagination': [E('onPageChange', 'p => [["page-change",{page:p}]]')],
  'table/data-table': [
    E('onRowClick', '(row) => [["row-click",{row}]]'),
    E('onPageChange', '(p, size) => [["page-change",{page:p,pageSize:size}]]'),
    E('onSort', '(col,dir) => [["sort",{column:col,direction:dir}]]'),
  ],
  'date-picker/date-picker': [E('onValueChange', 'v => [["value-change",{value:v}]]')],
  'signature-pad': [E('onChange', '(d) => [["change",{dataUrl:d}]]')],
  'sonner/sonner': [E('onDismiss', '() => [["dismiss",{}]]')],
  'search-bar/search-bar': [E('onSearch', 'v => [["search",{value:v}]]')],
  'empty-state': [E('onAction', '() => [["action",{}]]'), E('onSecondaryAction', '() => [["secondary-action",{}]]')],
  'error-state': [E('onRetry', '() => [["retry",{}]]')],
  'error-boundary': [E('onError', 'e => [["error",{error:e}]]')],
  'wc/dialog': [openClose('onOpenChange')],
  'wc/sheet': [openClose('onOpenChange')],
  'wc/tooltip': [E('onOpenChange', '(o) => (o ? [["show",{}]] : [["hide",{}]])')],
  'wc/dropdown-menu': [openClose('onOpenChange'), E('onselect', 'v => [["select",{value:v}]]')],
  'wc/tabs': [E('onValueChange', 'v => [["tab-change",{value:v}]]')],
  'wc/radio-group': [E('onValueChange', 'v => [["change",{value:v}]]')],
};

function walk(d, acc = []) {
  if (!fs.existsSync(d)) return acc;
  for (const f of fs.readdirSync(d)) {
    const fp = path.join(d, f);
    if (fs.statSync(fp).isDirectory()) walk(fp, acc);
    else acc.push(fp);
  }
  return acc;
}
function relRender(base, f) { return path.relative(base, f).replace(/\\/g, '/'); }

function extractProps(code) {
  const blocks = [...code.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n') || code;
  const idx = blocks.indexOf('$props(');
  if (idx < 0) return [];
  // 目标解构：`let { ... } [: Type] = $props();`
  // 取 $props 之前最后一个 `let {`，其 `{` 即解构开始（避免误匹配后续的 `}: { 类型 }` 花括号）
  let open = -1;
  const re = /\blet\s*\{/g;
  let m;
  while ((m = re.exec(blocks))) {
    if (m.index < idx) open = m.index + m[0].lastIndexOf('{');
    else break;
  }
  if (open < 0) return [];
  let depth = 0, close = -1;
  for (let i = open; i < blocks.length; i++) {
    if (blocks[i] === '{') depth++;
    else if (blocks[i] === '}') { depth--; if (depth === 0) { close = i; break; } }
  }
  if (close < 0) return [];
  const body = blocks.slice(open + 1, close);
  const parts = []; depth = 0; let cur = '';
  for (const ch of body) { if ('{[('.includes(ch)) depth++; else if ('}])'.includes(ch)) depth--; if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += ch; }
  if (cur.trim()) parts.push(cur);
  return [...new Set(parts.map((p) => p.trim()).filter((p) => p && !p.startsWith('...')).map((p) => (p.match(/^([A-Za-z_$][\w$]*)/) || [])[1]).filter((k) => k && !RESERVED.has(k) && !k.startsWith('$$')))];
}

const baseTag = (rel) => 'alu-' + rel.split('/').pop().replace(/[^a-z0-9-]/gi, '-').toLowerCase();
const fullTag = (rel) => 'alu-' + rel.replace(/[^a-z0-9-]/gi, '-').toLowerCase();

const atomicFiles = walk(uiRoot).filter((f) => f.endsWith('.svelte')).filter((f) => {
  const rel = relRender(uiRoot, f).replace(/\.svelte$/, '');
  if (EXCLUDE_ENTRY.has(rel)) return false;
  return !COMPOUND.has(rel.split('/')[0]);
});
const atomicRels = atomicFiles.map((f) => relRender(uiRoot, f).replace(/\.svelte$/, ''));
const baseCount = {};
for (const r of atomicRels) baseCount[baseTag(r)] = (baseCount[baseTag(r)] || 0) + 1;
const tagByRel = {};
for (const r of atomicRels) tagByRel[r] = baseCount[baseTag(r)] > 1 ? fullTag(r) : baseTag(r);

const wcFiles = walk(wcRoot).filter((f) => f.endsWith('.wc.svelte'));
const wcTag = {};
for (const f of wcFiles) wcTag[f] = 'alu-' + path.basename(f).replace(/\.wc\.svelte$/, '').replace(/[^a-z0-9-]/gi, '-').toLowerCase();

// 校验 tag 唯一
const seen = new Set(); const conflicts = [];
for (const r of atomicRels) { const t = tagByRel[r]; if (seen.has(t)) conflicts.push(t); seen.add(t); }
for (const t of Object.values(wcTag)) { if (seen.has(t)) conflicts.push(t); seen.add(t); }
if (conflicts.length) { console.error('TAG CONFLICTS:', conflicts.join(', ')); process.exit(1); }

// 生成适配器入口
fs.rmSync(genDir, { recursive: true, force: true });
fs.mkdirSync(genDir, { recursive: true });
const entry = {};
const tagOfKey = {};
const meta = [];

function makeAdapter(key, svelteFile, tag) {
  const safe = key.replace(/[\/]/g, '__');
  const adapterPath = path.join(genDir, safe + '.js');
  const relComp = path.relative(genDir, svelteFile).replace(/\\/g, '/');
  const relRuntime = path.relative(genDir, runtime).replace(/\\/g, '/');
  const props = extractProps(fs.readFileSync(svelteFile, 'utf8'));
  const binds = (EVENT_BINDINGS[key] || []).map(
    (b) => `{ prop: ${JSON.stringify(b.prop)}, handle: (...a) => (${b.make})(...a) }`
  );
  const content = `import Comp from ${JSON.stringify(relComp.startsWith('.') ? relComp : './' + relComp)};
import { defineElement } from ${JSON.stringify(relRuntime.startsWith('.') ? relRuntime : './' + relRuntime)};
defineElement(${JSON.stringify(tag)}, Comp, { props: ${JSON.stringify(props)}, eventBindings: [${binds.join(', ')}] });
`;
  fs.writeFileSync(adapterPath, content, 'utf8');
  entry[key] = adapterPath;
  tagOfKey[key] = tag;
  meta.push({ key, tag, props, events: (EVENT_BINDINGS[key] || []).map((b) => b.prop) });
}

for (const f of atomicFiles) { const r = relRender(uiRoot, f).replace(/\.svelte$/, ''); makeAdapter(r, f, tagByRel[r]); }
for (const f of wcFiles) { const r = 'wc/' + path.basename(f).replace(/\.wc\.svelte$/, ''); makeAdapter(r, f, wcTag[f]); }

await build({
  root: repoRoot,
  plugins: [svelte()],
  resolve: {
    alias: { '$app/environment': path.resolve(coreRoot, 'src/app-stubs/environment.ts') },
  },
  build: {
    outDir,
    emptyOutDir: true,
    lib: { entry, formats: ['es'], fileName: (_f, name) => `${name}.js` },
    rollupOptions: { external: [] },
    cssCodeSplit: false,
    minify: false,
  },
  logLevel: 'warn',
});

// barrel + 类型
const keys = Object.keys(entry);
const orderedKeys = keys;
const barrel = ['// 自动生成：import 本包即注册全部 AlaiDesign 自定义元素。', ...orderedKeys.map((k) => `import './components/${k}.js';`), '', 'export {};', ''].join('\n');
fs.writeFileSync(path.resolve(coreRoot, 'dist/index.js'), barrel, 'utf8');
const tags = keys.map((k) => tagOfKey[k]).filter(Boolean).sort();
const dts = ['// 自动生成：AlaiDesign Web Components 类型声明。', 'export type AdaTagName =', tags.map((t) => `  | '${t}'`).join('\n') + ';', '', 'declare global {', '  interface HTMLElementTagNameMap {', tags.map((t) => `    '${t}': HTMLElement;`).join('\n'), '  }', '}', ''].join('\n');
fs.writeFileSync(path.resolve(coreRoot, 'dist/index.d.ts'), dts, 'utf8');

// 元素清单（key → tag），供逐个交互回归测试
const manifest = keys.filter((k) => tagOfKey[k]).map((k) => ({ key: k, tag: tagOfKey[k] }));
fs.writeFileSync(path.resolve(coreRoot, 'dist/manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

fs.rmSync(genDir, { recursive: true, force: true });
console.log('built', keys.length, 'entries; tags', tags.length);
