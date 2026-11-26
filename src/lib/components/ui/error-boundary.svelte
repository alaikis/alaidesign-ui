<script lang="ts">
	import IconComponent from '../../internal/icon.svelte';
	import { Button } from "./button/index";
	import type { Snippet } from "svelte";

	interface Props {
		children?: Snippet;
		onError?: (error: Error) => void;
		fallback?: Snippet<[{ error: Error; reset: () => void }]>;
	}

	let { children, onError, fallback }: Props = $props();

	let error = $state<Error | null>(null);
	let resetBoundary = $state<() => void>(() => {});

	function handleError(e: unknown, reset: () => void) {
		error = e instanceof Error ? e : new Error(String(e));
		onError?.(error);
		resetBoundary = reset;
	}

	function handleReset() {
		error = null;
		resetBoundary();
	}
</script>

<svelte:boundary onerror={handleError}>
	{#if error}
		{#if fallback}
			{@render fallback({ error, reset: handleReset })}
		{:else}
			<div class="flex flex-col items-center justify-center py-16 px-4 text-center">
				<div class="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-4">
					<IconComponent icon="lucide:alert-circle" class="h-8 w-8 text-red-500" />
				</div>
				<h3 class="text-lg font-semibold text-foreground mb-2">Something went wrong</h3>
				<p class="text-sm text-muted-foreground max-w-sm mb-6">{error.message || 'An unexpected error occurred'}</p>
				<Button onclick={handleReset} variant="outline" class="gap-2">
					<IconComponent icon="lucide:refresh-cw" class="h-4 w-4" />
					Try Again
				</Button>
			</div>
		{/if}
	{:else}
		{@render children?.()}
	{/if}
</svelte:boundary>
