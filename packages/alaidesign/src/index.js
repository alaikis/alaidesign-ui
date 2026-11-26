// @alaikis/alaidesign-multi — 多平台组件库统一入口
// 逻辑单包，按平台分发：
//   web     → @alaikis/alaidesign-ui（Web Components，alu-* 自定义元素）
//   rn/expo → 原生 RN 组件（JS/TS）
//   uniappx → uvue 组件
//   flutter → pub 包 alaikis_alaidesign（Dart）
//   swift   → SPM 包 AlaiDesign（Swift）
//
// Web 端复用 @alaikis/alaidesign-ui；其余平台各出物理包。
export * from '@alaikis/alaidesign-ui';
