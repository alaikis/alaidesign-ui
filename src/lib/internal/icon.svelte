<script lang="ts">
	// 统一图标组件：基于 @lucide/svelte（离线、无网络），icon 可传 'lucide:xxx' 或 'xxx'。
	import { resolveIcon } from './icon-registry';

	// class 支持字符串或字符串数组（数组在下方 join；消费方如 sonner 传数组）
	let { icon = '', class: className = '' as string | string[], ...rest } = $props();

	const Cls = $derived(resolveIcon(typeof icon === 'string' ? icon : ''));
	const cls = $derived(Array.isArray(className) ? className.filter(Boolean).join(' ') : className);
</script>

{#if Cls}<Cls class={cls} {...rest} />{/if}
