# Brainstorming 恢复检查点 — alaidesign-website-multi-framework

- 状态：已确认（2026-11-24）
- Change：alaidesign-website-multi-framework（phase: design）

## 已确认技术决策

1. **Web Components 路线**：Svelte 组件源码降级改写为 Web Component class（Lit 模板 + 共享 token CSS），不用 svelte2webcomponents 直接编译 runes；不引入 Lit 运行时依赖（用 lit-html 或原生模板字符串均可，构建决定）
2. **React 事件桥**：useRef + useEffect addEventListener 手动桥（零额外依赖），不用 @lit-labs/react
3. **Vue wrapper**：Vue 3.3+ 原生 Custom Elements 支持（isCustomElement + onXxx 事件），不引入 vue/web-custom-element
4. **官网 demo 数据**：全部静态 mock（物流场景：运单/订单/用户列表），不依赖任何后端 API（用户明确：是组件官网不是 zymeup 业务）
5. **图标**：`@lucide/svelte` → `lucide`（SVG 工厂函数，框架无关）
6. **日期**：`@internationalized/date` 保留（纯 TS）

## 仓库结构

npm workspaces：`packages/core`（@alaikis/alaidesign-web）、`packages/vue`（-vue）、`packages/react`（-react）、`site/`（Vite 静态站 dogfooding Web Components）

## 官网站

- Vite 纯静态（非 VitePress/Storybook），每组件页：live demo + 代码 tab（Web Components 原生 / Vue wrapper / React wrapper）+ 复制
- token 文档页从 tokens.css 解析生成；安装页三框架 + CSS 注入引导
- Pages 部署：`actions/deploy-pages`，仓库级 Pages 默认地址（任务 4.6 确认实际域名）

## CI

- publish.yml 扩展 workspaces 多包发布（随 v* tag）
- site-deploy.yml：push main → 先 build core → 再 build site → deploy-pages

## 测试策略

- core：vitest + jsdom，每组件 1 例（渲染 + 1 事件）
- wrapper：各 1 个集成 demo 构建通过
- 回归：现有 Svelte 包 `npm run check` + `npm run build` 不变
- pilot 10 组件先行（Button/Card/Badge/Tooltip/Dialog/Input/Checkbox/Tabs/DataTable/Skeleton）

## Spec Patch（回写 delta spec）

- 新增 `specs/web-components-core/spec.md`：核心包组件契约（属性/事件/slot/token 注入）
- 新增 `specs/framework-wrappers/spec.md`：Vue/React wrapper API 对齐契约
- proposal 部署地址措辞收窄为「仓库级 Pages 默认地址」

## 关键风险（设计文档展开）

- bits-ui 组件行为降级（焦点/键盘/ARIA）→ 行为清单逐组件
- tailwind-variants 原子类在消费端需 `@import` 核心包 styles.css
- 批量降级转换脚本质量 → pilot 先跑通再全量
- Pages 子路径 Vite base 配置
