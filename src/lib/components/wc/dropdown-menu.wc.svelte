<script lang="ts">
	// <ada-dropdown-menu trigger items open> — items 为 [{ label, value, separator?, destructive?, inset? }]。
	// 选择项时调用 onselect(value) 回调（通过 property 赋值）。
	import DropdownMenu from '../ui/dropdown-menu/dropdown-menu.svelte';
	import DropdownMenuTrigger from '../ui/dropdown-menu/dropdown-menu-trigger.svelte';
	import DropdownMenuContent from '../ui/dropdown-menu/dropdown-menu-content.svelte';
	import DropdownMenuItem from '../ui/dropdown-menu/dropdown-menu-item.svelte';
	import DropdownMenuSeparator from '../ui/dropdown-menu/dropdown-menu-separator.svelte';

	let {
		trigger = 'Menu',
		items = [],
		open = $bindable(false),
		onOpenChange,
		align = 'start',
		triggerClass = '',
		onselect
	} = $props();

	function pick(item: any) {
		onselect?.(item.value);
	}
</script>

<DropdownMenu bind:open {onOpenChange}>
	<DropdownMenuTrigger class={triggerClass}>{trigger}</DropdownMenuTrigger>
	<DropdownMenuContent {align}>
		{#each items as item, i (item.value ?? i)}
			{#if item.separator}
				<DropdownMenuSeparator />
			{:else}
				<DropdownMenuItem variant={item.destructive ? 'destructive' : 'default'} inset={item.inset} onSelect={() => pick(item)}>
					{item.label}
				</DropdownMenuItem>
			{/if}
		{/each}
	</DropdownMenuContent>
</DropdownMenu>
