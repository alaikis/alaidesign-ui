<script lang="ts">
	// <ada-tooltip content side> 默认 slot 为触发器内容。
	// 内部自带 Tooltip.Provider + Root，避免消费者需额外包裹。
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	import TooltipTrigger from '../ui/tooltip/tooltip-trigger.svelte';
	import TooltipContent from '../ui/tooltip/tooltip-content.svelte';

	let {
		content = '',
		side = 'top',
		sideOffset = 0,
		open = $bindable(false),
		onOpenChange,
		delayDuration = 300,
		children
	} = $props();
</script>

<TooltipPrimitive.Provider>
	<TooltipPrimitive.Root bind:open {onOpenChange} {delayDuration}>
		<TooltipTrigger>
			{@render children?.()}
		</TooltipTrigger>
		<TooltipContent {side} {sideOffset}>{content}</TooltipContent>
	</TooltipPrimitive.Root>
</TooltipPrimitive.Provider>
