import { cn } from '../../internal/cn';
import { buttonVariants } from '../../internal/variants/button';
import { AluPaginationLink } from './pagination-link';

// 分页 prev/next（与 Svelte 包 pagination-previous/next.svelte 对齐，lucide 箭头图标内联）
function chevronSvg(direction: 'left' | 'right'): string {
  const d = direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="${d}"/></svg>`;
}

export class AluPaginationPrevious extends HTMLElement {
  static observedAttributes = ['class'];

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<style>:host{display:inline-block}</style>' +
      `<alu-pagination-link aria-label="Go to previous page" size="default" class="${cn('pl-1.5!', this.getAttribute('class') ?? '')}">${chevronSvg('left')}<span class="cn-pagination-previous-text hidden sm:block">Previous</span></alu-pagination-link>`;
    const link = shadow.querySelector('alu-pagination-link')!;
    link.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('previous', { bubbles: true, composed: true }));
    });
    forwardHost(this, link);
  }
}

export class AluPaginationNext extends HTMLElement {
  static observedAttributes = ['class'];

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<style>:host{display:inline-block}</style>' +
      `<alu-pagination-link aria-label="Go to next page" size="default" class="${cn('pr-1.5!', this.getAttribute('class') ?? '')}"><span class="cn-pagination-next-text hidden sm:block">Next</span>${chevronSvg('right')}</alu-pagination-link>`;
    const link = shadow.querySelector('alu-pagination-link')!;
    link.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('next', { bubbles: true, composed: true }));
    });
    forwardHost(this, link);
  }
}

// 简单事件转发：把子组件 click 转发到宿主
function forwardHost(host: HTMLElement, source: Element) {
  source.addEventListener('click', (e) => {
    host.dispatchEvent(new CustomEvent('click', { detail: e, bubbles: true, composed: true }));
  });
}

if (!customElements.get('alu-pagination-previous')) {
  customElements.define('alu-pagination-previous', AluPaginationPrevious);
}
if (!customElements.get('alu-pagination-next')) {
  customElements.define('alu-pagination-next', AluPaginationNext);
}

export { buttonVariants };
