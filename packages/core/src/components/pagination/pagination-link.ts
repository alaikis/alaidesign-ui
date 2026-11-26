import { cn } from '../../internal/cn';
import { buttonVariants } from '../../internal/variants/button';
import { forwardEvent } from '../../internal/base';
import { AluButton } from '../button/button';

// 分页链接（与 Svelte 包 pagination-link.svelte 对齐，bits-ui Page 降级为原生 button）
const PAGER_LINK_CLASS = 'cn-pagination-link';

export class AluPaginationLink extends HTMLElement {
  static observedAttributes = ['page', 'is-active', 'size', 'class', 'disabled'];

  get page(): string {
    return this.getAttribute('page') ?? '';
  }
  get isActive(): boolean {
    return this.hasAttribute('is-active');
  }

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() {
    this._render();
  }

  private _render() {
    const shadow = this.shadowRoot!;
    const size = this.getAttribute('size') ?? 'icon';
    const variant = this.isActive ? 'outline' : 'ghost';
    const cls = cn(buttonVariants({ variant: variant as 'outline' | 'ghost', size: size as 'icon' }), PAGER_LINK_CLASS, this.getAttribute('class') ?? '');
    const disabled = this.hasAttribute('disabled');
    shadow.innerHTML =
      '<style>:host{display:inline-block}</style>' +
      `<button type="button" role="button" data-slot="pagination-link" data-active="${this.isActive}" ${disabled ? 'disabled' : ''} class="${cls}"><slot></slot></button>`;
    forwardEvent(this, shadow.querySelector('button')!, 'click');
  }
}

if (!customElements.get('alu-pagination-link')) {
  customElements.define('alu-pagination-link', AluPaginationLink);
}

export { AluButton };
