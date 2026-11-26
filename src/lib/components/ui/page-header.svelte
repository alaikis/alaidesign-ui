<script lang="ts">
  import IconComponent from '../../internal/icon.svelte';
  import { cn } from "../../internal/util/cn";

  interface Props {
    title: string;
    description?: string;
    icon?: string;
    actions?: import('svelte').Snippet;
    class?: string;
  }

  let { title, description, icon, actions, class: className }: Props = $props();
</script>

<div
  class={cn(
    "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
    className,
  )}
>
  <div class="flex items-start gap-4">
    {#if icon}
      <div
        class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
      >
        <IconComponent {icon} class="h-6 w-6 text-primary" />
      </div>
    {/if}
    <div class="flex-1 min-w-0">
      <h1 class="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      {#if description}
        <p class="text-muted-foreground mt-1">{description}</p>
      {/if}
    </div>
  </div>
  {#if actions}
    <div class="flex items-center gap-2">
      {@render actions()}
    </div>
  {/if}
</div>
