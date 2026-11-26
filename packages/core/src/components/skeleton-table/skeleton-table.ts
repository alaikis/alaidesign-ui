import { AluTable } from '../table/table';

// 骨架表格（与 Svelte 包 skeleton-table.svelte 对齐）
const SKELETON_CLASS = 'animate-pulse rounded-md bg-muted';

export class AluSkeletonTable extends HTMLElement {
  static observedAttributes = ['rows', 'cols', 'class'];

  get rows(): number {
    return Number(this.getAttribute('rows')) || 5;
  }
  get cols(): number {
    return Number(this.getAttribute('cols')) || 6;
  }

  private _render() {
    if (!this.shadowRoot) return;
    const rows = this.rows;
    const cols = this.cols;
    const html = Array.from({ length: rows })
      .map((_, ri) => {
        const cells = Array.from({ length: cols })
          .map((_, ci) => {
            const w = ci === 0 ? 'w-1/5' : ci === 1 ? 'w-2/5' : 'w-1/6';
            return `<div class="${SKELETON_CLASS} h-5 ${w}"></div>`;
          })
          .join('');
        return `<div class="flex gap-3 items-center">${cells}</div>`;
      })
      .join('');
    this.shadowRoot!.innerHTML =
      '<style>:host{display:block}</style>' +
      `<div class="space-y-3 ${this.getAttribute('class') ?? ''}">${html}</div>`;
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() {
    this._render();
  }
}

if (!customElements.get('alu-skeleton-table')) {
  customElements.define('alu-skeleton-table', AluSkeletonTable);
}

export { AluTable };
