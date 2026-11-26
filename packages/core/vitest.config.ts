import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    globals: true,
    // 自定义元素渲染到 shadow DOM 时 jsdom 会报未处理的合成事件错误，
    // 测试断言不受影响，忽略此类噪音。
    dangerouslyIgnoreUnhandledErrors: true,
  },
});

