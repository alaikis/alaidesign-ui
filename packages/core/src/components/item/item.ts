import { cn } from '../../internal/cn';

// 列表项子组件（与 Svelte 包 item/ 各子组件类名一致）
const ITEM_SUBS: Array<{ tag: string; html: string; cls: string; hostDisplay: string }> = [
  { tag: 'alu-item-header', html: 'div', cls: 'flex basis-full items-center justify-between gap-2', hostDisplay: 'block' },
  { tag: 'alu-item-content', html: 'div', cls: 'flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none', hostDisplay: 'block' },
  { tag: 'alu-item-description', html: 'p', cls: 'text-muted-foreground line-clamp-2 text-balance text-sm font-normal leading-normal [&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4', hostDisplay: 'block' },
  { tag: 'alu-item-footer', html: 'div', cls: 'flex basis-full items-center justify-between gap-2', hostDisplay: 'block' },
  { tag: 'alu-item-title', html: 'div', cls: 'flex w-fit items-center gap-2 text-sm font-medium leading-snug', hostDisplay: 'block' },
  { tag: 'alu-item-actions', html: 'div', cls: 'flex items-center gap-2', hostDisplay: 'block' },
];

for (const sub of ITEM_SUBS) {
  const { tag, html, cls, hostDisplay } = sub;
  class C extends HTMLElement {
    connectedCallback() {
      const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
      shadow.innerHTML =
        `<style>:host{display:${hostDisplay}}</style>` +
        `<${html} data-slot="${tag.replace('alu-item-', '')}" class="${cls}"><slot></slot></${html}>`;
    }
  }
  if (!customElements.get(tag)) customElements.define(tag, C);
}

// item-media（带 variant）
const MEDIA_VARIANTS: Record<string, string> = {
  default: 'bg-transparent',
  icon: 'bg-muted size-8 rounded-sm border [&_svg:not([class*=\'size-\'])]:size-4',
  image: 'size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover',
};

class AluItemMedia extends HTMLElement {
  static observedAttributes = ['variant', 'class'];
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const variant = this.getAttribute('variant') ?? 'default';
    const cls = cn(
      'flex shrink-0 items-center justify-center gap-2 [&_svg]:pointer-events-none',
      MEDIA_VARIANTS[variant] ?? MEDIA_VARIANTS.default,
      this.getAttribute('class') ?? '',
    );
    shadow.innerHTML =
      `<style>:host{display:inline-block}</style>` +
      `<div data-slot="item-media" data-variant="${variant}" class="${cls}"><slot></slot></div>`;
  }
}
if (!customElements.get('alu-item-media')) customElements.define('alu-item-media', AluItemMedia);

export { ITEM_SUBS };
