<script lang="ts">
	import { cn } from "../../../internal/util/cn";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import type { Snippet } from "svelte";
	import type { HTMLSelectAttributes } from "svelte/elements";

	interface Props extends Omit<HTMLSelectAttributes, "value" | "class" | "children"> {
		value?: string;
		onValueChange?: (value: string) => void;
		disabled?: boolean;
		placeholder?: string;
		options?: Array<{ value: string; label: string; disabled?: boolean }>;
		class?: string;
		children?: Snippet;
	}

	let {
		value = $bindable(undefined),
		onValueChange,
		disabled,
		placeholder,
		options = [],
		class: className,
		children,
		...restProps
	}: Props = $props();

	function handleChange(event: Event & { currentTarget: HTMLSelectElement }) {
		value = event.currentTarget.value;
		onValueChange?.(value);
	}
</script>

<div class="relative">
	<select
		{value}
		onchange={handleChange}
		class={cn(
			"h-9 w-full appearance-none rounded-lg border border-border bg-card px-3 py-1.5 pr-8 text-sm transition-all duration-200",
			"focus:border-info focus:ring-2 focus:ring-info/20 focus:outline-none",
			"disabled:cursor-not-allowed disabled:opacity-50",
			className
		)}
		{disabled}
		{...restProps}
	>
	{#if placeholder}
		<option value="" disabled selected>{placeholder}</option>
	{/if}
	{#each options as opt (opt.value)}
		<option value={opt.value} disabled={opt.disabled}>{opt.label}</option>
	{/each}
	{@render children?.()}
	</select>
	<ChevronDownIcon class="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
</div>
