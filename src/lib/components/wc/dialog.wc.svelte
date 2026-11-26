<script lang="ts">
	// 单元素封装：<ada-dialog trigger title description open> 默认 slot 为正文。
	// 同一 Svelte 组件树内组合 bits-ui Dialog 全系列子部件，context 正常。
	import Dialog from '../ui/dialog/dialog.svelte';
	import DialogTrigger from '../ui/dialog/dialog-trigger.svelte';
	import DialogContent from '../ui/dialog/dialog-content.svelte';
	import DialogHeader from '../ui/dialog/dialog-header.svelte';
	import DialogTitle from '../ui/dialog/dialog-title.svelte';
	import DialogDescription from '../ui/dialog/dialog-description.svelte';
	import DialogFooter from '../ui/dialog/dialog-footer.svelte';
	import DialogClose from '../ui/dialog/dialog-close.svelte';

	let {
		trigger = 'Open',
		title = '',
		description = '',
		open = $bindable(false),
		onOpenChange,
		triggerClass = '',
		contentClass = '',
		closeLabel = 'Close',
		children
	} = $props();
</script>

<Dialog bind:open {onOpenChange}>
	<DialogTrigger class={triggerClass}>{trigger}</DialogTrigger>
	<DialogContent class={contentClass}>
		<DialogHeader>
			{#if title}<DialogTitle>{title}</DialogTitle>{/if}
			{#if description}<DialogDescription>{description}</DialogDescription>{/if}
		</DialogHeader>
		{@render children?.()}
		<DialogFooter>
			<DialogClose>{closeLabel}</DialogClose>
		</DialogFooter>
	</DialogContent>
</Dialog>
