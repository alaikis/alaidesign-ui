<script lang="ts">
	import IconComponent from '../../internal/icon.svelte';
	import { Button } from "./button/index";

	interface Props {
		icon?: string;
		iconSize?: 'sm' | 'md' | 'lg';
		title: string;
		description?: string;
		actionLabel?: string;
		onAction?: () => void;
		secondaryActionLabel?: string;
		onSecondaryAction?: () => void;
		class?: string;
	}

	let {
		icon = "lucide:inbox",
		iconSize = 'md',
		title,
		description,
		actionLabel,
		onAction,
		secondaryActionLabel,
		onSecondaryAction,
		class: className,
	}: Props = $props();

	const iconSizes: Record<string, string> = {
		sm: 'w-12 h-12 [&>svg]:h-6 [&>svg]:w-6',
		md: 'w-16 h-16 [&>svg]:h-8 [&>svg]:w-8',
		lg: 'w-20 h-20 [&>svg]:h-10 [&>svg]:w-10',
	};
</script>

<div class="flex flex-col items-center justify-center py-16 px-4 text-center {className}">
	<div class="{iconSizes[iconSize]} rounded-lg bg-muted/50 flex items-center justify-center mb-4">
		<IconComponent {icon} class="text-muted-foreground/50" />
	</div>
	<h3 class="text-lg font-semibold text-foreground mb-2">{title}</h3>
	{#if description}
		<p class="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
	{/if}
	<div class="flex gap-2">
		{#if actionLabel && onAction}
			<Button onclick={onAction} class="gap-2">
				{actionLabel}
			</Button>
		{/if}
		{#if secondaryActionLabel && onSecondaryAction}
			<Button onclick={onSecondaryAction} variant="outline" class="gap-2">
				{secondaryActionLabel}
			</Button>
		{/if}
	</div>
</div>
