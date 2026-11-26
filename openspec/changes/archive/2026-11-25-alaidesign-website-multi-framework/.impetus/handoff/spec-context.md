# Impetus Spec Projection

- Change: alaidesign-website-multi-framework
- Phase: design
- Mode: beta
- Context hash: e28281ac7c785223dbeb910efacba74f6b32b6756becd41673afd5cc5bc86b83

Generated-by: impetus-handoff.sh

OpenSpec delta specs remain canonical. This file is a deterministic full-text projection for lower-token Build handoff; regenerate it when source artifacts change.

## openspec/changes/alaidesign-website-multi-framework/proposal.md

- Role: proposal
- Source: openspec/changes/alaidesign-website-multi-framework/proposal.md
- Lines: 1-34
- SHA256: bfb8d43f552f12395ba5c7afba0c786f682db5cb105f23b4c3194891e0950e99

```md
# Why

AlaiDesign（`@alaikis/alaidesign`，114 个组件）当前只有 Svelte 5 一种消费方式，且没有任何对外可见的官网/演示站：

- 设计系统与组件能力无法被快速浏览、搜索、复制使用；
- 同生态用户（Vue/React 项目）无法消费 AlaiDesign 组件，每次都要手写等价实现；
- 与 shipzy 生态既有决策（SDK 废弃框架包装器、统一 Web Components）方向不一致。

# What

1. **GitHub Pages 官网**：静态演示站，每个组件一个 demo + 可复制代码，Vite 构建部署到仓库级 GitHub Pages 默认地址（`alaikis.github.io/<repo>`，实际域名在任务 4.6 确认记录）。
2. **Web Components 统一实现**：现有 Svelte 组件编译为 Web Components 核心包，一套实现三端复用。
3. **Vue / React wrapper 包**：基于 Web Components 核心的薄 wrapper（`@alaikis/alaidesign-vue`、`@alaikis/alaidesign-react`），官网同步展示三框架使用代码。

# 目标

- 官网 CI 自动部署到 GitHub Pages，tag/分支推送后无需手动发布；
- 同一组件在 Svelte/Vue/React 三个 tab 下可复制、可运行；
- 核心视觉行为（token、状态、密度）三端一致，来源单一（tokens.css 派生）；
- 不破坏现有 `@alaikis/alaidesign` Svelte 包的 API 与发布流程。

# 范围

- 本仓库 `E:\workspace\AlaiDesign` 全部改动（组件库、官网站、wrapper 包、CI）；
- 114 个现有组件全部纳入 Web Components 核心；
- 官网覆盖组件展示、设计 token 文档、安装说明（三框架）。

# 非目标

- 不改动 Svelte 组件源码 API（wrapper 层适配，不动核心组件）；
- 不引入 Storybook；
- 不做多语言站点；
- 不发布 Web Components 核心包的 npm 版本管理策略（随主仓 tag 统一发布）；
- 不改动 shipzy-sdks / docs.shipzy.me（本 change 仅限 AlaiDesign 仓）。
```

## openspec/changes/alaidesign-website-multi-framework/design.md

- Role: open-design-notes
- Source: openspec/changes/alaidesign-website-multi-framework/design.md
- Lines: 1-67
- SHA256: b84b23974df072e37f742c627457b89d02c0f3dc073e90606b882f1fe6c98ea1

```md
# 高层架构决策

## 1. Web Components 核心层（方案选型）

**路线**：`svelte2webcomponents` 编译 Svelte 组件 → `@alaikis/alaidesign-web`（Web Components 核心包，同仓多包发布）。

```
┌─────────────────────────────────────────────────────────┐
│  AlaiDesign 组件（Svelte 5，114 个，保持不动）          │
│  src/lib/components/ui/**/*.svelte                      │
└──────────────────────┬──────────────────────────────────┘
                       │ svelte2webcomponents（build step）
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

**关键取舍**：
- Svelte 5 runes 组件经 `svelte2webcomponents` 编译；已知限制：部分高级特性（如 `$derived` 复杂响应式链）需逐组件验证，不通过的组件单独手写 Web Component 适配（保持对外 tag 名一致）；
- 复合组件（Dialog/Sheet/Select/Tooltip/Tabs 等 16 个）的子元素（DialogContent 等）各自编译为独立自定义元素，组合语义由核心层文档约定；
- 事件桥：Web Component 侧用 CustomEvent 透传 Svelte 组件回调（如 `change`、`click`、`open`），wrapper 侧再映射为框架原生事件。

## 2. 设计 token 单一来源

`src/tokens.css` 是唯一事实来源。Web Components 核心包与官网都通过构建注入（`buildInFile` / CSS import）使用同一 token 文件；shadow DOM 内 `:host` 层消费 `--*` 变量（`all: initial` 时 host 属性透传 token）。禁止在任何 wrapper 或官网里手写 token 值。

## 3. 官网（GitHub Pages）

- **形态**：Vite + 静态演示站（非 VitePress、非 Storybook），每组件一页：live demo + 三框架代码 tab（Svelte / Vue / React，代码均为 Web Components 用法 + Svelte 原生用法）+ 安装/复制。
- **部署**：`@vitejs/plugin-legacy` 级别即可；CI 用 `actions/deploy-pages` 部署到 `https://alaikis.github.io/<repo>`；
- 官网作为本仓 `site/` 目录（monorepo 内包），构建产物 `site/dist` → Pages。

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
```

## openspec/changes/alaidesign-website-multi-framework/tasks.md

- Role: tasks
- Source: openspec/changes/alaidesign-website-multi-framework/tasks.md
- Lines: 1-40
- SHA256: 281eea6e72f4d30dda2bd3c837c61e56e3c2208acc05c1b4b802e0e6097cdf22

```md
# Tasks — alaidesign-website-multi-framework

## 1. 仓库基础

- [ ] 1.1 引入 npm workspaces 结构（根 `workspaces` 字段 + 各包 `package.json`），不破坏现有 `@alaikis/alaidesign` 构建/发布
- [ ] 1.2 新增 `@alaikis/alaidesign-web` 包骨架（svelte2webcomponents 构建 pipeline）
- [ ] 1.3 新增 `@alaikis/alaidesign-vue` 与 `@alaikis/alaidesign-react` 包骨架（wrapper 基础：事件桥、props 声明生成）

## 2. Web Components 核心

- [ ] 2.1 Pilot 10 个高频组件编译验证（Button/Card/Badge/Tooltip/Dialog/Input/Checkbox/Tabs/DataTable/Skeleton），记录 svelte2webcomponents 兼容清单
- [ ] 2.2 不兼容组件手写 Web Component 适配（保持 tag 名与事件契约一致）
- [ ] 2.3 全量 114 组件纳入核心包；复合组件（Dialog/Sheet/Select/Tooltip/Tabs/DropdownMenu/Checkbox/RadioGroup/Pagination）定义子元素注册表与事件契约文档
- [ ] 2.4 token 注入：核心包随附 styles.css 原子类产物 + `:host` 属性透传 token 验证（light/dark）

## 3. Vue / React wrapper

- [ ] 3.1 Vue wrapper：Custom Elements 接入（`defineCustomElement` 或 runtime vnode），props/events 类型生成
- [ ] 3.2 React wrapper：元素封装 + 事件桥（CustomEvent → 回调 props），TS 类型生成
- [ ] 3.3 wrapper 与 Svelte 版本 API 对齐验收（同名组件 props/事件语义一致抽查）

## 4. 官网（GitHub Pages）

- [ ] 4.1 `site/` 目录：Vite 静态演示站骨架（组件列表页 + 组件详情页布局，AlaiDesign 自身组件构建 UI，dogfooding）
- [ ] 4.2 每组件 demo：live Web Component + 三框架代码 tab（Svelte/Vue/React，Web Components 用法）+ 复制按钮
- [ ] 4.3 设计 token 文档页（色板/字体/圆角/间距，从 tokens.css 生成）
- [ ] 4.4 安装说明页（npm 安装三框架 + CDN + 样式注入引导）
- [ ] 4.5 GitHub Pages CI：`site-deploy.yml`（push main → 构建 site → actions/deploy-pages）
- [ ] 4.6 仓库 Pages 设置（GitHub Settings 配包 `site` / branch `main` 或 GH Pages 自定义域名决策记录）

## 5. 发布流扩展

- [ ] 5.1 `publish.yml` 扩展为 workspaces 多包 publish（alaidesign-web / -vue / -react 随主 tag 发布）
- [ ] 5.2 各包 `files` / `exports` 字段校对（dist 产物、.d.ts、样式文件）

## 6. 验收

- [ ] 6.1 官网本地构建通过（`npm run build` site），部署 dry-run 产物检查
- [ ] 6.2 Svelte/Vue/React 三框架 demo 页渲染一致（token、状态、密度抽查 10 组件）
- [ ] 6.3 现有 `@alaikis/alaidesign` 构建与类型检查不受影响（`npm run check` + `npm run build`）
```

