import { cn } from '../../internal/cn';

// 与 Svelte 包 badge.svelte 对齐（variant 类名表同源）
const BADGE_VARIANTS: Record<string, string> = {
  default: 'bg-primary text-primary-foreground border-primary',
  secondary: 'bg-secondary text-secondary-foreground border-secondary',
  destructive: 'bg-destructive text-destructive-foreground border-destructive',
  outline: 'bg-background text-foreground border-input',
  success: 'bg-success text-success-foreground border-success',
  warning: 'bg-warning text-warning-foreground border-warning',
};

const BADGE_BASE =
  'inline-flex items-center rounded-[4px] border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

/**
 * <alu-badge> — 徽章（对应 Svelte Badge），属性 variant。
 */
export class AluBadge extends HTMLElement {
  static observedAttributes = ['variant', 'class'];

  private _span!: HTMLSpanElement;

  get variant(): string {
    return this.getAttribute('variant') ?? 'default';
  }

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    this._span = document.createElement('span');
    this._span.setAttribute('role', 'status');
    this._span.setAttribute('data-slot', 'badge');
    this._span.innerHTML = '<slot></slot>';
    shadow.appendChild(this._span);
    this._render();
  }

  attributeChangedCallback() {
    this._render();
  }

  private _render() {
    if (!this._span) return;
    this._span.className = cn(BADGE_BASE, BADGE_VARIANTS[this.variant] ?? BADGE_VARIANTS.default, this.getAttribute('class') ?? '');
  }
}

if (!customElements.get('alu-badge')) {
  customElements.define('alu-badge', AluBadge);
}
