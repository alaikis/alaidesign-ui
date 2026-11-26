// 构建期离线注册 lucide 图标集：让 @iconify/svelte 的 OfflineIcon 无需联网即可渲染。
// 仅 Web Components 构建使用（build-wc 将 '@iconify/svelte' 别名到 OfflineIcon）。
import { addCollection } from '@iconify/svelte/dist/offline-functions';
import lucide from '@iconify-json/lucide/icons.json';

addCollection(lucide);
