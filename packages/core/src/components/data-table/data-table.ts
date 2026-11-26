import { cn } from '../../internal/cn';

// 与 Svelte 包 table/data-table.svelte 对齐（Table + Pagination + Skeleton 降级组合）
export type DataTableColumn = {
  key: string;
  title: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, row: any, index: number) => unknown;
  fixed?: 'left' | 'right';
};

export type DataTablePagination = {
  total: number;
  page?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
};

// 排序图标（lucide chevron-up / chevron-down / chevrons-up-down）
const SORT_ICONS: Record<string, string> = {
  'chevron-up': 'M18 15l-6-6-6 6',
  'chevron-down': 'M6 9l6 6 6-6',
  'chevrons-up-down': 'M7 15l5 5 5-5M7 9l5-5 5 5',
};

function sortSvg(name: string, colorClass: string): string {
  return `<span class="transition-transform ${colorClass}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="${SORT_ICONS[name]}"/></svg></span>`;
}

const SKELETON_CLASS = 'animate-pulse rounded-md bg-muted';
const EMPTY_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 text-muted-foreground"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>';

/**
 * <alu-data-table> — 数据表格（对应 Svelte DataTable）。
 * 属性（JSON 序列化）：columns / data / pagination / row-key / loading / empty-text / empty-icon
 * 事件：row-click（detail.row）/ page-change（detail.{page,pageSize}）/ sort（detail.{key,direction}）
 * 分页：使用 alu-pagination 子组件；列排序由本组件管理。
 */
export class AluDataTable extends HTMLElement {
  static observedAttributes = ['columns', 'data', 'pagination', 'loading', 'row-key', 'empty-text', 'empty-icon', 'class'];

  get columns(): DataTableColumn[] {
    try {
      return JSON.parse(this.getAttribute('columns') ?? '[]');
    } catch {
      return [];
    }
  }
  get data(): Record<string, unknown>[] {
    try {
      return JSON.parse(this.getAttribute('data') ?? '[]');
    } catch {
      return [];
    }
  }

  private _sortKey: string | null = null;
  private _sortDir: 'asc' | 'desc' = 'asc';
  private _page = 1;
  private _pageSize = 10;

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<style>:host{display:block}.data-table-container{width:100%}</style>' +
      `<div class="data-table-container ${this.getAttribute('class') ?? ''}"></div>`;
    this._page = Number(this.getAttribute('pagination')) ? (JSON.parse(this.getAttribute('pagination') || '{}') as DataTablePagination).page ?? 1 : 1;
    this._pageSize = Number(this.getAttribute('pagination')) ? (JSON.parse(this.getAttribute('pagination') || '{}') as DataTablePagination).pageSize ?? 10 : 10;
    this._render();
    this.addEventListener('click', this._onClick);
  }

  attributeChangedCallback() {
    this._render();
  }

  private get _root(): HTMLElement {
    return this.shadowRoot!.querySelector('.data-table-container')!;
  }

  private _sortedData(): Record<string, unknown>[] {
    if (!this._sortKey) return this.data;
    const key = this._sortKey;
    const dir = this._sortDir === 'asc' ? 1 : -1;
    return [...this.data].sort((a, b) => {
      const av = String(a[key]);
      const bv = String(b[key]);
      if (av === bv) return 0;
      if (av < bv) return -1 * dir;
      return 1 * dir;
    });
  }

  private _render() {
    const root = this._root;
    const cols = this.columns;
    const loading = this.hasAttribute('loading');
    const data = this._sortedData();
    const total = (JSON.parse(this.getAttribute('pagination') || 'null') as DataTablePagination | null)?.total ?? 0;
    const emptyText = this.getAttribute('empty-text') ?? 'No data';
    const emptyIcon = this.getAttribute('empty-icon') ?? 'lucide:inbox';

    const headerCells = cols
      .map((c) => {
        const align = c.align === 'center' ? 'text-center' : c.align === 'right' ? 'text-right' : 'text-left';
        const sortCls = this._sortKey === c.key ? 'text-primary' : 'text-muted-foreground/50';
        const icon = c.sortable
          ? sortSvg(
              this._sortKey === c.key ? (this._sortDir === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down',
              sortCls,
            )
          : '';
        const style = c.width ? ` style="width: ${c.width}"` : '';
        return `<th data-key="${c.key}"${c.sortable ? ' class="cursor-pointer select-none hover:bg-muted/30 transition-colors"' : ''} class="px-6 py-4 font-bold text-base border-none ${align}"${style}><div class="flex items-center gap-2"><span>${c.title}</span>${icon}</div></th>`;
      })
      .join('');

    let bodyRows = '';
    if (loading) {
      const rows = Array.from({ length: this._pageSize })
        .map((_, i) =>
          `<tr class="border-none hover:bg-transparent">${cols.map((c) => `<td class="px-6 py-5 border-none"><div class="${SKELETON_CLASS} h-5 w-full max-w-[200px]" data-i="${i}"></div></td>`).join('')}</tr>`,
        )
        .join('');
      bodyRows = rows;
    } else if (data.length === 0) {
      bodyRows = `<tr class="border-none"><td colspan="${cols.length}" class="p-16 text-center"><div class="flex flex-col items-center justify-center"><div class="w-20 h-20 bg-gradient-to-br from-muted/30 to-muted/10 rounded-full flex items-center justify-center mb-6 border-2 border-border/50">${EMPTY_ICON}</div><p class="text-xl font-semibold text-muted-foreground">${emptyText}</p></div></td></tr>`;
    } else {
      bodyRows = data
        .map((row, index) =>
          `<tr data-index="${index}" class="border-none hover:bg-muted/20 transition-colors cursor-pointer">${cols
            .map((c) => {
              const raw = row[c.key];
              const align = c.align === 'center' ? 'text-center' : c.align === 'right' ? 'text-right' : 'text-left';
              // render 列：Web Components 无法执行函数；此处用 JSON 值渲染
              const content = raw == null ? '' : String(raw);
              return `<td class="px-6 py-5 border-none ${align}">${content}</td>`;
            })
            .join('')}</tr>`,
        )
        .join('');
    }

    const paginationHtml =
      total > 0
        ? `<div class="border-t border-border/50 p-4 bg-muted/5"><div class="flex flex-col sm:flex-row items-center justify-between gap-4"><div class="text-sm text-muted-foreground">Total <span class="font-semibold text-foreground">${total}</span> records, Page <span class="font-semibold text-foreground">${this._page}</span> / <span class="font-semibold text-foreground">${Math.ceil(total / this._pageSize)}</span></div><alu-pagination count="${total}" per-page="${this._pageSize}" page="${this._page}" data-slot="pagination"></alu-pagination></div></div>`
        : '';

    root.innerHTML = `<div class="rounded-lg bg-card border border-border overflow-hidden"><div class="overflow-x-auto"><table class="w-full caption-bottom text-sm border-none"><thead class="bg-muted/20 border-b border-border/50"><tr class="border-none hover:bg-transparent">${headerCells}</tr></thead><tbody class="border-none">${bodyRows}</tbody></table></div>${paginationHtml}</div>`;

    // shadow 内 th 点击 → 转发到 handleSort（jsdom 下 composed 事件不穿透宿主边界）
    root.querySelectorAll('th[data-key]').forEach((thEl) => {
      thEl.addEventListener('click', () => {
        const key = thEl.getAttribute('data-key')!;
        this.handleSort(key, 'asc');
      });
    });

    // 分页事件 → 本组件
    const pag = root.querySelector('alu-pagination') as unknown as { addEventListener: (e: string, cb: (ev: Event) => void) => void } | null;
    pag?.addEventListener('page-change', (e: Event) => {
      const p = (e as CustomEvent).detail.page as number;
      this._page = p;
      this._render();
      this.dispatchEvent(new CustomEvent('page-change', { detail: { page: p, pageSize: this._pageSize }, bubbles: true, composed: true }));
    });
  }

  private _onClick = (e: Event) => {
    const th = (e.target as HTMLElement).closest('th[data-key]');
    if (th) {
      const key = th.getAttribute('data-key')!;
      const col = this.columns.find((c) => c.key === key);
      if (col?.sortable) {
        if (this._sortKey === key) {
          this._sortDir = this._sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          this._sortKey = key;
          this._sortDir = 'asc';
        }
        this._render();
        this.dispatchEvent(new CustomEvent('sort', { detail: { key, direction: this._sortDir }, bubbles: true, composed: true }));
      }
      return;
    }
    const tr = (e.target as HTMLElement).closest('tr[data-index]');
    if (tr) {
      const idx = Number(tr.getAttribute('data-index'));
      const row = this._sortedData()[idx];
      this.dispatchEvent(new CustomEvent('row-click', { detail: { row }, bubbles: true, composed: true }));
    }
  };

  // 公开方法：供 shadow DOM 内 th 点击转发（composed 事件在 jsdom 下不穿透宿主边界）
  handleSort(key: string, direction: 'asc' | 'desc') {
    if (this._sortKey === key) {
      this._sortDir = this._sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this._sortKey = key;
      this._sortDir = direction;
    }
    this._render();
    this.dispatchEvent(
      new CustomEvent('sort', { detail: { key, direction: this._sortDir }, bubbles: true, composed: true }),
    );
  }
}

if (!customElements.get('alu-data-table')) {
  customElements.define('alu-data-table', AluDataTable);
}
