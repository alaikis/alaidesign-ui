// 骨架屏占位（对应 Svelte Skeleton；固定类名，无 variants）
import { cn } from '../../internal/cn';

const SKELETON_CLASS = 'animate-pulse rounded-md bg-muted';

export class AluSkeleton extends HTMLElement {
  static observedAttributes = ['class'];
  private _hostEl!: HTMLElement;

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const div = document.createElement('div');
    div.className = cn(SKELETON_CLASS, this.getAttribute('class') ?? '');
    div.setAttribute('data-slot', 'skeleton');
    shadow.appendChild(div);
    this._hostEl = div;
  }

  attributeChangedCallback() {
    if (this._hostEl) this._hostEl.className = cn(SKELETON_CLASS, this.getAttribute('class') ?? '');
  }
}

if (!customElements.get('alu-skeleton')) {
  customElements.define('alu-skeleton', AluSkeleton);
}
