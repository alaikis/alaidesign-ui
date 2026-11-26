// $app/environment stub — SvelteKit 专有模块在 Web Component 构建中的替身。
// 浏览器中 browser 恒为 true；构建产物运行于纯 Web Component 上下文，无 SvelteKit 环境。
export const browser = true;
export const dev = false;
export const building = false;
export const version = '0';
