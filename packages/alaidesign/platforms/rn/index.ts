// @alaikis/alaidesign/rn — React Native 原生组件
// 共享 AlaiDesign 设计 token（src/theme.ts），原生 View/Text/Pressable 实现。
// Expo 与 RN 通用（platforms/expo 直接 re-export 本目录 + 加 expo 专属能力）。
export * from './components';
export { themeLight, themeDark, themeFor, type ThemeTokens, type ThemeMode } from '../theme';
