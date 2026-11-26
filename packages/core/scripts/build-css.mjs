// 生成自包含样式：用 Tailwind v4 CLI 扫描编译后的组件产物，输出 dist/alaidesign.css
// 内含：Tailwind reset + 原子类 + 设计 token(@theme→CSS 变量) + 基础样式 + 组件 scoped 样式。
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const coreRoot = path.resolve(here, '..');
const genDir = path.resolve(coreRoot, '.cssgen');
const input = path.resolve(genDir, 'input.css');
const output = path.resolve(coreRoot, 'dist/alaidesign.css');

const theme = `
@import "tailwindcss";
@import "../dist/tokens.css";
@import "../dist/styles.css";
@import "../dist/components/alaidesign.css";

@source "../dist/components/**/*.js";
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-primary: var(--primary, #0052d9);
  --color-primary-foreground: var(--primary-foreground, #ffffff);
  --color-background: var(--background, #f3f3f3);
  --color-foreground: var(--foreground, #1f2329);
  --color-card: var(--card, #ffffff);
  --color-card-foreground: var(--card-foreground, #1f2329);
  --color-popover: var(--popover, #ffffff);
  --color-popover-foreground: var(--popover-foreground, #1f2329);
  --color-muted: var(--muted, #f5f5f5);
  --color-muted-foreground: var(--muted-foreground, #5a5e66);
  --color-secondary: var(--secondary, #f7f7f7);
  --color-secondary-foreground: var(--secondary-foreground, #1f2329);
  --color-accent: var(--accent, #e8f1ff);
  --color-accent-bright: var(--accent-bright, #366ef4);
  --color-accent-foreground: var(--accent-foreground, #003a9c);
  --color-destructive: var(--destructive, #e5484d);
  --color-destructive-foreground: var(--destructive-foreground, #ffffff);
  --color-success: var(--success, #00a86b);
  --color-success-foreground: var(--success-foreground, #ffffff);
  --color-warning: var(--warning, #f5a623);
  --color-warning-foreground: var(--warning-foreground, #000000);
  --color-info: var(--info, #0052d9);
  --color-info-foreground: var(--info-foreground, #ffffff);
  --color-border: var(--border, #dcdde3);
  --color-input: var(--input, #ffffff);
  --color-ring: var(--ring, #0052d9);
  --color-background-secondary: var(--background-secondary, #f7f7f7);
  --color-background-tertiary: var(--background-tertiary, #efefef);
  --color-foreground-secondary: var(--foreground-secondary, #5a5e66);
  --color-foreground-tertiary: var(--foreground-tertiary, #949aa4);
}
`;

fs.rmSync(genDir, { recursive: true, force: true });
fs.mkdirSync(genDir, { recursive: true });
fs.writeFileSync(input, theme, 'utf8');

const cliPkg = path.resolve(coreRoot, '../../node_modules/@tailwindcss/cli/package.json');
if (!fs.existsSync(cliPkg)) {
  console.error('[build-css] @tailwindcss/cli not found at', cliPkg);
  process.exit(1);
}
const bin = JSON.parse(fs.readFileSync(cliPkg, 'utf8')).bin;
const entry = path.resolve(path.dirname(cliPkg), typeof bin === 'string' ? bin : bin.tailwindcss);
const res = spawnSync(process.execPath, [entry, '-i', input, '-o', output, '--minify'], { cwd: coreRoot, stdio: 'inherit' });
fs.rmSync(genDir, { recursive: true, force: true });
if (res.status !== 0) { console.error('[build-css] tailwind CLI failed'); process.exit(res.status || 1); }
const size = fs.statSync(output).size;
console.log('[build-css] wrote dist/alaidesign.css', Math.round(size / 1024) + 'KB');
