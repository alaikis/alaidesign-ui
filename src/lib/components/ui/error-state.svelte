<script lang="ts">
  import IconComponent from '../../internal/icon.svelte';
  import { Button } from "./button/index";

  interface Props {
    title?: string;
    message?: string;
    onRetry?: () => void;
    class?: string;
  }

  let { title = "Something went wrong", message = "An error occurred while loading data. Please try again.", onRetry, class: className }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-16 px-4 text-center {className}">
  <div class="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-4">
    <IconComponent icon="lucide:alert-circle" class="h-8 w-8 text-red-500" />
  </div>
  <h3 class="text-lg font-semibold text-foreground mb-2">{title}</h3>
  <p class="text-sm text-muted-foreground max-w-sm mb-6">{message}</p>
  {#if onRetry}
    <Button onclick={onRetry} variant="outline" class="gap-2">
      <IconComponent icon="lucide:refresh-cw" class="h-4 w-4" />
      Retry
    </Button>
  {/if}
</div>
