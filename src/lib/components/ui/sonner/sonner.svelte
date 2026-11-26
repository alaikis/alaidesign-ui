<script lang="ts">
	import IconComponent from '../../../internal/icon.svelte';
	let { type = "info", description = "", duration = 3000, onDismiss }: {
		type?: "info" | "success" | "error" | "warning";
		description?: string;
		duration?: number;
		onDismiss?: () => void;
	} = $props();

	let visible = $state(true);
	let progress = $state(100);

	const iconMap = {
		success: "lucide:check-circle",
		error: "lucide:alert-circle",
		warning: "lucide:alert-triangle",
		info: "lucide:info",
	};

	const colorMap = {
		success: "text-green-600 dark:text-green-400",
		error: "text-red-600 dark:text-red-400",
		warning: "text-yellow-600 dark:text-yellow-400",
		info: "text-blue-600 dark:text-blue-400",
	};

	const bgMap = {
		success: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
		error: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
		warning: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800",
		info: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
	};

	$effect(() => {
		if (!visible || !duration) return;
		const interval = setInterval(() => {
			progress -= 100 / (duration / 50);
			if (progress <= 0) {
				visible = false;
				onDismiss?.();
				clearInterval(interval);
			}
		}, 50);
		return () => clearInterval(interval);
	});

	function dismiss() {
		visible = false;
		onDismiss?.();
	}
</script>

{#if visible}
	<div class="fixed top-4 right-4 z-[9999] max-w-sm {bgMap[type]} border rounded-lg shadow p-4 flex items-start gap-3 transition-all">
		<IconComponent icon={iconMap[type]} class={["h-5 w-5 flex-shrink-0 mt-0.5", colorMap[type]]} />
		<p class="text-sm font-medium flex-1">{description}</p>
		<button onclick={dismiss} class="flex-shrink-0 hover:opacity-70 transition-opacity">
			<IconComponent icon="lucide:x" class="h-4 w-4" />
		</button>
		<div class="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg" style="width: {progress}%; transition: width 50ms linear;"></div>
	</div>
{/if}
