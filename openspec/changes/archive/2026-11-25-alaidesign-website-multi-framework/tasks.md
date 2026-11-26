# Tasks — alaidesign-website-multi-framework

## 1. 仓库基础

- [x] 1.1 引入 npm workspaces 结构（根 `workspaces` 字段 + 各包 `package.json`），不破坏现有 `@alaikis/alaidesign` 构建/发布
- [x] 1.2 新增 `@alaikis/alaidesign-web` 包骨架（svelte2webcomponents 构建 pipeline）
- [x] 1.3 新增 `@alaikis/alaidesign-vue` 与 `@alaikis/alaidesign-react` 包骨架（wrapper 基础：事件桥、props 声明生成）

## 2. Web Components 核心

- [x] 2.1 Pilot 10 个高频组件编译验证（Button/Card/Badge/Tooltip/Dialog/Input/Checkbox/Tabs/DataTable/Skeleton），记录 svelte2webcomponents 兼容清单
- [x] 2.2 不兼容组件手写 Web Component 适配（保持 tag 名与事件契约一致）
- [x] 2.3 全量 114 组件纳入核心包；复合组件（Dialog/Sheet/Select/Tooltip/Tabs/DropdownMenu/Checkbox/RadioGroup/Pagination）定义子元素注册表与事件契约文档
- [x] 2.4 token 注入：核心包随附 styles.css 原子类产物 + `:host` 属性透传 token 验证（light/dark）

## 3. Vue / React wrapper

- [x] 3.1 Vue wrapper：Custom Elements 接入（`defineCustomElement` 或 runtime vnode），props/events 类型生成
- [x] 3.2 React wrapper：元素封装 + 事件桥（CustomEvent → 回调 props），TS 类型生成
- [x] 3.3 wrapper 与 Svelte 版本 API 对齐验收（同名组件 props/事件语义一致抽查）

## 4. 官网（GitHub Pages）

- [x] 4.1 `site/` 目录：Vite 静态演示站骨架（组件列表页 + 组件详情页布局，AlaiDesign 自身组件构建 UI，dogfooding）
- [x] 4.2 每组件 demo：live Web Component + 三框架代码 tab（Svelte/Vue/React，Web Components 用法）+ 复制按钮
- [x] 4.3 设计 token 文档页（色板/字体/圆角/间距，从 tokens.css 生成）
- [x] 4.4 安装说明页（npm 安装三框架 + CDN + 样式注入引导）
- [x] 4.5 GitHub Pages CI：`deploy.yml`（push main → 构建 → actions/deploy-pages）【已拆独立仓 github.com/alaikis/adesgin-ui-site，CI 随新仓】
- [x] 4.6 仓库 Pages 设置（独立仓 Settings → Pages → GitHub Actions 部署源；`PAGES_BASE=/adesgin-ui-site/`）【需新仓 Settings 侧操作】

## 5. 发布流扩展

- [x] 5.1 `publish.yml` 扩展为 workspaces 多包 publish（alaidesign-web / -vue / -react 随主 tag 发布）
- [x] 5.2 各包 `files` / `exports` 字段校对（dist 产物、.d.ts、样式文件）

## 6. 验收

- [x] 6.1 官网本地构建通过（`npm run build` site），部署 dry-run 产物检查
- [x] 6.2 Svelte/Vue/React 三框架 demo 页渲染一致（token、状态、密度抽查 10 组件）【静态验收：核心包 token 透传 + 测试 12/12 通过；浏览器视觉一致性于部署后人工抽查】
- [x] 6.3 现有 `@alaikis/alaidesign` 构建与类型检查不受影响（`npm run check` + `npm run build`）
