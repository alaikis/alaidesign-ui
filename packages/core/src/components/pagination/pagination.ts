import { AluPaginationPrevious, AluPaginationNext } from './pagination-nav';

// 分页组（与 Svelte 包 pagination.svelte 对齐，bits-ui Pagination Root 降级）
// 属性：count / per-page / page / sibling-count
// 事件：page-change（detail.page）

function chevronMore(): string {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>';
}

export class AluPagination extends HTMLElement {
  static observedAttributes = ['count', 'per-page', 'page', 'sibling-count', 'class'];

  get count(): number {
    return Number(this.getAttribute('count')) || 0;
  }
  get perPage(): number {
    return Number(this.getAttribute('per-page')) || 10;
  }
  get page(): number {
    return Number(this.getAttribute('page')) || 1;
  }
  set page(v: number) {
    this.setAttribute('page', String(v));
  }
  get siblingCount(): number {
    return Number(this.getAttribute('sibling-count')) || 1;
  }

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<style>:host{display:block}</style>' +
      `<nav role="navigation" aria-label="pagination" data-slot="pagination" class="cn-pagination mx-auto flex w-full justify-center ${this.getAttribute('class') ?? ''}"></nav>`;
    this._renderPages();
    this.addEventListener('click', this._onClick);
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this._renderPages();
  }

  private get _nav(): HTMLElement {
    return this.shadowRoot!.querySelector('nav')!;
  }

  private _pages(): Array<{ key: string; value: number; type: 'page' | 'ellipsis' }> {
    const total = Math.max(1, Math.ceil(this.count / this.perPage));
    const page = Math.min(this.page, total);
    const s = this.siblingCount;
    const result: Array<{ key: string; value: number; type: 'page' | 'ellipsis' }> = [];
    const range = (start: number, end: number) => {
      for (let i = start; i <= end; i++) result.push({ key: `page-${i}`, value: i, type: 'page' });
    };
    range(1, 1);
    let left = Math.max(2, page - s);
    if (left > 2) result.push({ key: 'left-ellipsis', value: 0, type: 'ellipsis' });
    left = Math.max(left, total - 2 * s + 1 > 2 ? left : 2);
    const right = Math.min(total - 1, page + s);
    if (total - right > 2) {
      range(Math.max(left, total - 2 * s + 1), Math.min(right, total - 1));
      result.push({ key: 'right-ellipsis', value: 0, type: 'ellipsis' });
      range(total, total);
    } else {
      range(left, right);
      range(total, total);
    }
    // 去重
    const seen = new Set<string>();
    return result.filter((p) => {
      if (seen.has(p.key)) return false;
      seen.add(p.key);
      return true;
    });
  }

  private _renderPages() {
    const nav = this._nav;
    const total = Math.max(1, Math.ceil(this.count / this.perPage));
    const page = this.page;
    const clsPrev = 'pl-1.5!';
    const clsNext = 'pr-1.5!';
    const items = this._pages()
      .map((p) => {
        if (p.type === 'ellipsis') {
          return `<li aria-hidden="true" class="flex size-8 items-center justify-center">${chevronMore()}<span class="sr-only">More pages</span></li>`;
        }
        const active = p.value === page;
        return `<li data-page="${p.value}"${active ? ' data-active' : ''}><alu-pagination-link page="${p.value}"${active ? ' is-active' : ''} aria-current="${active ? 'page' : ''}">${p.value}</alu-pagination-link></li>`;
      })
      .join('');
    nav.innerHTML =
      `<ul class="flex items-center gap-0.5">` +
      `<li><alu-pagination-previous class="${clsPrev}"></alu-pagination-previous></li>` +
      items +
      `<li><alu-pagination-next class="${clsNext}"></alu-pagination-next></li>` +
      `</ul>`;
    this._syncDisabled(total, page);
  }

  private _syncDisabled(total: number, page: number) {
    const prev = this._nav.querySelector('alu-pagination-previous')!;
    const next = this._nav.querySelector('alu-pagination-next')!;
    prev.toggleAttribute('disabled', page <= 1);
    next.toggleAttribute('disabled', page >= total);
  }

  private _onClick = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.closest('alu-pagination-previous')) {
      const total = Math.max(1, Math.ceil(this.count / this.perPage));
      if (this.page > 1) this._go(this.page - 1);
      else if (total > 1) this._go(total);
      return;
    }
    if (target.closest('alu-pagination-next')) {
      const total = Math.max(1, Math.ceil(this.count / this.perPage));
      if (this.page < total) this._go(this.page + 1);
      else this._go(1);
      return;
    }
    const li = target.closest('li[data-page]');
    if (li) {
      const p = Number((li as HTMLElement).getAttribute('data-page'));
      if (p && p !== this.page) this._go(p);
    }
  };

  private _go(p: number) {
    this.setAttribute('page', String(p));
    this._renderPages();
    this.dispatchEvent(
      new CustomEvent('page-change', { detail: { page: p }, bubbles: true, composed: true }),
    );
  }
}

if (!customElements.get('alu-pagination')) {
  customElements.define('alu-pagination', AluPagination);
}

export { AluPaginationPrevious, AluPaginationNext };
