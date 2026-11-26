import { cn } from '../../internal/cn';
import { buttonVariants } from '../../internal/variants/button';

// 下拉菜单（与 Svelte 包 dropdown-menu/ 对齐，bits-ui DropdownMenu 降级为 click 切换 + outside-click 关闭）
const DM_CONTENT_CLASS =
  'bg-popover text-popover-foreground min-w-32 rounded-lg p-1 shadow-md ring-1 duration-100 z-50 overflow-x-hidden overflow-y-auto outline-none';
const DM_ITEM_CLASS =
  'focus:bg-accent focus:text-accent-foreground gap-1.5 rounded-md px-1.5 py-1 text-sm not-data-[variant=destructive]:focus:**:text-accent-foreground relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0';

export class AluDropdownMenu extends HTMLElement {
  static observedAttributes = ['open'];

  get open(): boolean {
    return this.hasAttribute('open');
  }

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<slot></slot>';
    // trigger 点击 → 切换；outside click → 关闭
    this.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest?.('alu-dropdown-menu-trigger')) {
        this._toggle();
      }
    });
    document.addEventListener('click', this._onDocClick, true);
    document.addEventListener('keydown', this._onKey);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick, true);
    document.removeEventListener('keydown', this._onKey);
  }

  private _onDocClick = (e: Event) => {
    if (this.open && !this.contains(e.target as Node)) this._close();
  };
  private _onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) this._close();
  };

  private _toggle() {
    this.open ? this._close() : this._open();
  }

  private _open() {
    this.setAttribute('open', '');
    this.dispatchEvent(new CustomEvent('open', { bubbles: true, composed: true }));
  }
  private _close() {
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  set open(v: boolean) {
    v ? this.setAttribute('open', '') : this.removeAttribute('open');
  }

  closeMenu() {
    this._close();
  }
}

export class AluDropdownMenuTrigger extends HTMLElement {
  static observedAttributes = ['class'];
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const cls = cn(buttonVariants({ variant: 'default', size: 'default' }), this.getAttribute('class') ?? '');
    shadow.innerHTML =
      '<style>:host{display:inline-block}</style>' +
      `<button type="button" data-slot="dropdown-menu-trigger" aria-haspopup="true" class="${cls}"><slot></slot></button>`;
    shadow.querySelector('button')!.addEventListener('click', () => {
      const menu = this.closest('alu-dropdown-menu') as InstanceType<typeof AluDropdownMenu> | null;
      if (!menu) return;
      menu.open = !menu.open;
    });
  }
}

export class AluDropdownMenuContent extends HTMLElement {
  static observedAttributes = ['class'];
  private _portal!: HTMLElement;

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<style>:host{display:none}</style>' +
      `<div data-slot="dropdown-menu-content" role="menu" class="${cn(DM_CONTENT_CLASS, this.getAttribute('class') ?? '')}"><slot></slot></div>`;
    this._portal = document.createElement('div');
    this._portal.setAttribute('data-ala-dm-portal', 'content');
    this._portal.appendChild(shadow.host);
    document.body.appendChild(this._portal);

    // 跟随菜单开关
    document.addEventListener('open', this._onMenuOpen, true);
    document.addEventListener('close', this._onMenuClose, true);
  }

  private _onMenuOpen = (e: Event) => {
    if ((e.target as HTMLElement).closest?.('alu-dropdown-menu')?.contains(this)) this._setVisible(true);
  };
  private _onMenuClose = (e: Event) => {
    if ((e.target as HTMLElement).closest?.('alu-dropdown-menu')?.contains(this)) this._setVisible(false);
  };

  _setVisible(v: boolean) {
    (this.shadowRoot!.querySelector('[data-slot="dropdown-menu-content"]') as HTMLElement).style.display = v ? 'block' : 'none';
  }

  disconnectedCallback() {
    this._portal?.remove();
    document.removeEventListener('open', this._onMenuOpen, true);
    document.removeEventListener('close', this._onMenuClose, true);
  }
}

// 下拉菜单子元素（item/label/separator/group/group-heading/checkbox-item/radio-item/shortcut/sub/sub-trigger/sub-content）
const DM_SUBS: Array<[string, string, string]> = [
  ['alu-dropdown-menu-label', 'div', 'px-1.5 py-1 text-sm font-semibold'],
  ['alu-dropdown-menu-separator', 'div', 'pointer-events-none -mx-1 my-1 h-px bg-border'],
  ['alu-dropdown-menu-group', 'div', 'relative'],
  ['alu-dropdown-menu-group-heading', 'div', 'select-none pointer-events-none px-1.5 py-1 text-sm font-semibold text-muted-foreground'],
  ['alu-dropdown-menu-shortcut', 'span', 'text-muted-foreground/70 ml-auto text-xs tracking-widest'],
  ['alu-dropdown-menu-sub', 'div', 'relative'],
  ['alu-dropdown-menu-sub-trigger', 'div', 'flex cursor-default select-none items-center rounded-md px-1.5 py-1 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0'],
];

for (const [tag, html, cls] of DM_SUBS) {
  class Sub extends HTMLElement {
    connectedCallback() {
      const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
      shadow.innerHTML = `<style>:host{display:${tag === 'alu-dropdown-menu-separator' ? 'block' : 'block'}}</style><${html} data-slot="${tag.replace('alu-dropdown-menu-', '')}" class="${cls}"><slot></slot></${html}>`;
    }
  }
  if (!customElements.get(tag)) customElements.define(tag, Sub);
}

// item（带 variant=inset 属性）
class AluDropdownMenuItem extends HTMLElement {
  static observedAttributes = ['variant', 'inset', 'disabled', 'class'];
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    this._render();
    // 点击 → 关闭菜单
    this.addEventListener('click', () => {
      const menu = this.closest('alu-dropdown-menu') as InstanceType<typeof AluDropdownMenu> | null;
      if (menu && !this.hasAttribute('disabled')) menu.closeMenu();
      this.dispatchEvent(
        new CustomEvent('select', { detail: { value: this.getAttribute('value') ?? '' }, bubbles: true, composed: true }),
      );
    });
  }
  attributeChangedCallback() {
    this._render();
  }
  private _render() {
    const shadow = this.shadowRoot!;
    const variant = this.getAttribute('variant') ?? 'default';
    const inset = this.hasAttribute('inset');
    const cls = cn(DM_ITEM_CLASS, variant === 'destructive' ? 'text-destructive data-[variant=destructive]:focus:bg-destructive/10' : '', inset ? 'pl-7' : '', this.getAttribute('class') ?? '');
    shadow.innerHTML =
      `<style>:host{display:block}</style>` +
      `<div role="menuitem" data-slot="dropdown-menu-item" data-variant="${variant}"${inset ? ' data-inset' : ''}${this.hasAttribute('disabled') ? ' data-disabled' : ''} tabindex="0" class="${cls}"><slot></slot></div>`;
  }
}
if (!customElements.get('alu-dropdown-menu-item')) customElements.define('alu-dropdown-menu-item', AluDropdownMenuItem);

// checkbox-item / radio-item / sub-content（简化）
const DM_ITEM_SUBS: Array<[string, string]> = [
  ['alu-dropdown-menu-checkbox-item', 'alu-dropdown-menu-item'],
  ['alu-dropdown-menu-radio-item', 'alu-dropdown-menu-item'],
];
for (const [tag] of DM_ITEM_SUBS) {
  class C extends AluDropdownMenuItem {}
  if (!customElements.get(tag)) customElements.define(tag, C);
}

class AluDropdownMenuSubContent extends HTMLElement {
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      `<style>:host{display:none}</style>` +
      `<div data-slot="dropdown-menu-sub-content" role="menu" class="${DM_CONTENT_CLASS}"><slot></slot></div>`;
  }
}
if (!customElements.get('alu-dropdown-menu-sub-content')) customElements.define('alu-dropdown-menu-sub-content', AluDropdownMenuSubContent);

if (!customElements.get('alu-dropdown-menu')) customElements.define('alu-dropdown-menu', AluDropdownMenu);
if (!customElements.get('alu-dropdown-menu-trigger')) customElements.define('alu-dropdown-menu-trigger', AluDropdownMenuTrigger);
if (!customElements.get('alu-dropdown-menu-content')) customElements.define('alu-dropdown-menu-content', AluDropdownMenuContent);
