# 高层架构决策

## 1. Web Components 核心层（方案选型）

**路线（已实现）**：Svelte 组件源码降级改写为手写 Web Component class（shadow DOM + 共享 token CSS + CustomEvent 事件桥）→ `@alaikis/alaidesign-web`（Web Components 核心包，同仓多包发布）。

> **Implementation Divergence（verify 2026-11-24 记录）**：原定 `svelte2webcomponents` 编译路线未采用，原因是 Svelte 5 runes（$props/$state/$derived）在 svelte2webcomponents 下支持不完整。实际实现为：每个组件手写 `class Alu<Name> extends HTMLElement`（observedAttributes + shadow DOM 渲染 + slot + CustomEvent），bits-ui 行为组件（Dialog/Tabs/Checkbox/RadioGroup/Tooltip）降级保留无障碍语义（role/aria/键盘），lucide 图标与 tailwind-variants 类名原样保留。Svelte 源组件未改动，但核心包组件为独立手写实现（非编译产物）。

```
┌─────────────────────────────────────────────────────────┐
│  AlaiDesign 组件（Svelte 5，114 个，保持不动）          │
│  src/lib/components/ui/**/*.svelte                      │
└──────────────────────┬──────────────────────────────────┘
                       │ 降级改写（非编译）：手写 Web Component class
                       ▼
┌─────────────────────────────────────────────────────────┐
│  @alaikis/alaidesign-web（Web Components 核心）         │
│  自定义元素 + CSS 自定义属性 token + shadow DOM 封装    │
└───────┬───────────────────────────────┬─────────────────┘
        │                               │
        ▼                               ▼
┌──────────────────────┐    ┌──────────────────────┐
│ @alaikis/alaidesign- │    │ @alaikis/alaidesign- │
│ vue（薄 wrapper）     │    │ react（薄 wrapper）   │
│ Vue Custom Elements  │    │ React 封装 + 事件桥  │
└──────────────────────┘    └──────────────────────┘
```

**关键取舍（实际）**：
- 每个组件手写 Web Component class（shadow DOM），tag 名 `alu-<kebab>`；
- 复合组件（Dialog/Sheet/Select/Tooltip/Tabs 等 16 个）子元素各自独立 class，组合语义靠 slot + CustomEvent 约定；
- 事件桥：Web Component 侧 CustomEvent（bubbles + composed），React 侧 useRef+addEventListener 手动桥；Vue 侧 Vue 3.3+ 原生 Custom Elements 支持；
- 图标：`lucide` 包（SVG 工厂函数，框架无关）替代 `@lucide/svelte`；
- 样式：核心包随附 styles.css（tailwind 原子类）+ tokens.css，消费端 `@import` 一次；shadow DOM `:host` 属性透传 `--*` token。

## 2. 设计 token 单一来源

`src/tokens.css` 是唯一事实来源。Web Components 核心包与官网都通过构建注入（`buildInFile` / CSS import）使用同一 token 文件；shadow DOM 内 `:host` 层消费 `--*` 变量（`all: initial` 时 host 属性透传 token）。禁止在任何 wrapper 或官网里手写 token 值。

## 3. 官网（GitHub Pages）

- **形态**：Vite + 静态演示站（非 VitePress、非 Storybook），每组件一页：live demo + 三框架代码 tab（Svelte / Vue / React，代码均为 Web Components 用法 + Svelte 原生用法）+ 安装/复制。
- **部署**：`@vitejs/plugin-legacy` 级别即可；官网为**独立仓库** `github.com/alaikis/adesgin-ui-site`（本地 `E:\workspace\adesgin-ui-site`），CI 用 `actions/deploy-pages` 部署到 `https://alaikis.github.io/adesgin-ui-site/`；独立仓从 npm 安装 `@alaikis/alaidesign-web` 包（未发布前用 `file:` 本地链接），非 monorepo workspace。
- 独立仓构建产物 `dist/` → Pages（`PAGES_BASE=/adesgin-ui-site/`）。

## 4. 包与发布

- 仓库内 npm workspaces 多包：
  - `@alaikis/alaidesign`（现有，不动）
  - `@alaikis/alaidesign-web`（Web Components 核心，新增）
  - `@alaikis/alaidesign-vue` / `@alaikis/alaidesign-react`（wrapper，新增）
- 发布仍走 tag `v*` 触发 `.github/workflows/publish.yml`，扩展为多包 publish；官网 deploy workflow 独立（push main → Pages）。

## 5. 数据流（运行时）

```
框架侧（Vue/React/Svelte 模板）
  → wrapper 组件（props 声明、事件绑定）
  → 渲染 <ala-button variant size ...> 自定义元素
  → Web Component 核心：apply token + Svelte 编译产物行为
  → CustomEvent 冒泡 → wrapper 回调 → 框架状态
```

## 风险与对策

| 风险 | 对策 |
|------|------|
| svelte2webcomponents 对 Svelte 5 runes 支持不全 | 先 pilot 10 个高频组件（Button/Card/Badge/Tag/Tooltip/Dialog/Input/Checkbox/Tabs/DataTable）验证；不通过的走手写 Web Component 适配清单 |
| shadow DOM 与 Tailwind 类名（现有组件大量使用 Tailwind 原子类） | 核心包随附 styles.css 原子类构建产物；`:host` + 属性选择器透传 token；官网提供 `<style>` 注入引导 |
| 16 个复合组件语义 | 每个复合组件在核心层定义子元素注册表与事件契约，写入官网"组合用法"文档 |
| Pages 构建失败阻断 CI | 独立 workflow（site-deploy.yml）与 publish.yml 解耦 |
