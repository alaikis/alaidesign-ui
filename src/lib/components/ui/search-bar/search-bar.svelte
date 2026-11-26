<script lang="ts">
    import { cn } from "../../../internal/util/cn";
    import IconComponent from '../../../internal/icon.svelte';

    let {
        value = $bindable(""),
        placeholder = "Search...",
        onSearch,
        class: className,
        clearable = true,
        loading = false,
    }: {
        value?: string;
        placeholder?: string;
        onSearch?: (value: string) => void;
        class?: string;
        clearable?: boolean;
        loading?: boolean;
    } = $props();

    let focused = $state(false);
    let inputEl: HTMLInputElement | null = $state(null);
    let debounceTimer: ReturnType<typeof setTimeout> | null = $state(null);

    function onInput(e: Event) {
        const target = e.target as HTMLInputElement;
        value = target.value;
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            onSearch?.(value);
        }, 350);
    }

    function onClear() {
        value = "";
        onSearch?.("");
        inputEl?.focus();
    }
</script>

<div
    class={cn(
        "relative flex items-center rounded-md border transition-colors",
        focused
            ? "border-primary/60 ring-2 ring-primary/20"
            : "border-border hover:border-border/80",
        className,
    )}
>
    <div class="pl-3.5 flex items-center pointer-events-none">
        {#if loading}
            <IconComponent icon="lucide:loader-2" class="h-4 w-4 text-muted-foreground animate-spin" />
        {:else}
            <IconComponent icon="lucide:search" class="h-4 w-4 text-muted-foreground transition-colors" />
        {/if}
    </div>
    <input
        bind:this={inputEl}
        {placeholder}
        value={value}
        oninput={onInput}
        onfocus={() => (focused = true)}
        onblur={() => (focused = false)}
        onkeydown={(e) => e.key === "Enter" && onSearch?.(value)}
        class="h-9 w-full rounded-md bg-transparent px-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none"
    />
    {#if clearable && value}
        <button
            type="button"
            onclick={onClear}
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
            <IconComponent icon="lucide:x" class="h-4 w-4" />
        </button>
    {/if}
</div>
