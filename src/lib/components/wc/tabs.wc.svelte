<script lang="ts">
	// <ada-tabs> — tabs 属性为 [{ value, label, html? }]，value 为当前激活值。
	// 复杂数据通过元素 property 赋值（el.tabs = [...]），不使用 attribute。
	import Tabs from '../ui/tabs/tabs.svelte';
	import TabsList from '../ui/tabs/tabs-list.svelte';
	import TabsTrigger from '../ui/tabs/tabs-trigger.svelte';
	import TabsContent from '../ui/tabs/tabs-content.svelte';

	let {
		tabs = [],
		value = $bindable(''),
		onValueChange,
		variant = 'default',
		class: className = '',
		children
	} = $props();
</script>

<Tabs bind:value {onValueChange} class={className}>
	<TabsList variant={variant}>
		{#each tabs as tab (tab.value)}
			<TabsTrigger value={tab.value}>{tab.label}</TabsTrigger>
		{/each}
	</TabsList>
	{#each tabs as tab (tab.value)}
		<TabsContent value={tab.value}>
			{@html tab.html ?? ''}
		</TabsContent>
	{/each}
	{#if children}{@render children()}{/if}
</Tabs>
