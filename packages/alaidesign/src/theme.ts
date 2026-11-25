// AlaiDesign 多平台设计 token（单一来源 → 各平台主题变量映射）
// 与 tokens.css 的 --* 变量同源；各平台包消费此映射，保证跨端视觉一致。

export interface ThemeTokens {
  colorPrimary: string;
  colorPrimaryForeground: string;
  colorBackground: string;
  colorCard: string;
  colorBorder: string;
  colorMuted: string;
  colorMutedForeground: string;
  colorSuccess: string;
  colorWarning: string;
  colorDestructive: string;
  colorInfo: string;
  fontBody: string;
  radius: number;
  spaceBase: number;
}

// light（与 tokens.css :root 对齐）
export const themeLight: ThemeTokens = {
  colorPrimary: '#0052D9',
  colorPrimaryForeground: '#FFFFFF',
  colorBackground: '#F3F3F3',
  colorCard: '#FFFFFF',
  colorBorder: '#DCDEE3',
  colorMuted: '#F5F5F5',
  colorMutedForeground: '#5A5E66',
  colorSuccess: '#00A86B',
  colorWarning: '#F5A623',
  colorDestructive: '#E5484D',
  colorInfo: '#0052D9',
  fontBody: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  radius: 6,
  spaceBase: 8,
};

// dark（与 tokens.css .dark 对齐）
export const themeDark: ThemeTokens = {
  colorPrimary: '#366EF4',
  colorPrimaryForeground: '#FFFFFF',
  colorBackground: '#0F1015',
  colorCard: '#14161C',
  colorBorder: '#33363F',
  colorMuted: '#1E2129',
  colorMutedForeground: '#A1A7B3',
  colorSuccess: '#00A86B',
  colorWarning: '#F5A623',
  colorDestructive: '#E5484D',
  colorInfo: '#366EF4',
  fontBody: themeLight.fontBody,
  radius: 6,
  spaceBase: 8,
};

export type ThemeMode = 'light' | 'dark';

export function themeFor(mode: ThemeMode): ThemeTokens {
  return mode === 'dark' ? themeDark : themeLight;
}
