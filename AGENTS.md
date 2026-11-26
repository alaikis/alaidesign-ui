# AlaiDesign 开发规范

## 决策方式（Decision Protocol）

**范围/选项类需求必须用单选（radio）形式逐项决策，禁止 agent 自行假设默认值后直接实现。**

适用于：
- 功能形态选择（官网做落地页 vs 仅文档站）
- 技术选型（VitePress vs Vite 自定义、Web Components 路线 vs 编译路线）
- 覆盖范围（全量组件 vs 高频组件）
- 文案/品牌决策（是否保留来源引用、命名）
- 任何存在 ≥2 个合理选项的开放点

**规则**：
1. 用 `question` 工具以 `multiple: false`（单选）逐条呈现选项，每条附简短说明 + 推荐项（推荐项放首位并标注「(推荐)」）
2. 用户选定后才实现；选项不明确时不得猜测
3. 一次需求可拆多个单选项，但每个选项是独立的 radio 决策
4. 决策结果记录在对应 change 的 design.md / tasks.md，并（如属跨会话约束）回写本文件「项目决策」节
5. 若用户说「按默认」，才使用标注的推荐项，否则必须等用户逐项选择

**反例**（禁止）：「我按合理默认推进，落地页+文档站+全量组件…」—— 未用 radio 让用户逐项确认即开工。

## 多框架消费路线

- 组件库主包 `@alaikis/alaidesign`（Svelte 5）
- Web Components 核心 `@alaikis/alaidesign-ui`（框架无关，`alu-*` 自定义元素 + slot + CustomEvent）
- Vue/React 薄 wrapper `@alaikis/alaidesign-vue` / `@alaikis/alaidesign-react`
- 一套设计 token（`tokens.css`）+ 原子类 CSS（`styles.css`）单一来源，三端视觉零漂移

## 对外文案

- 面向用户的文案（官网、包 description、npm 页面）**不得出现来源/参考对象字段**（如具体第三方设计体系名、厂商名）
- 内部开发文档（DESIGN.md 设计溯源、测试断言）可保留来源说明
- 新增对外文案前检查是否含来源引用

## 官网（adesgin-ui-site）

- 独立仓 `github.com/alaikis/adesgin-ui-site`，消费 `@alaikis/alaidesign-ui` npm 包
- 组件文档：独立 `src/docs/components.ts` 数据文件 + `alu-data-table` 参数表 + 四框架代码 tab（Svelte/Web Components/Vue/React）
- 路由：history API（`/components/<name>`），非 hash 锚点
- 文案/品牌：AlaiDesign 自有「高能量设计体系」描述，不引用外部设计体系

## 提交约定

- 中文 commit 描述；类型前缀 `feat/fix/refactor/docs/chore/test`
- 分支 `ai/<user>/<change>`；推送 main 由 CI 自动发布/部署
- 跨仓改动（AlaiDesign + adesgin-ui-site）各自独立提交
