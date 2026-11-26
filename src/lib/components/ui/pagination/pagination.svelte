<script lang="ts">
	import { Pagination as PaginationPrimitive } from "bits-ui";

	import { cn } from "../../../internal/util/cn";
	import { buttonVariants } from "../button/index";
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';

	let {
		ref = $bindable(null),
		class: className,
		count = 0,
		perPage = 10,
		page = $bindable(1),
		siblingCount = 1,
		...restProps
	}: PaginationPrimitive.RootProps = $props();
</script>

<PaginationPrimitive.Root
	bind:ref
	bind:page
	role="navigation"
	aria-label="pagination"
	data-slot="pagination"
	{count}
	{perPage}
	{siblingCount}
	class={cn("mx-auto flex w-full justify-center", className)}
	{...restProps}
>
	{#snippet children({ pages, currentPage })}
		<ul class="flex items-center gap-0.5">
			<li>
				<PaginationPrimitive.PrevButton
					aria-label="Go to previous page"
					class={cn(buttonVariants({ variant: "ghost", size: "icon" }), "pl-1.5!")}
				>
					<ChevronLeftIcon />
				</PaginationPrimitive.PrevButton>
			</li>

			{#each pages as pItem (pItem.key)}
				{#if pItem.type === "page"}
					<li>
						<PaginationPrimitive.Page
							page={pItem}
							aria-current={pItem.value === currentPage ? "page" : undefined}
							data-active={pItem.value === currentPage}
						class={cn(
							buttonVariants({ size: "icon", variant: pItem.value === currentPage ? "outline" : "ghost" })
						)}
						>
							{pItem.value}
						</PaginationPrimitive.Page>
					</li>
				{:else}
					<li aria-hidden="true" class="flex size-8 items-center justify-center">
						<MoreHorizontalIcon class="size-4" />
						<span class="sr-only">More pages</span>
					</li>
				{/if}
			{/each}

			<li>
				<PaginationPrimitive.NextButton
					aria-label="Go to next page"
					class={cn(buttonVariants({ variant: "ghost", size: "icon" }), "pr-1.5!")}
				>
					<ChevronRightIcon />
				</PaginationPrimitive.NextButton>
			</li>
		</ul>
	{/snippet}
</PaginationPrimitive.Root>