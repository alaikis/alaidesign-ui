<script lang="ts">
	// <ada-avatar src alt fallback size> — 图片失败时回退到 fallback 文本。
	import Avatar from '../ui/avatar/avatar.svelte';
	import AvatarImage from '../ui/avatar/avatar-image.svelte';
	import AvatarFallback from '../ui/avatar/avatar-fallback.svelte';

	let {
		src = '',
		alt = '',
		fallback = '',
		size = 'default',
		class: className = ''
	} = $props();
</script>

<Avatar {size} class={className}>
	{#if src}<AvatarImage {src} {alt} />{/if}
	<AvatarFallback>{fallback || alt || '?'}</AvatarFallback>
</Avatar>
