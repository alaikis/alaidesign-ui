import { cn } from '../../internal/cn';

// 表格子组件（与 Svelte 包 table/ 各子组件类名一致）
export const TABLE_HEAD_CLASS =
  'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0';
export const TABLE_CELL_CLASS =
  'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0';

function defineSlot(tag: string, innerTag: string, cls: string, extraHostStyle = '') {
  class C extends HTMLElement {
    connectedCallback() {
      const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
      shadow.innerHTML =
        `<style>:host{display:${extraHostStyle || 'inline-block'}}</style>` +
        `<${innerTag} data-slot="${tag.replace(/^alu-/, '')}" class="${cls}"><slot></slot></${innerTag}>`;
    }
  }
  if (!customElements.get(tag)) customElements.define(tag, C);
}

defineSlot('alu-table-header', 'thead', '[&_tr]:border-b', 'table-header-group');
defineSlot('alu-table-body', 'tbody', '[&_tr:last-child]:border-0', 'table-row-group');
defineSlot('alu-table-row', 'tr', 'border-b border-border/50 cursor-pointer hover:bg-info/10 hover:shadow-sm transition-colors duration-150', 'table-row');
defineSlot('alu-table-head', 'th', TABLE_HEAD_CLASS, 'table-cell');
defineSlot('alu-table-cell', 'td', TABLE_CELL_CLASS, 'table-cell');

/**
 * <alu-table> — 表格容器（对应 Svelte Table），含横向滚动容器。
 */
export class AluTable extends HTMLElement {
  static observedAttributes = ['class'];
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const cls = cn('w-full caption-bottom text-sm', this.getAttribute('class') ?? '');
    shadow.innerHTML =
      '<style>:host{display:block}</style>' +
      '<div data-slot="table-container" class="relative w-full overflow-x-auto overflow-y-visible">' +
      `<table data-slot="table" class="${cls}"><slot></slot></table></div>`;
  }
}

if (!customElements.get('alu-table')) customElements.define('alu-table', AluTable);
