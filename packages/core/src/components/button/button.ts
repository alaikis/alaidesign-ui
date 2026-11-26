import { cn } from '../../internal/cn';
import { buttonVariants, type ButtonSize, type ButtonVariant } from '../../internal/variants/button';

/**
 * <alu-button> — 与 Svelte 包 Button（src/lib/components/ui/button/button.svelte）对齐。
 * shadow DOM + :host token 透传（--primary 等 CSS 变量由宿主页面注入）。
 */
export class AluButton extends HTMLElement {
  static observedAttributes = ['variant', 'size', 'href', 'disabled'];

  private _shadow!: ShadowRoot;
  private _hostEl!: HTMLElement;
  private _interactive: HTMLElement | null = null;

  get variant(): ButtonVariant {
    return (this.getAttribute('variant') as ButtonVariant) ?? 'default';
  }
  get size(): ButtonSize {
    return (this.getAttribute('size') as ButtonSize) ?? 'default';
  }
  get href(): string | undefined {
    return this.getAttribute('href') ?? undefined;
  }
  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  connectedCallback() {
    this._shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const host = document.createElement('div');
    host.className = 'alu-host';
    this._shadow.appendChild(host);
    this._hostEl = host;
    this._render();
  }

  attributeChangedCallback() {
    if (this._hostEl) this._render();
  }

  private _classes(): string {
    return cn(buttonVariants({ variant: this.variant, size: this.size }), this.getAttribute('class') ?? '');
  }

  private _render() {
    if (!this._hostEl) return;
    const cls = this._classes();
    if (this.href) {
      const a = document.createElement('a');
      a.setAttribute('data-slot', 'button');
      a.className = cls;
      a.setAttribute('href', this.href);
      if (this.disabled) {
        a.setAttribute('aria-disabled', 'true');
        a.setAttribute('tabindex', '-1');
      }
      a.innerHTML = '<slot></slot>';
      this._hostEl.innerHTML = '';
      this._hostEl.appendChild(a);
      this._interactive = a;
    } else {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-slot', 'button');
      b.className = cls;
      if (this.disabled) b.disabled = true;
      b.innerHTML = '<slot></slot>';
      this._hostEl.innerHTML = '';
      this._hostEl.appendChild(b);
      this._interactive = b;
    }
  }
}

if (!customElements.get('alu-button')) {
  customElements.define('alu-button', AluButton);
}

export { buttonVariants };
export type { ButtonSize, ButtonVariant };
