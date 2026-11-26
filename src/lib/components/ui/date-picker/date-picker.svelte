<script lang="ts">
	import { DatePicker as DatePickerPrimitive } from "bits-ui";
	import { cn } from "../../../internal/util/cn";
	import { CalendarIcon } from "@lucide/svelte";
	import { ChevronLeftIcon, ChevronRightIcon } from "@lucide/svelte";
	import type { DateValue } from "@internationalized/date";
	import type { Snippet } from "svelte";

	let {
		value = $bindable(undefined),
		onValueChange,
		placeholder = $bindable(undefined),
		disabled,
		class: className,
		children,
		...restProps
	}: {
		value?: DateValue | undefined;
		onValueChange?: (date: DateValue | undefined) => void;
		placeholder?: DateValue | undefined;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<DatePickerPrimitive.Root
	bind:value
	bind:placeholder
	{onValueChange}
	{disabled}
	{...restProps}
>
	<div class={cn("relative", className)}>
		{#if children}
			{@render children()}
		{:else}
			<DatePickerPrimitive.Input
				class={cn(
					"flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm",
					"focus-within:border-info focus-within:ring-2 focus-within:ring-info/20",
					"data-disabled:cursor-not-allowed data-disabled:opacity-50"
				)}
			>
				{#snippet children({ segments })}
					<CalendarIcon class="h-4 w-4 opacity-50" />
					{#each segments as { part, value: segmentValue }, i (`${part}-${i}`)}
						<DatePickerPrimitive.Segment
							{part}
							class="rounded px-0.5 focus:bg-muted focus:text-foreground focus:outline-none"
						>
							{segmentValue}
						</DatePickerPrimitive.Segment>
					{/each}
					<DatePickerPrimitive.Trigger
						class="ml-auto inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
					>
						<CalendarIcon class="h-4 w-4" />
					</DatePickerPrimitive.Trigger>
				{/snippet}
			</DatePickerPrimitive.Input>
			<DatePickerPrimitive.Content
				class="z-50 rounded-lg border border-border bg-popover text-popover-foreground shadow-md"
				side="bottom"
				align="start"
				sideOffset={4}
			>
				<DatePickerPrimitive.Calendar class="p-3">
					{#snippet children({ months, weekdays })}
						<DatePickerPrimitive.Header class="flex items-center justify-between pb-2">
							<DatePickerPrimitive.PrevButton
								class="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
							>
								<ChevronLeftIcon class="h-4 w-4" />
							</DatePickerPrimitive.PrevButton>
							<DatePickerPrimitive.Heading class="text-sm font-medium text-foreground" />
							<DatePickerPrimitive.NextButton
								class="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
							>
								<ChevronRightIcon class="h-4 w-4" />
							</DatePickerPrimitive.NextButton>
						</DatePickerPrimitive.Header>
						{#each months as month (month.value.toString())}
							<DatePickerPrimitive.Grid class="w-full border-collapse select-none">
								<DatePickerPrimitive.GridHead>
									<DatePickerPrimitive.GridRow class="flex">
										{#each weekdays as weekday (weekday)}
											<DatePickerPrimitive.HeadCell
												class="w-8 text-xs font-normal text-muted-foreground"
											>
												{weekday.slice(0, 2)}
											</DatePickerPrimitive.HeadCell>
										{/each}
									</DatePickerPrimitive.GridRow>
								</DatePickerPrimitive.GridHead>
								<DatePickerPrimitive.GridBody>
									{#each month.weeks as week (week[0].toString())}
										<DatePickerPrimitive.GridRow class="flex w-full">
											{#each week as date (date.toString())}
												<DatePickerPrimitive.Cell
													{date}
													month={month.value}
													class="p-0 text-center text-sm"
												>
													<DatePickerPrimitive.Day
														class={cn(
															"inline-flex h-8 w-8 items-center justify-center rounded text-sm text-foreground",
															"hover:bg-muted data-selected:bg-primary data-selected:text-primary-foreground",
															"data-disabled:text-muted-foreground/50 data-unavailable:line-through",
															"data-outside-month:text-muted-foreground/50"
														)}
													/>
												</DatePickerPrimitive.Cell>
											{/each}
										</DatePickerPrimitive.GridRow>
									{/each}
								</DatePickerPrimitive.GridBody>
							</DatePickerPrimitive.Grid>
						{/each}
					{/snippet}
				</DatePickerPrimitive.Calendar>
			</DatePickerPrimitive.Content>
		{/if}
	</div>
</DatePickerPrimitive.Root>
