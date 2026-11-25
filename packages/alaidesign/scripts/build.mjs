// @alaikis/alaidesign 构建脚本
// 逻辑单包多平台：
//   web     → 复用 @alaikis/alaidesign-ui（npm 依赖）
//   rn/expo → TS/TSX 原生组件（平台代码，供 RN/Expo 工程直接 import）
//   uniappx → uvue 单文件组件（.vue，随工程引用）
//   flutter → Dart pub 包（platforms/flutter/pubspec.yaml，pub 发布）
//   swift   → SPM 包（platforms/swift/Package.swift，SPM 发布）
//
// 本脚本仅做产物校验；各平台产物由其自身工具链（tsc/pub/swift）发布。
const root = new URL('..', import.meta.url).pathname;

console.log('[build] @alaikis/alaidesign 多平台入口');
console.log('[build] web     → @alaikis/alaidesign-ui（npm 依赖，独立发布）');
console.log('[build] rn/expo → platforms/rn/*.tsx（TS 原生，平台工程 import）');
console.log('[build] uniappx → platforms/uniappx/components/*.vue（uvue）');
console.log('[build] flutter → platforms/flutter/pubspec.yaml（pub.dev 发布 alaikis_alaidesign）');
console.log('[build] swift   → platforms/swift/Package.swift（SPM 发布 AlaiDesign）');

// 校验各平台产物存在（相对 packages/alaidesign 目录）
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// 脚本运行目录 = packages/alaidesign（npm run build 的 cwd）
const base = process.cwd();
const required = [
  'platforms/rn/index.ts',
  'platforms/rn/components.tsx',
  'platforms/expo/index.ts',
  'platforms/uniappx/index.ts',
  'platforms/uniappx/components/button.vue',
  'platforms/flutter/pubspec.yaml',
  'platforms/flutter/lib/alaikis_alaidesign.dart',
  'platforms/flutter/lib/src/theme.dart',
  'platforms/flutter/lib/src/button.dart',
  'platforms/swift/Package.swift',
  'platforms/swift/Sources/AlaiDesign/AlaiThemeTokens.swift',
  'src/index.js',
  'src/theme.ts',
];
for (const rel of required) {
  const p = path.resolve(base, rel);
  if (!fs.existsSync(p)) {
    console.error(`[build] MISSING ${rel}`);
    process.exit(1);
  }
}
console.log('[build] all platform artifacts present ✓');
