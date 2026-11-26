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
