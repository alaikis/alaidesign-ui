<script lang="ts">
    import {
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableHeader,
        TableRow,
    } from "../table/index";
    import { Pagination } from "../pagination/index";
    import { Skeleton } from "../skeleton/index";
    import IconComponent from "@iconify/svelte";
    import { cn } from "../../../internal/util/cn";

    // Column definition type (without generic to avoid parsing issues)
    export type Column = {
        key: string;
        title: string;
        width?: string;
        align?: "left" | "center" | "right";
        sortable?: boolean;
        render?: (value: any, row: any, index: number) => any;
        fixed?: "left" | "right";
    };

    // Pagination config type
    export type PaginationConfig = {
        total: number;
        page?: number;
        pageSize?: number;
        pageSizeOptions?: number[];
        showSizeChanger?: boolean;
        showQuickJumper?: boolean;
    };

    // Component props
    let {
        columns = [],
        data = [],
        loading = false,
        pagination,
        emptyText = "No data",
        emptyIcon = "lucide:inbox",
        rowKey = "id",
        onRowClick,
        onPageChange,
        onSort,
        class: className,
    }: {
        columns: Column[];
        data: any[];
        loading?: boolean;
        pagination?: PaginationConfig;
        emptyText?: string;
        emptyIcon?: string;
        rowKey?: string;
        onRowClick?: (row: any) => void;
        onPageChange?: (page: number, pageSize: number) => void;
        onSort?: (key: string, direction: "asc" | "desc") => void;
        class?: string;
    } = $props();

    // 内部状态
    let currentPage = $state(pagination?.page ?? 1);
    let currentPageSize = $state(pagination?.pageSize ?? 10);
    let sortKey = $state<string | null>(null);
    let sortDirection = $state<"asc" | "desc">("asc");

    // 计算总页数
    let totalPage = $derived(
        pagination?.total ? Math.ceil(pagination.total / currentPageSize) : 1,
    );

    // 处理分页变化
    function handlePageChange(page: number, pageSize: number) {
        currentPage = page;
        currentPageSize = pageSize;
        onPageChange?.(page, pageSize);
    }

    // 监听 currentPage 变化同步到外部
    $effect(() => {
        if (pagination?.page && currentPage !== pagination.page) {
            onPageChange?.(currentPage, currentPageSize);
        }
    });

    // 处理排序
    function handleSort(column: Column) {
        if (!column.sortable) return;

        if (sortKey === column.key) {
            sortDirection = sortDirection === "asc" ? "desc" : "asc";
        } else {
            sortKey = column.key;
            sortDirection = "asc";
        }
        onSort?.(column.key, sortDirection);
    }

    // 获取单元格内容
    function getCellContent(column: Column, row: any, index: number) {
        if (column.render) {
            return column.render(row[column.key], row, index);
        }
        return row[column.key];
    }

    // 处理行点击（容器委托：TableRow 的 onclick 经 spread 不一定挂载为 DOM 事件）
    function handleContainerClick(e: MouseEvent) {
        const tr = (e.target as HTMLElement)?.closest?.('tr[data-row-index]') as HTMLElement | null;
        if (!tr) return;
        const idx = Number(tr.getAttribute('data-row-index'));
        if (!Number.isNaN(idx) && data[idx]) handleRowClick(data[idx]);
    }

    // 处理行点击
    function handleRowClick(row: any) {
        onRowClick?.(row);
    }

    // 对齐样式
    function getAlignClass(align?: string) {
        switch (align) {
            case "center":
                return "text-center";
            case "right":
                return "text-right";
            default:
                return "text-left";
        }
    }
</script>

<div class={cn("data-table-container", className)} onclick={handleContainerClick}>
    <!-- 表格区域 -->
    <div
        class="rounded-lg bg-card border border-border overflow-hidden"
    >
        <div class="overflow-x-auto">
            <Table class="border-none">
                <TableHeader class="bg-muted/20 border-b border-border/50">
                    <TableRow class="border-none hover:bg-transparent">
                        {#each columns as column}
                            <TableHead
                                class={cn(
                                    "px-6 py-4 font-bold text-base border-none",
                                    getAlignClass(column.align),
                                    column.sortable &&
                                        "cursor-pointer select-none hover:bg-muted/30 transition-colors",
                                )}
                                style={column.width
                                    ? `width: ${column.width}`
                                    : ""}
                                onclick={() => handleSort(column)}
                            >
                                <div class="flex items-center gap-2">
                                    <span>{column.title}</span>
                                    {#if column.sortable}
                                        <span
                                            class="transition-transform {sortKey ===
                                            column.key
                                                ? 'text-primary'
                                                : 'text-muted-foreground/50'}"
                                        >
                                            {#if sortKey === column.key}
                                                <IconComponent
                                                    icon={sortDirection ===
                                                    "asc"
                                                        ? "lucide:chevron-up"
                                                        : "lucide:chevron-down"}
                                                    class="h-4 w-4"
                                                />
                                            {:else}
                                                <IconComponent
                                                    icon="lucide:chevrons-up-down"
                                                    class="h-4 w-4"
                                                />
                                            {/if}
                                        </span>
                                    {/if}
                                </div>
                            </TableHead>
                        {/each}
                    </TableRow>
                </TableHeader>
                <TableBody class="border-none">
                    {#if loading}
                        <!-- 加载状态 -->
                        {#each Array(currentPageSize) as _, i}
                            <TableRow class="border-none hover:bg-transparent">
                                {#each columns as column}
                                    <TableCell class="px-6 py-5 border-none">
                                        <Skeleton
                                            class="h-5 w-full max-w-[200px]"
                                        />
                                    </TableCell>
                                {/each}
                            </TableRow>
                        {/each}
                    {:else if data.length === 0}
                        <!-- 空状态 -->
                        <TableRow class="border-none">
                            <td
                                colspan={columns.length}
                                class="p-16 text-center"
                            >
                                <div
                                    class="flex flex-col items-center justify-center"
                                >
                                    <div
                                        class="w-20 h-20 bg-gradient-to-br from-muted/30 to-muted/10 rounded-full flex items-center justify-center mb-6 border-2 border-border/50"
                                    >
                                        <IconComponent
                                            icon={emptyIcon}
                                            class="w-10 h-10 text-muted-foreground"
                                        />
                                    </div>
                                    <p
                                        class="text-xl font-semibold text-muted-foreground"
                                    >
                                        {emptyText}
                                    </p>
                                </div>
                            </td>
                        </TableRow>
                    {:else}
                        <!-- 数据行 -->
                        {#each data as item, index}
                            <TableRow
                                class="border-none hover:bg-muted/20 transition-colors cursor-pointer"
                                data-row-index={index}
                            >
                                {#each columns as column}
                                    <TableCell
                                        class={cn(
                                            "px-6 py-5 border-none",
                                            getAlignClass(column.align),
                                        )}
                                    >
                                        {@html getCellContent(
                                            column,
                                            item,
                                            index,
                                        )}
                                    </TableCell>
                                {/each}
                            </TableRow>
                        {/each}
                    {/if}
                </TableBody>
            </Table>
        </div>

        <!-- 分页 -->
        {#if pagination && pagination.total > 0}
            <div class="border-t border-border/50 p-4 bg-muted/5">
                <div
                    class="flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                    <div class="text-sm text-muted-foreground">
                        Total <span class="font-semibold text-foreground"
                            >{pagination.total}</span
                        >
                        records, Page
                        <span class="font-semibold text-foreground"
                            >{currentPage}</span
                        >
                        /
                        <span class="font-semibold text-foreground"
                            >{totalPage}</span
                        >
                    </div>
                    <Pagination
                        count={pagination.total}
                        perPage={currentPageSize}
                        bind:page={currentPage}
                    />
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .data-table-container {
        width: 100%;
    }
</style>
