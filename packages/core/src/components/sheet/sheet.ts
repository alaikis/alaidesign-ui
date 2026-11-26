import { cn } from '../../internal/cn';
import { tv } from 'tailwind-variants';
import { buttonVariants } from '../../internal/variants/button';
import { AluDialogContent } from '../dialog/dialog';

// 侧边抽屉（与 Svelte 包 sheet/ 对齐，bits-ui Dialog(side) 降级）
export const sheetVariants = tv({
  base: 'bg-background-secondary fixed z-50 flex flex-col gap-4 shadow transition ease-in-out p-6',
  variants: {
    side: {
      top: 'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b',
      bottom: 'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t',
      left: 'data-[state=closed]:slide-out-to-start data-[state=open]:slide-in-from-start inset-y-0 start-0 h-full w-3/4 border-e sm:max-w-sm',
      right: 'data-[state=closed]:slide-out-to-end data-[state=open]:slide-in-from-end inset-y-0 end-0 h-full w-3/4 border-s sm:max-w-sm',
    },
  },
  defaultVariants: { side: 'right' },
});

type Side = 'top' | 'bottom' | 'left' | 'right';

export class AluSheet extends HTMLElement {
  static observedAttributes = ['open', 'side'];

  private _overlay: HTMLDivElement | null = null;
  private _prevOverflow = '';
  get open(): boolean {
    return this.getAttribute('open') !== 'false';
  }
  get side(): Side {
    return (this.getAttribute('side') as Side) ?? 'right';
  }

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<slot></slot>';
    document.addEventListener('keydown', this._onKeydown);
    if (this.open) this._apply(true);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeydown);
    this._apply(false);
    this._overlay?.remove();
    this._overlay = null;
  }

  private _onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) this._apply(false);
  };

  attributeChangedCallback(name: string) {
    if (name !== 'open') return;
    this._apply(this.open);
  }

  private _apply(open: boolean) {
    if (open) {
      this._prevOverflow = document.querySelector<HTMLElement>('main')?.style.overflow ?? '';
      document.body.classList.add('overflow-hidden');
      const main = document.querySelector<HTMLElement>('main');
      if (main) main.style.overflow = 'hidden';
      this._ensureOverlay();
      this._overlay!.style.display = 'block';
      this.setAttribute('open', 'true');
      this._syncContents(true);
    } else {
      document.body.classList.remove('overflow-hidden');
      const main = document.querySelector<HTMLElement>('main');
      if (main) main.style.overflow = this._prevOverflow;
      if (this._overlay) this._overlay.style.display = 'none';
      this.setAttribute('open', 'false');
      this._syncContents(false);
    }
    this.dispatchEvent(
      new CustomEvent(open ? 'open' : 'close', { detail: { open }, bubbles: true, composed: true }),
    );
  }

  private _ensureOverlay() {
    if (this._overlay) return;
    this._overlay = document.createElement('div');
    this._overlay.setAttribute('data-slot', 'sheet-overlay');
    this._overlay.className = cn('fixed inset-0 z-50 bg-black/80', this.getAttribute('class') ?? '');
    this._overlay.addEventListener('click', () => this._apply(false));
    document.body.appendChild(this._overlay);
  }

  private _syncContents(open: boolean) {
    this.querySelectorAll<InstanceType<typeof AluSheetContent>>('alu-sheet-content').forEach((c) =>
      c._setVisible(open),
    );
  }
}

export class AluSheetContent extends HTMLElement {
  static observedAttributes = ['side', 'class'];
  get side(): Side {
    return (this.getAttribute('side') as Side) ?? 'right';
  }
  private _portal!: HTMLElement;

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const side = this.side;
    const cls = cn(sheetVariants({ side: side as 'right' }), this.getAttribute('class') ?? '');
    shadow.innerHTML =
      '<style>:host{display:none}</style>' +
      `<div data-slot="sheet-content" role="dialog" aria-modal="true" data-state="${side}" class="${cls}"><slot></slot>` +
      `<button type="button" aria-label="Close" data-slot="sheet-close" class="ring-offset-background absolute end-4 top-4 opacity-70 transition-opacity hover:opacity-100"></button></div>`;
    const close = shadow.querySelector('[data-slot="sheet-close"]') as HTMLElement;
    close.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '16'); svg.setAttribute('height', '16'); svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2');
    svg.setAttribute('class', 'size-4');
    svg.innerHTML = '<path d="M18 6 6 18"/><path d="M6 6l12 12"/>';
    close.appendChild(svg);
    const sr = document.createElement('span');
    sr.className = 'sr-only'; sr.textContent = 'Close';
    close.appendChild(sr);
    close.addEventListener('click', () => {
      const sheet = this.closest('alu-sheet');
      sheet?.setAttribute('open', 'false');
    });
    this._portal = document.createElement('div');
    this._portal.setAttribute('data-ala-sheet-portal', 'content');
    this._portal.appendChild(shadow.host);
    document.body.appendChild(this._portal);
  }

  _setVisible(visible: boolean) {
    (this.shadowRoot!.querySelector('[data-slot="sheet-content"]') as HTMLElement).style.display = visible ? 'block' : 'none';
  }

  disconnectedCallback() {
    this._portal?.remove();
  }
}

export class AluSheetTrigger extends HTMLElement {
  static observedAttributes = ['class'];
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const cls = cn(buttonVariants({ variant: 'default', size: 'default' }), this.getAttribute('class') ?? '');
    shadow.innerHTML =
      '<style>:host{display:inline-block}</style>' +
      `<button type="button" data-slot="sheet-trigger" class="${cls}"><slot></slot></button>`;
    shadow.querySelector('button')!.addEventListener('click', () => {
      const sheet = this.closest('alu-sheet');
      sheet?.setAttribute('open', 'true');
    });
  }
}

// sheet 子元素（header/title/description/footer/close/overlay/portal）
const SHEET_SUBS: Array<[string, string, string]> = [
  ['alu-sheet-header', 'div', 'flex flex-col gap-1.5 p-4'],
  ['alu-sheet-title', 'h2', 'text-foreground font-semibold'],
  ['alu-sheet-description', 'p', 'text-muted-foreground text-sm'],
  ['alu-sheet-footer', 'div', 'mt-auto flex flex-col gap-2 p-4'],
];
for (const [tag, html, cls] of SHEET_SUBS) {
  class Sub extends HTMLElement {
    connectedCallback() {
      const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
      shadow.innerHTML = `<style>:host{display:${tag === 'alu-sheet-title' ? 'block' : 'block'}}</style><${html} data-slot="${tag.replace('alu-sheet-', '')}" class="${cls}"><slot></slot></${html}>`;
    }
  }
  if (!customElements.get(tag)) customElements.define(tag, Sub);
}

if (!customElements.get('alu-sheet')) customElements.define('alu-sheet', AluSheet);
if (!customElements.get('alu-sheet-content')) customElements.define('alu-sheet-content', AluSheetContent);
if (!customElements.get('alu-sheet-trigger')) customElements.define('alu-sheet-trigger', AluSheetTrigger);
