# AlaiDesign — Project Context

AlaiDesign（`@alaikis/alaidesign`）是高能量设计语言的 Svelte 5 组件库，面向 Zymeup 物流 SaaS 中后台场景。

## 仓库

- 本地：`E:\workspace\AlaiDesign`
- GitHub：`github.com/alaikis/alai-desgin`
- 发布：tag `v*` 触发 `.github/workflows/publish.yml` → npmjs（`@alaikis/alaidesign` + workspaces 多包）
- 官网：独立仓 `E:\workspace\adesgin-ui-site` → `github.com/alaikis/adesgin-ui-site`（GitHub Pages，消费 `@alaikis/alaidesign-ui` npm 包）

## 结构

- `src/index.ts` — 114 个组件导出（复合组件：Dialog/Sheet/Select/Tooltip/Tabs/DropdownMenu/Checkbox/RadioGroup/Pagination）
- `src/tokens.css` — 设计 token（light + dark，CSS 自定义属性 `--*`）
- `src/styles.css` — Tailwind utilities
- 构建：`svelte-package`（`@sveltejs/package`），产物 `dist/`

## 设计 token 约定

- 所有视觉值必须走 `--*` token（品牌蓝 `#0052D9` + 中性灰骨架 + 高能量强化）
- 状态变体从 base token 派生，禁止临场造值

## 多框架策略（本 change 起）

- 组件库统一采用 **Web Components 路线**：一套实现，Svelte/Vue/React 通过薄 wrapper 包消费
- 对齐 shipzy 生态既有决策（SDK 废弃框架包装器、统一 Web Components）

## 提交约定

- 中文 commit 描述；类型前缀 `feat/fix/refactor/docs/chore/test`
