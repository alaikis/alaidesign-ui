import { cn } from '../../internal/cn';
import { icon } from '../icon';
// 面包屑（与 Svelte 包 breadcrumb/ 对齐）
export class AluBreadcrumb extends HTMLElement {
  static observedAttributes = ['class'];

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<style>:host{display:flex}</style>' +
      `<nav data-slot="breadcrumb" class="${cn('flex', this.getAttribute('class') ?? '')}"><slot></slot></nav>`;
  }
}

export class AluBreadcrumbItem extends HTMLElement {
  static observedAttributes = ['href', 'class'];

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() {
    this._render();
  }

  private _render() {
    const shadow = this.shadowRoot!;
    const href = this.getAttribute('href');
    const cls = this.getAttribute('class') ?? '';
    if (href) {
      shadow.innerHTML =
        `<style>:host{display:inline-block}</style>` +
        `<a href="${href}" data-slot="breadcrumb-item" class="${cn('text-muted-foreground hover:text-foreground transition-colors', cls)}"><slot></slot></a>`;
    } else {
      shadow.innerHTML =
        `<style>:host{display:inline-block}</style>` +
        `<span data-slot="breadcrumb-item" role="link" aria-current="page" class="${cn('text-foreground font-medium', cls)}"><slot></slot></span>`;
    }
  }
}

export class AluBreadcrumbSeparator extends HTMLElement {
  static observedAttributes = ['separator', 'class'];

  get separator(): string {
    return this.getAttribute('separator') ?? 'chevron-right';
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
    const svg = icon(this.separator, 16, 'h-4 w-4');
    shadow.innerHTML =
      `<style>:host{display:inline-block}</style>` +
      `<li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" class="${cn('text-muted-foreground', this.getAttribute('class') ?? '')}"></li>`;
    const li = shadow.querySelector('li')!;
    li.appendChild(svg);
  }
}

if (!customElements.get('alu-breadcrumb')) customElements.define('alu-breadcrumb', AluBreadcrumb);
if (!customElements.get('alu-breadcrumb-item')) customElements.define('alu-breadcrumb-item', AluBreadcrumbItem);
if (!customElements.get('alu-breadcrumb-separator')) customElements.define('alu-breadcrumb-separator', AluBreadcrumbSeparator);
