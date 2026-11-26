<script lang="ts">
	// <ada-radio-group> — options 为 [{ value, label, disabled? }]；value 为当前选中值。
	// 复杂数据通过 property 赋值（el.options = [...]）。
	import RadioGroup from '../ui/radio-group/radio-group.svelte';
	import RadioGroupItem from '../ui/radio-group/radio-group-item.svelte';

	let {
		options = [],
		value = $bindable(undefined),
		disabled = false,
		class: className = '',
		onValueChange
	} = $props();
</script>

<RadioGroup bind:value {disabled} class={className} {onValueChange}>
	{#each options as opt (opt.value)}
		<label class="flex items-center gap-2 text-sm">
			<RadioGroupItem value={opt.value} disabled={opt.disabled ?? false} />
			<span>{opt.label}</span>
		</label>
	{/each}
</RadioGroup>
