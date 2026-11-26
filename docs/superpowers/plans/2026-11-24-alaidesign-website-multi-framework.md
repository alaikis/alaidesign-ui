---
change: alaidesign-website-multi-framework
design-doc: docs/superpowers/specs/2026-11-24-alaidesign-website-multi-framework-design.md
base-ref: a9467f1a6e8dbcc8b0c5268d07c9502ca30223c0
archived-with: 2026-11-25-alaidesign-website-multi-framework
---

# AlaiDesign 官网 + Vue/React 支持 实现计划

**Goal**：将 AlaiDesign 114 个 Svelte 组件降级为 Web Components 核心包（`@alaikis/alaidesign-web`），新增 Vue/React 薄 wrapper 包，并构建 GitHub Pages 静态官网（三框架代码 tab + token 文档）。

**Architecture**：npm workspaces 多包（`packages/core` Web Components 核心、`packages/vue`、`packages/react` 薄 wrapper、`site/` Vite 静态站）。核心包组件为手写 `HTMLElement` 子类（lit-html 模板 + 共享 tailwind 原子类 CSS + tokens.css），Svelte 组件源码不动。官网 dogfooding 核心包。

**Tech Stack**：lit-html、vitest + jsdom、Vite、Vue 3.3+ 原生 Custom Elements、React 18+（forwardRef + useRef 事件桥）

**提交策略（Impetus 覆盖 writing-plans 默认）**：全计划不按 task 提交。所有 task 完成、实现 Review 窗口通过后，按 `impetus/reference/commit-convention.md` 执行一次最终 build 提交。计划中不含 per-task commit 步骤。

**任务映射**：对应 OpenSpec tasks.md 的 6 组（1.1-1.3 / 2.1-2.4 / 3.1-3.3 / 4.1-4.6 / 5.1-5.2 / 6.1-6.3）。

archived-with: 2026-11-25-alaidesign-website-multi-framework
---

## Chunk 1: workspaces + 包骨架（tasks 1.1-1.3）

### Task 1.1: npm workspaces 根配置

**Files**:
- Modify: `package.json`（根，加 `workspaces` 字段 + `publish` 相关脚本）

- [ ] **Step 1**: 根 `package.json` 增加：

```json
"workspaces": ["packages/*", "site"]
```

同时保留现有 `build`/`check`/`test` 脚本（根脚本改为先 build 自身再 build workspaces，顺序由 package.json `scripts` 定义）。

- [ ] **Step 2**: 运行 `npm install`（生成/更新 workspaces 链接），确认 `node_modules/@alaikis/alaidesign-web` 等 symlink 存在。

- [ ] **Step 3**: 运行 `npm run check && npm run build`（根，Svelte 包），确认不受影响。

### Task 1.2: core 包骨架

**Files**:
- Create: `packages/core/package.json`
- Create: `packages/core/src/index.ts`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/vitest.config.ts`

- [ ] **Step 1**: `packages/core/package.json`：

```json
{
  "name": "@alaikis/alaidesign-web",
  "version": "0.2.0",
  "description": "AlaiDesign Web Components core (framework-agnostic)",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
    "./tokens.css": "./dist/tokens.css",
    "./styles.css": "./dist/styles.css"
  },
  "files": ["dist", "src"],
  "scripts": {
    "build": "tsc -p tsconfig.json && node -e \"const fs=require('fs');fs.copyFileSync('../../src/tokens.css','dist/tokens.css');fs.copyFileSync('../../src/styles.css','dist/styles.css');\""
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide": "^0.460.0",
    "tailwind-merge": "^3.0.0",
    "tailwind-variants": "^3.2.2"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "vitest": "^4.0.0",
    "jsdom": "^25.0.0"
  }
}
```

- [ ] **Step 2**: `packages/core/src/index.ts` 初始为空导出（`export {}`），tsconfig 指向 `src`，outDir `dist`。

- [ ] **Step 3**: 运行 `npm run build --workspace=@alaikis/alaidesign-web` 确认 dist 产物。

### Task 1.3: vue / react 包骨架

**Files**:
- Create: `packages/vue/package.json`、`packages/vue/src/index.ts`、`packages/vue/tsconfig.json`
- Create: `packages/react/package.json`、`packages/react/src/index.ts`、`packages/react/tsconfig.json`

- [ ] **Step 1**: `packages/vue/package.json`：

```json
{
  "name": "@alaikis/alaidesign-vue",
  "version": "0.2.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "src"],
  "scripts": { "build": "tsc -p tsconfig.json" },
  "peerDependencies": { "vue": "^3.3.0" },
  "devDependencies": { "typescript": "^5.9.3", "vue": "^3.5.0" }
}
```

- [ ] **Step 2**: `packages/react/package.json`：

```json
{
  "name": "@alaikis/alaidesign-react",
  "version": "0.2.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "src"],
  "scripts": { "build": "tsc -p tsconfig.json" },
  "peerDependencies": { "react": "^18.0.0" },
  "devDependencies": { "typescript": "^5.9.3", "react": "^18.3.0", "@types/react": "^18.3.0" }
}
```

- [ ] **Step 3**: 两包 `src/index.ts` 初始空导出；各自 `tsconfig.json` 编译到 `dist`。

- [ ] **Step 4**: 运行 `npm run build`（根，全 workspaces）确认三新包均产物。

archived-with: 2026-11-25-alaidesign-website-multi-framework
---

## Chunk 2: Web Components 核心转换（tasks 2.1-2.4）

核心包组件模式（所有组件复用）：

- 每个组件一个文件 `packages/core/src/components/<name>/<name>.ts`
- `class Alu<Name> extends HTMLElement`，`static observedAttributes = [...]`
- `attributeChangedCallback` 重渲染；`render()` 用 lit-html `html` 模板（或 `renderTemplate(el)` 辅助）
- Svelte `children` → `<slot>`
- Svelte 事件 props → 自定义元素 CustomEvent（`el.dispatchEvent(new CustomEvent('open', { bubbles: true }))`）
- tailwind-variants 类名函数原样保留（从 `src/lib/internal/` 复制 `cn` + variants 定义到 `packages/core/src/internal/`）
- 图标用 `lucide` 包（SVG 工厂函数），替代 `@lucide/svelte`
- 样式：组件模板使用 Svelte 源里相同的原子类名（与 Svelte 包一致），消费端 `@import '@alaikis/alaidesign-web/styles.css'`

### Task 2.1: Pilot 10 组件转换 + 兼容验证

**Files**（每个组件 2 文件：实现 + 测试）:
- Create: `packages/core/src/internal/cn.ts`（从 `src/lib/internal/util/cn.ts` 复制）
- Create: `packages/core/src/internal/variants/button.ts`（`buttonVariants` tv 定义，从 Svelte 源提取）
- Create: `packages/core/src/components/button/button.ts`（+ 同目录测试 `button.test.ts`）
- 同样模式：`card`、`badge`、`input`、`checkbox`、`tabs`、`skeleton`、`tooltip`、`dialog`、`data-table`
- Modify: `packages/core/src/index.ts`（导出 10 组件 + `registerAll()`）

pilot 组件清单（10）：Button、Card、Badge、Input、Checkbox、Tabs、Skeleton、Tooltip、Dialog、DataTable。

- [ ] **Step 1**: 复制 `cn.ts` 工具；为每个 pilot 组件提取 variants/工具函数到 `packages/core/src/internal/`。
- [ ] **Step 2**: 逐个实现组件 class（以 Button 为例，关键结构）：

```ts
import { html } from 'lit-html';
import { cn } from '../../internal/cn';
import { buttonVariants } from '../../internal/variants/button';

export class AluButton extends HTMLElement {
  static observedAttributes = ['variant', 'size', 'href', 'disabled'];
  private _ref = { button: null as HTMLElement | null };

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  get variant() { return this.getAttribute('variant') ?? 'default'; }
  get size() { return this.getAttribute('size') ?? 'default'; }
  get href() { return this.getAttribute('href'); }

  private _render() {
    const cls = cn(buttonVariants({ variant: this.variant, size: this.size }), this.getAttribute('class') ?? '');
    const tag = this.href ? 'a' : 'button';
    html`<${tag} data-slot="button" class="${cls}" ${this.href ? 'href=' + this.href : ''} part="button">
      <slot></slot>
    </${tag}>`.value  // lit-html 渲染到 this 内部（shadow 或 light DOM 由方案定）
    // 实际实现：this.innerHTML = 模板字符串（lit-html 的 render 到内部容器）
  }
}
customElements.define('alu-button', AluButton);
```

> 注：具体 shadow DOM vs light DOM 在 pilot 中确定——默认 shadow DOM（`attachShadow` + token 透传 `:host` 属性）；bits-ui 行为组件若需外部 focus 管理则用 light DOM。本计划统一 **shadow DOM + `:host` token 属性透传**。

- [ ] **Step 3**: 每组件 1 个 vitest 用例（jsdom）：`customElements` 已注册 → 创建元素设属性 → 断言渲染 DOM + 触发 1 事件断言 CustomEvent。运行 `npm test --workspace=@alaikis/alaidesign-web`。
- [ ] **Step 4**: 记录兼容清单到 `openspec/changes/alaidesign-website-multi-framework/.impetus/compat-notes.md`：哪些组件直接可转、哪些需手写补行为（bits-ui 焦点/键盘/ARIA）。

### Task 2.2: 不兼容组件手写 Web Component 适配

**Files**: 按 2.1 兼容清单逐项实现缺失行为。

- [ ] **Step 1**: 对 pilot 中暴露的不兼容项（如 Dialog 焦点圈定、Tooltip aria、Tabs 键盘导航）手写行为补齐。
- [ ] **Step 2**: 每个补齐项补测试断言（键盘/ARIA）。运行测试。

### Task 2.3: 全量 114 组件 + 复合组件契约

**Files**:
- Create: `packages/core/src/components/**`（剩余组件，按 Svelte `src/index.ts` 清单逐个）
- Create: `packages/core/src/components/index.ts`（`registerAll()` 注册全部 114）
- Create: `packages/core/src/contracts/composite-components.md`（16 组复合组件子元素注册表 + 事件契约）

- [ ] **Step 1**: 按 Svelte `src/index.ts` 的 114 导出清单批量实现组件 class（机械转换，模式同 2.1）。
- [ ] **Step 2**: 复合组件（Dialog/Sheet/Select/Tooltip/Tabs/DropdownMenu/Checkbox/RadioGroup/Pagination 的子元素）各自 class + slot 组合契约文档。
- [ ] **Step 3**: 全量 vitest 用例（每组件 1 例）。运行测试通过。

### Task 2.4: token 注入与样式产物

**Files**:
- Modify: `packages/core/package.json` build 脚本（生成 `dist/styles.css` 原子类产物）
- Create: `packages/core/scripts/build-tailwind-css.mjs`（从 `src/styles.css` + tailwind 配置生成原子类）

- [ ] **Step 1**: 核心包 build 产出 `dist/tokens.css` + `dist/styles.css`（tailwind 原子类，供消费端 `@import`）。
- [ ] **Step 2**: `:host` token 透传验证（light/dark 用例）：jsdom 测试设 `.dark` class 后读 `getComputedStyle` 变量值断言。
- [ ] **Step 3**: 运行 core 包 build + 全量测试。

archived-with: 2026-11-25-alaidesign-website-multi-framework
---

## Chunk 3: Vue / React wrapper（tasks 3.1-3.3）

### Task 3.1: Vue wrapper

**Files**:
- Create: `packages/vue/src/button.ts`（模式：每组件 1 文件）+ `packages/vue/src/index.ts`（导出全部）

- [ ] **Step 1**: 每组件 Vue component（以 Button 为例）：

```ts
import { h, type PropType } from 'vue';

export const AluButton = {
  name: 'AluButton',
  props: {
    variant: { type: String as PropType<'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'>, default: 'default' },
    size: { type: String, default: 'default' },
    href: String,
    disabled: Boolean,
  },
  emits: ['click'],
  render() {
    const { $props } = this as any;
    return h('alu-button', {
      variant: $props.variant, size: $props.size,
      href: $props.href, disabled: $props.disabled,
      onClick: (e: Event) => this.$emit('click', e),
    });
  },
};
```

- [ ] **Step 2**: 全量 114 组件 wrapper（机械生成初稿 + 人工校对事件映射）。
- [ ] **Step 3**: 构建 `npm run build --workspace=@alaikis/alaidesign-vue` 通过。

### Task 3.2: React wrapper

**Files**:
- Create: `packages/react/src/button.ts` + `packages/react/src/index.ts`

- [ ] **Step 1**: 每组件 forwardRef 封装 + useRef 事件桥（以 Button 为例）：

```tsx
import React, { forwardRef, useRef, useEffect } from 'react';

export interface AluButtonProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
  size?: string;
  href?: string;
  disabled?: boolean;
  onClick?: (e: Event) => void;
}

export const AluButton = forwardRef<HTMLElement, AluButtonProps>(function AluButton(props, ref) {
  const elRef = useRef<HTMLElement | null>(null);
  const setRef = (el: HTMLElement | null) => {
    (elRef as any).current = el;
    if (typeof ref === 'function') ref(el); else if (ref) (ref as any).current = el;
  };
  useEffect(() => {
    const el = elRef.current;
    if (!el || !props.onClick) return;
    el.addEventListener('click', props.onClick);
    return () => el.removeEventListener('click', props.onClick);
  }, [props.onClick]);
  const { variant, size, href, disabled, onClick, children, ...rest } = props;
  return <alu-button ref={setRef} variant={variant} size={size} href={href} disabled={disabled} {...rest}>{children}</alu-button>;
});
```

> 注：`<alu-button>` JSX 需在消费端扩展 `JSX.IntrinsicElements`；本包在 `index.ts` 导出扩展声明文件。

- [ ] **Step 2**: 全量组件 wrapper。
- [ ] **Step 3**: 构建 `npm run build --workspace=@alaikis/alaidesign-react` 通过。

### Task 3.3: wrapper 与 Svelte API 对齐验收

- [ ] **Step 1**: 抽查 10 pilot 组件：props 同名 / 事件语义 / slot 对齐（对照 Svelte `src/index.ts` 类型）。
- [ ] **Step 2**: 记录差异到 `compat-notes.md`；wrapper 包 `README.md` 写"与 Svelte 包对齐契约"。

archived-with: 2026-11-25-alaidesign-website-multi-framework
---

## Chunk 4: 官网站（tasks 4.1-4.6）

### Task 4.1: site 骨架

**Files**:
- Create: `site/package.json`、`site/vite.config.ts`、`site/index.html`、`site/src/main.ts`、`site/src/App.ts`（AlaiDesign 自身组件构建 UI，dogfooding）

- [ ] **Step 1**: Vite 项目（纯 TS，无框架，官网 UI 用 AlaiDesign Web Components 渲染，不引入 Svelte/Vue/React 运行时——官网本身是静态站，demo 区用三框架代码展示但页面自身用 Web Components + 原生 JS）。
- [ ] **Step 2**: 布局：左侧组件列表（按 16 组分类）+ 右侧详情；默认深色模式（`.dark` on html）。
- [ ] **Step 3**: `vite.config.ts` 设 `base`（构建时由 CI 环境变量 `PAGES_BASE` 注入，默认 `/`）。

### Task 4.2: 每组件 demo 页

**Files**:
- Create: `site/src/components/<name>.ts`（每组件 demo 数据 + 代码 tab 内容）
- Create: `site/src/lib/code-tabs.ts`（三框架代码 tab 渲染：Web Components 原生 / Vue / React，各含复制按钮）

- [ ] **Step 1**: 每组件页：live demo（`<alu-*>`）+ 3 代码 tab：
  - **Web Components tab**：`<alu-button variant="outline">` 原生写法
  - **Vue tab**：`<AluButton variant="outline">`（wrapper 组件）
  - **React tab**：`<AluButton variant="outline">`（wrapper 组件）
- [ ] **Step 2**: demo mock 数据：物流场景静态写死（运单/订单/用户列表，**不依赖任何后端 API**）。
- [ ] **Step 3**: 复制按钮（`navigator.clipboard`）+ 代码高亮（`shiki` 或 `highlight.js`，构建期选）。

### Task 4.3: token 文档页

**Files**:
- Create: `site/scripts/generate-token-docs.mjs`（构建期解析 `src/tokens.css` → `site/src/content/tokens.json`）

- [ ] **Step 1**: 解析 tokens.css 色板/字体/圆角/间距/阴影/间距节奏 → JSON → 页面表格渲染（light/dark 双列）。

### Task 4.4: 安装说明页

**Files**:
- Create: `site/src/pages/install.ts`

- [ ] **Step 1**: 三框架 npm 安装 + CSS 注入引导（`@import '@alaikis/alaidesign-web/styles.css'`）+ Vue `isCustomElement` 配置 + React JSX 扩展。

### Task 4.5: GitHub Pages CI

**Files**:
- Create: `.github/workflows/site-deploy.yml`

- [ ] **Step 1**: push main → checkout → node 20 → `npm ci` → build core → build site（`PAGES_BASE=/alai-desgin/`）→ `actions/deploy-pages@v4`。
- [ ] **Step 2**: `permissions: contents: read, pages: write, id-token: write`；`environment: github-pages`。

### Task 4.6: 仓库 Pages 设置

- [ ] **Step 1**: 记录 GitHub 仓库 Settings → Pages → "Deploy from branch / GitHub Actions" 选择 GH Actions 部署源（构建期由 `site-deploy.yml` 的 `actions/deploy-pages` 触发）；确认实际 Pages URL 并回填 `site/vite.config.ts` 的默认 `base`。
- [ ] **Step 2**: 部署后访问 `https://alaikis.github.io/alai-desgin/` 验证。

archived-with: 2026-11-25-alaidesign-website-multi-framework
---

## Chunk 5: 发布流扩展（tasks 5.1-5.2）

### Task 5.1: publish.yml 多包发布

**Files**:
- Modify: `.github/workflows/publish.yml`

- [ ] **Step 1**: 现有 Svelte 包发布步骤保留；新增 workspaces 构建（core/vue/react 依次 build）+ `npm publish` 逐包（`--workspaces` 或循环 `npm publish --workspace @alaikis/alaidesign-web` 等）。
- [ ] **Step 2**: 仅 tag `v*` 触发不变；NPM_TOKEN 复用。

### Task 5.2: 各包 files/exports 校对

**Files**: 各 `packages/*/package.json`、`site/package.json`

- [ ] **Step 1**: 逐包核对 `files`（dist 产物 + .d.ts + css）、`exports`（入口 + 子路径）、`peerDependencies`。
- [ ] **Step 2**: `npm pack --dry-run` 逐包验证产物清单。

archived-with: 2026-11-25-alaidesign-website-multi-framework
---

## Chunk 6: 验收（tasks 6.1-6.3）

### Task 6.1: 官网构建通过

- [ ] **Step 1**: `npm run build`（site），产物 `site/dist` 检查（PAGES_BASE 注入正确）。
- [ ] **Step 2**: 本地 `npx serve site/dist` 抽查 pilot 10 组件 demo 页渲染。

### Task 6.2: 三框架 demo 一致性

- [ ] **Step 1**: 用 Svelte/Vue/React 各搭 1 个最小 demo（临时目录，不入库）加载同一组件，截图对比 token/状态/密度。
- [ ] **Step 2**: 记录一致性问题到 `compat-notes.md` 并修复。

### Task 6.3: Svelte 包回归

- [ ] **Step 1**: 根 `npm run check && npm run build && npm test`（现有 Svelte 包）全部通过。
- [ ] **Step 2**: 确认 Svelte 包 `dist` 产物未变（workspaces 化不影响）。

archived-with: 2026-11-25-alaidesign-website-multi-framework
---

## 验证命令（每 chunk 完成后）

- 核心包测试：`npm test --workspace=@alaikis/alaidesign-web`
- 全量构建：`npm run build`（根 workspaces）
- Svelte 回归：`npm run check && npm run build`（根）
- 官网构建：`npm run build --workspace=site`

## 最终 build 提交（全部 task + 实现 Review 窗口通过后）

按 `impetus/reference/commit-convention.md` 执行一次 change 级 build 提交（中文描述，`feat:` 前缀）。
