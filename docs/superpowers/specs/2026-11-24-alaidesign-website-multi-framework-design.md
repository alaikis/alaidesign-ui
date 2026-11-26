---
impetus_change: alaidesign-website-multi-framework
role: technical-design
canonical_spec: openspec
archived-with: 2026-11-25-alaidesign-website-multi-framework
status: final
---

# AlaiDesign 组件官网 + Vue/React 支持 — 技术设计

- Change: `alaidesign-website-multi-framework`
- 仓库: `E:\workspace\AlaiDesign`
- 日期: 2026-11-24

## 1. 范围与目标

- AlaiDesign（`@alaikis/alaidesign`，114 组件，Svelte 5）增加 Web Components 核心层，使 Vue/React 项目可通过薄 wrapper 包消费同一套组件与视觉。
- 新增 GitHub Pages 静态官网：组件 live demo + 三框架代码 tab + 设计 token 文档 + 安装说明。
- 不改动现有 Svelte 组件源码 API 与发布流；现有包保持可独立构建发布。

## 2. 仓库结构

```
AlaiDesign/
├── package.json              # + workspaces: ["packages/*", "site"]
├── src/                      # 现有 Svelte 组件源码（不动）
├── packages/
│   ├── core/                 # @alaikis/alaidesign-web（Web Components 核心）
│   ├── vue/                  # @alaikis/alaidesign-vue（薄 wrapper）
│   └── react/                # @alaikis/alaidesign-react（薄 wrapper）
├── site/                     # 官网（Vite 静态站，dogfooding 核心包）
└── .github/workflows/
    ├── publish.yml           # 扩展多包发布
    └── site-deploy.yml       # 新增 Pages 部署
```

## 3. Web Components 核心包（packages/core）

### 3.1 转换路线

现有 Svelte 组件大量使用 Svelte 5 runes（`$props`/`$bindable`/`$state`/`$derived`），`svelte2webcomponents` 对 runes 支持不完整。因此核心包组件由 Svelte 源码**降级改写为 Web Component class**（模板字符串 + 属性/事件声明 + 共享 CSS），不是运行时编译 Svelte：

- 每个组件 `class Alu<Name> extends HTMLElement`，`observedAttributes` 声明 Svelte props（variant/size 等），`connectedCallback` 渲染模板（lit-html 模板字符串或原生 `innerHTML`，构建时定）；
- Svelte `children` → `<slot>`；
- Svelte 事件（onClick 等）→ 原生 DOM 事件（button 自带 click）+ 组件自定义 CustomEvent（open/close/change 等）；
- tailwind-variants 的 `buttonVariants(...)` 类名函数原样保留（依赖不变：tailwind-variants/clsx/tailwind-merge/lucide）；
- 图标 `@lucide/svelte` → `lucide`（SVG 工厂函数，框架无关）；日期 `@internationalized/date` 保留。

### 3.2 bits-ui 行为组件

Dialog/Select/Tooltip/Checkbox/RadioGroup 等依赖 bits-ui 的无障碍行为（焦点管理、键盘、ARIA），降级时逐组件保留行为清单（角色、aria-expanded、Escape 关闭、焦点圈定等）。pilot 优先验证。

### 3.3 复合组件

16 组复合组件（Dialog/Sheet/Select/Tooltip/Tabs/DropdownMenu/Checkbox/RadioGroup/Pagination）子元素各自独立 class（如 `alu-dialog` + `alu-dialog-content`），组合语义靠 slot + 事件约定；核心包导出子元素注册表与事件契约文档。

### 3.4 token 注入

- 核心包随附 `styles.css`（tailwind 原子类构建产物）+ `tokens.css`（原样复制）；
- 消费端一次 `@import '@alaikis/alaidesign-web/dist/styles.css'`；
- `:host` 属性透传 `--*` 变量；light/dark 由宿主 `.dark` 类切换（与 Svelte 包机制一致）。

### 3.5 组件契约（每组件）

| 维度 | 约定 |
|------|------|
| 标签名 | `alu-<kebab-name>`（如 `alu-button`、`alu-data-table`） |
| 属性 | Svelte prop 同名小写（variant/size/disabled 等），observed attributes 触发重渲染 |
| 事件 | 原生事件（click）直接冒泡；组件行为事件用 CustomEvent（`open`/`close`/`change`/`select`） |
| slot | `default`（Svelte children）；具名 slot 按组件需要 |
| ref | 自定义元素 ref 直接指向元素（DOM API） |

## 4. Vue wrapper（packages/vue）

- 每组件导出一个 Vue 3 component：`name`、`props`（与核心包属性同名）、`emits`、`render()` 返回 `h('alu-button', {...})`；
- 依赖 Vue 3.3+ 原生 Custom Elements 支持：消费端 `compilerOptions.isCustomElement`（或 build 时 `vite-plugin-vue` 等价配置）将 `alu-*` 识别为原生元素；事件 `onXxx` props 自动 `addEventListener`；
- 不引入 `vue/web-custom-element`，零额外运行时依赖；
- TS 类型：每组件 `interface Alu<Name>Props` 与核心包属性对齐（手写或脚本生成初稿）。

## 5. React wrapper（packages/react）

- 每组件 `React.forwardRef` 函数组件：props 透传为 attributes，未知属性 spread；
- 事件桥：`useRef + useEffect` 手动 `addEventListener`（已确认路线），事件名映射为 `onXxx` props；
- 零额外依赖（react 为 peerDependency）；
- 提供 `declare global { namespace JSX { interface IntrinsicElements { 'alu-button': ... } } }` 扩展，或组件组件用法（`<AluButton>`）；默认组件用法。

## 6. 官网（site/）

- Vite 纯静态站（非 VitePress、非 Storybook）；
- 布局：左侧组件列表 + 右侧详情；详情页 = live demo（`<alu-*>` 直接渲染）+ 代码 tab（Web Components 原生 / Vue wrapper / React wrapper）+ 复制按钮；
- demo mock 数据：物流场景静态写死（运单/订单/用户列表），**不依赖任何后端 API**；
- token 文档页：脚本解析 `tokens.css` 生成色板/字体/圆角/间距表格（构建期生成，非运行时）；
- 安装页：三框架 npm 安装 + CSS 注入引导；
- UI 自身用 AlaiDesign 组件（dogfooding 核心包）；
- Pages 子路径：`vite.config` 设 `base`（CI 注入仓库名，默认 `/alai-desgin/`）；
- 官网 UI 深色模式默认（对齐 AlaiDesign 暗色 token 体系）。

## 7. CI/CD

- `publish.yml`：现有 Svelte 包发布不变；扩展 workspaces 多包发布（`packages/*` 随 `v*` tag `npm publish` 逐包，token 复用 NPM_TOKEN secret）；
- `site-deploy.yml`（新增）：push main → checkout → `npm ci` → build core → build site → `actions/deploy-pages`；
- Pages 仓库设置：GitHub 仓库 Settings → Pages → 部署分支（GH Actions）；实际 URL `https://alaikis.github.io/<repo>/`（任务 4.6 记录确认值）。

## 8. 测试策略

- **core**：vitest + jsdom；每组件 1 例最小用例（注册自定义元素 → 渲染断言 + 触发 1 个事件断言 CustomEvent）；pilot 10 组件全量先行；
- **wrapper**：各 1 个集成 demo 构建通过（Vite build 即验收）；
- **官网**：`site` 构建成功 + pilot 10 组件 demo 页 DOM 抽查；
- **回归**：根 `npm run check` + `npm run build`（Svelte 包）不变。

## 9. 任务拆分映射

| 任务组 | 内容 | 关键产物 |
|--------|------|----------|
| 1.x | workspaces + 包骨架 | 根 package.json workspaces、3 个包 package.json |
| 2.x | 核心包转换 | 降级脚本/手工 class、slot/事件契约、token 注入、pilot 10 + 全量 114 |
| 3.x | wrapper | Vue/React 包（每组件 1 个文件） |
| 4.x | 官网 | site 骨架、组件 demo 页、token 页、安装页、Pages CI |
| 5.x | 发布流 | publish.yml 多包、files/exports 校对 |
| 6.x | 验收 | 构建通过、三端一致性抽查、回归 |

## 10. 风险与对策

| 风险 | 对策 |
|------|------|
| bits-ui 行为降级不完整（焦点/键盘/ARIA） | 逐组件行为清单；Dialog/Select/Tooltip 列入 pilot 优先验证 |
| 原子类 CSS 在消费端缺失 | 核心包随附 styles.css；安装文档强制 `@import` 引导 |
| 批量降级转换脚本质量 | pilot 10 组件跑通脚本 + 人工核对后再全量；不兼容的手写 |
| Pages 子路径 base 错误 | CI 注入 base，构建产物校验 |
| wrapper 类型与核心包属性漂移 | 类型由核心包 props 定义单一来源（脚本生成初稿 + 人工校对） |
