import { cn } from '../../internal/cn';
import { forwardEvent } from '../../internal/base';

// 与 Svelte 包 tooltip-content.svelte 对齐（气泡类名同源；浮层定位用 fixed + getBoundingClientRect）
const CONTENT_CLASS =
  'bg-primary text-primary-foreground z-50 w-fit text-balance rounded-md px-3 py-1.5 text-xs';

/**
 * <alu-tooltip content="提示文字" side="top"> 默认插槽内容（宿主） </alu-tooltip>
 * 行为：hover/focus 默认插槽内容时，在 content 属性指定的位置渲染浮层；
 * 移出/失焦后 100ms 后隐藏。事件：show / hide。
 */
export class AluTooltip extends HTMLElement {
  static observedAttributes = ['content', 'side', 'side-offset'];

  private _layer: HTMLDivElement | null = null;
  private _timer: number | null = null;
  private _visible = false;

  get content(): string {
    return this.getAttribute('content') ?? '';
  }
  get side(): string {
    return this.getAttribute('side') ?? 'top';
  }

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<style>:host{display:inline-block;position:relative}</style><slot></slot>';
    const slot = shadow.querySelector('slot')!;
    slot.addEventListener('mouseover', () => this._show());
    slot.addEventListener('focusin', () => this._show());
    slot.addEventListener('mouseout', () => this._hide());
    slot.addEventListener('focusout', () => this._hide());
  }

  attributeChangedCallback() {
    if (this._visible) this._position();
  }

  private _show() {
    if (!this.content) return;
    if (this._timer) window.clearTimeout(this._timer);
    if (!this._layer) {
      this._layer = document.createElement('div');
      this._layer.setAttribute('role', 'tooltip');
      this._layer.setAttribute('data-slot', 'tooltip-content');
      this._layer.className = cn(CONTENT_CLASS, this.getAttribute('class') ?? '');
      document.body.appendChild(this._layer);
    }
    this._layer.textContent = this.content;
    this._layer.style.display = 'block';
    this._visible = true;
    this._position();
    this.dispatchEvent(new CustomEvent('show', { bubbles: true, composed: true }));
  }

  private _hide() {
    if (this._timer) window.clearTimeout(this._timer);
    this._timer = window.setTimeout(() => {
      if (this._layer && this._visible) {
        this._layer.style.display = 'none';
        this._visible = false;
        this.dispatchEvent(new CustomEvent('hide', { bubbles: true, composed: true }));
      }
    }, 100);
  }

  private _position() {
    if (!this._layer) return;
    const rect = this.getBoundingClientRect();
    const off = Number(this.getAttribute('side-offset')) || 0;
    const w = this._layer.offsetWidth || 80;
    const h = this._layer.offsetHeight || 24;
    let top = 0;
    let left = 0;
    switch (this.side) {
      case 'bottom':
        top = rect.bottom + off;
        left = rect.left + rect.width / 2 - w / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - h / 2;
        left = rect.left - w - off;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - h / 2;
        left = rect.right + off;
        break;
      default: // top
        top = rect.top - h - off;
        left = rect.left + rect.width / 2 - w / 2;
    }
    this._layer.style.position = 'fixed';
    this._layer.style.top = `${top}px`;
    this._layer.style.left = `${left}px`;
  }

  disconnectedCallback() {
    this._layer?.remove();
    this._layer = null;
  }
}

if (!customElements.get('alu-tooltip')) {
  customElements.define('alu-tooltip', AluTooltip);
}

export { forwardEvent as _forwardEvent };
