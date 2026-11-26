import { cn } from '../../internal/cn';

// 骨架卡片（与 Svelte 包 skeleton-card.svelte 对齐；内部用 alu-skeleton）
export class AluSkeletonCard extends HTMLElement {
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<style>:host{display:block}</style>' +
      `<div class="border border-border rounded-xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <alu-skeleton class="h-4 w-24"></alu-skeleton>
          <alu-skeleton class="h-8 w-8 rounded-xl"></alu-skeleton>
        </div>
        <alu-skeleton class="h-8 w-16"></alu-skeleton>
        <alu-skeleton class="h-3 w-32"></alu-skeleton>
      </div>`;
  }
}

if (!customElements.get('alu-skeleton-card')) {
  customElements.define('alu-skeleton-card', AluSkeletonCard);
}

export { cn };
