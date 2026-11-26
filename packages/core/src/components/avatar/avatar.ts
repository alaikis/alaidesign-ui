import { cn } from '../../internal/cn';

// 头像组（与 Svelte 包 avatar/ 对齐；bits-ui Avatar Root/Image/Fallback 降级）
const AVATAR_SIZES: Record<string, string> = {
  default: 'size-8',
  sm: 'data-[size=sm]:size-6',
  lg: 'data-[size=lg]:size-10',
};

const AVATAR_BASE =
  'rounded-full after:rounded-full group/avatar relative flex shrink-0 select-none after:absolute after:inset-0 after:border after:mix-blend-darken dark:after:mix-blend-lighten';

export class AluAvatar extends HTMLElement {
  static observedAttributes = ['size', 'class'];

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const size = this.getAttribute('size') ?? 'default';
    shadow.innerHTML =
      '<style>:host{display:inline-block}</style>' +
      `<div data-slot="avatar" data-size="${size}" class="${cn(AVATAR_BASE, AVATAR_SIZES[size] ?? '', this.getAttribute('class') ?? '')}"><slot></slot></div>`;
  }
}

export class AluAvatarImage extends HTMLElement {
  static observedAttributes = ['src', 'alt', 'class'];

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<style>:host{display:block}</style>' +
      `<img data-slot="avatar-image" src="${this.getAttribute('src') ?? ''}" alt="${this.getAttribute('alt') ?? ''}" class="${cn('rounded-full aspect-square size-full object-cover', this.getAttribute('class') ?? '')}" onerror="this.style.display='none'" onload="this.style.display=''"/>`;
  }

  attributeChangedCallback() {
    const img = this.shadowRoot!.querySelector('img')!;
    img.src = this.getAttribute('src') ?? '';
    img.alt = this.getAttribute('alt') ?? '';
  }
}

export class AluAvatarFallback extends HTMLElement {
  static observedAttributes = ['class'];

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<style>:host{display:block}</style>' +
      `<div data-slot="avatar-fallback" class="${cn('flex size-full items-center justify-center rounded-full bg-muted text-primary-foreground text-sm', this.getAttribute('class') ?? '')}"><slot></slot></div>`;
  }
}

export class AluAvatarGroup extends HTMLElement {
  static observedAttributes = ['class'];

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<style>:host{display:inline-flex}</style>' +
      `<div data-slot="avatar-group" class="cn-avatar-group flex -space-x-2 ${this.getAttribute('class') ?? ''}"><slot></slot></div>`;
  }
}

if (!customElements.get('alu-avatar')) customElements.define('alu-avatar', AluAvatar);
if (!customElements.get('alu-avatar-image')) customElements.define('alu-avatar-image', AluAvatarImage);
if (!customElements.get('alu-avatar-fallback')) customElements.define('alu-avatar-fallback', AluAvatarFallback);
if (!customElements.get('alu-avatar-group')) customElements.define('alu-avatar-group', AluAvatarGroup);
