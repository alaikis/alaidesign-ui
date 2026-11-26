import { cn } from '../../internal/cn';

// 卡片子组件（与 Svelte 包 card/ 各子组件类名一致）
const CARD_SUBS: Array<{ tag: string; html: string; cls: string }> = [
  { tag: 'alu-card-header', html: 'div', cls: 'flex flex-col space-y-1.5 p-6' },
  { tag: 'alu-card-title', html: 'h3', cls: 'text-base font-semibold leading-none tracking-tight' },
  { tag: 'alu-card-content', html: 'div', cls: 'p-6 pt-0' },
  { tag: 'alu-card-description', html: 'p', cls: 'text-sm text-muted-foreground' },
  { tag: 'alu-card-footer', html: 'div', cls: 'flex items-center p-6 pt-0' },
];

function defineSlotElement(tag: string, innerTag: string, cls: string, extraHostStyle = '') {
  class CardSub extends HTMLElement {
    connectedCallback() {
      const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
      shadow.innerHTML = `<style>:host{display:${extraHostStyle || 'inline-block'}}</style>` +
        `<${innerTag} data-slot="${tag.replace('alu-card-', '')}" class="${cls}"><slot></slot></${innerTag}>`;
    }
  }
  if (!customElements.get(tag)) customElements.define(tag, CardSub);
}

for (const sub of CARD_SUBS) {
  defineSlotElement(sub.tag, sub.html, sub.cls);
}

/**
 * <alu-card> — 卡片容器（对应 Svelte Card）。
 */
export class AluCard extends HTMLElement {
  static observedAttributes = ['class'];

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const cls = cn('rounded-lg border border-border bg-card text-card-foreground', this.getAttribute('class') ?? '');
    shadow.innerHTML = `<style>:host{display:block}</style>` +
      `<div data-slot="card" class="${cls}"><slot></slot></div>`;
  }
}

if (!customElements.get('alu-card')) {
  customElements.define('alu-card', AluCard);
}

export { CARD_SUBS };
