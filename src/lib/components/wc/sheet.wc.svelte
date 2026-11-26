<script lang="ts">
	// <ada-sheet trigger title description open side> 默认 slot 为正文。
	import Sheet from '../ui/sheet/sheet.svelte';
	import SheetTrigger from '../ui/sheet/sheet-trigger.svelte';
	import SheetContent from '../ui/sheet/sheet-content.svelte';
	import SheetHeader from '../ui/sheet/sheet-header.svelte';
	import SheetTitle from '../ui/sheet/sheet-title.svelte';
	import SheetDescription from '../ui/sheet/sheet-description.svelte';
	import SheetFooter from '../ui/sheet/sheet-footer.svelte';
	import SheetClose from '../ui/sheet/sheet-close.svelte';

	let {
		trigger = 'Open',
		title = '',
		description = '',
		open = $bindable(false),
		onOpenChange,
		side = 'right',
		triggerClass = '',
		contentClass = '',
		closeLabel = 'Close',
		children
	} = $props();
</script>

<Sheet bind:open {onOpenChange}>
	<SheetTrigger class={triggerClass}>{trigger}</SheetTrigger>
	<SheetContent side={side} class={contentClass}>
		<SheetHeader>
			{#if title}<SheetTitle>{title}</SheetTitle>{/if}
			{#if description}<SheetDescription>{description}</SheetDescription>{/if}
		</SheetHeader>
		{@render children?.()}
		<SheetFooter>
			<SheetClose>{closeLabel}</SheetClose>
		</SheetFooter>
	</SheetContent>
</Sheet>
