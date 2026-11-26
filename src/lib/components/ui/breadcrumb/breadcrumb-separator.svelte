<script lang="ts">
	import { cn } from "../../../internal/util/cn";
	import IconComponent from '../../../internal/icon.svelte';

	let {
		separator = "lucide:chevron-right",
		class: className,
	}: {
		separator?: string;
		class?: string;
	} = $props();
</script>

<li
	data-slot="breadcrumb-separator"
	role="presentation"
	aria-hidden="true"
	class={cn("text-muted-foreground", className)}
>
	<IconComponent icon={separator} class="h-4 w-4" />
</li>
