import { cn } from '../../internal/cn';
import { buttonVariants } from '../../internal/variants/button';
import { forwardEvent } from '../../internal/base';

// 与 Svelte 包 dialog.svelte + dialog-content.svelte + dialog-trigger.svelte 对齐
// （bits-ui Dialog 降级：open 属性 + Escape + 遮罩点击关闭 + body 滚动锁 + portal）
const CONTENT_CLASS =
  'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card p-6 shadow duration-200 sm:rounded-lg';
const CLOSE_CLASS =
  'ring-offset-background absolute right-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none';
const OVERLAY_CLASS = 'fixed inset-0 z-40 bg-black/50';

/**
 * <alu-dialog open> … </alu-dialog>
 * 子元素：alu-dialog-trigger（触发按钮）、alu-dialog-content（内容，含标题/描述/footer slot）。
 * open 为属性（"true"/"false" 或存在即 true）；事件：open / close。
 * 行为对齐 bits-ui：Escape 关闭、遮罩点击关闭、打开时锁 body 滚动。
 */
export class AluDialog extends HTMLElement {
  static observedAttributes = ['open'];

  private _overlay: HTMLDivElement | null = null;
  private _prevOverflow = '';

  get open(): boolean {
    return this.getAttribute('open') !== 'false';
  }

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<slot></slot>';

    // 打开时锁滚动（与 Svelte dialog.svelte $effect 行为一致）
    this.addEventListener('dialog-open', () => this._lockScroll(true));
    this.addEventListener('dialog-close', () => this._lockScroll(false));

    // 子元素行为：trigger 点击 → open；Escape / overlay 点击 → close
    this.addEventListener('click', (e) => {
      const trigger = (e.target as HTMLElement).closest?.('alu-dialog-trigger');
      if (trigger) this._setOpen(true);
    });

    document.addEventListener('keydown', this._onKeydown);
    if (this.open) this._lockScroll(true);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeydown);
    this._lockScroll(false);
    this._overlay?.remove();
  }

  private _onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) {
      this._setOpen(false);
    }
  };

  attributeChangedCallback(name: string, _o: string | null, _n: string | null) {
    if (name !== 'open') return;
    if (this.open) this._setOpen(true);
    else this._setOpen(false);
  }

  private _setOpen(open: boolean) {
    if (open === this.open && open === true) return;
    this.setAttribute('open', open ? 'true' : 'false');
    this._lockScroll(open);
    this._syncOverlay(open);
    // 通知 content 子元素
    this.dispatchEvent(new CustomEvent(open ? 'dialog-open' : 'dialog-close', { bubbles: true, composed: true }));
    this.dispatchEvent(
      new CustomEvent(open ? 'open' : 'close', { detail: { open }, bubbles: true, composed: true }),
    );
  }

  private _syncOverlay(open: boolean) {
    if (open) {
      if (!this._overlay) {
        this._overlay = document.createElement('div');
        this._overlay.setAttribute('data-slot', 'dialog-overlay');
        this._overlay.className = cn(OVERLAY_CLASS, this.getAttribute('class') ?? '');
        this._overlay.addEventListener('click', () => this._setOpen(false));
        document.body.appendChild(this._overlay);
      }
      this._overlay.style.display = 'block';
    } else if (this._overlay) {
      this._overlay.style.display = 'none';
    }
  }

  private _lockScroll(lock: boolean) {
    const main = document.querySelector<HTMLElement>('main');
    if (lock) {
      this._prevOverflow = main?.style.overflow ?? '';
      document.body.classList.add('overflow-hidden');
      if (main) main.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('overflow-hidden');
      if (main) main.style.overflow = this._prevOverflow;
    }
  }
}

/**
 * <alu-dialog-trigger> — 触发按钮（渲染为 alu-button ghost，slot 内容）。
 */
export class AluDialogTrigger extends HTMLElement {
  static observedAttributes = ['class'];
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const cls = cn(buttonVariants({ variant: 'default', size: 'default' }), this.getAttribute('class') ?? '');
    shadow.innerHTML =
      '<style>:host{display:inline-block}</style>' +
      `<button type="button" data-slot="dialog-trigger" class="${cls}"><slot></slot></button>`;
    forwardEvent(this, shadow, 'click');
  }
}

/**
 * <alu-dialog-content> — 对话框内容（portal 到 body）。
 * 结构：<alu-dialog-content><alu-dialog-header><alu-dialog-title>…</alu-dialog-title><alu-dialog-description>…</alu-dialog-description></alu-dialog-header>…<alu-dialog-footer>…</alu-dialog-footer></alu-dialog-content>
 */
export class AluDialogContent extends HTMLElement {
  static observedAttributes = ['class'];

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const cls = cn(CONTENT_CLASS, this.getAttribute('class') ?? '');
    shadow.innerHTML =
      '<style>:host{display:none}</style>' +
      `<div data-slot="dialog-content" role="dialog" aria-modal="true" class="${cls}"><slot></slot>` +
      `<button type="button" aria-label="Close" data-slot="dialog-close" class="${CLOSE_CLASS}"></button></div>`;
    const close = shadow.querySelector('[data-slot="dialog-close"]')!;
    close.innerHTML = '';
    close.appendChild(closeIcon());
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = 'Close';
    close.appendChild(sr);
    close.addEventListener('click', () => {
      const dialog = this.closest('alu-dialog');
      dialog?.setAttribute('open', 'false');
    });

    // portal：渲染到 body，显示与否由 alu-dialog open 状态驱动
    this._portal = document.createElement('div');
    this._portal.setAttribute('data-ala-dialog-portal', 'content');
    this._portal.appendChild(shadow.host);
    document.body.appendChild(this._portal);
  }

  private _portal!: HTMLElement;

  // 由 AluDialog open 事件驱动
  _setVisible(visible: boolean) {
    (this.shadowRoot!.querySelector('[data-slot="dialog-content"]') as HTMLElement).style.display = visible
      ? 'grid'
      : 'none';
  }

  disconnectedCallback() {
    this._portal?.remove();
  }
}

function closeIcon() {
  // 内联 x 图标（等价 lucide x：M18 6 6 18 M6 6l12 12）
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('class', 'size-4');
  svg.innerHTML = '<path d="M18 6 6 18"/><path d="M6 6l12 12"/>';
  return svg;
}

/**
 * <alu-dialog-header> / <alu-dialog-title> / <alu-dialog-description> / <alu-dialog-footer>
 */
const DIALOG_SUBS: Array<[string, string, string]> = [
  ['alu-dialog-header', 'div', 'flex flex-col space-y-1.5 text-center sm:text-left'],
  ['alu-dialog-title', 'h2', 'text-lg font-semibold leading-none tracking-tight'],
  ['alu-dialog-description', 'p', 'text-sm text-muted-foreground'],
  ['alu-dialog-footer', 'div', 'flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2'],
];

for (const [tag, html, cls] of DIALOG_SUBS) {
  const Sub = class extends HTMLElement {
    connectedCallback() {
      const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
      shadow.innerHTML = `<style>:host{display:${tag === 'alu-dialog-title' ? 'block' : tag === 'alu-dialog-header' ? 'block' : 'flex'}}</style>` +
        `<${html} data-slot="${tag.replace('alu-dialog-', '')}" class="${cls}"><slot></slot></${html}>`;
    }
  };
  if (!customElements.get(tag)) customElements.define(tag, Sub);
}

// AluDialog open 事件 → 同步 AluDialogContent 可见性
document.addEventListener('dialog-open', (e) => {
  const dialog = (e.target as HTMLElement).closest?.('alu-dialog');
  dialog?.querySelectorAll<InstanceType<typeof AluDialogContent>>('alu-dialog-content').forEach((c) =>
    c._setVisible(true),
  );
});
document.addEventListener('dialog-close', (e) => {
  const dialog = (e.target as HTMLElement).closest?.('alu-dialog');
  dialog?.querySelectorAll<InstanceType<typeof AluDialogContent>>('alu-dialog-content').forEach((c) =>
    c._setVisible(false),
  );
});

if (!customElements.get('alu-dialog')) customElements.define('alu-dialog', AluDialog);
if (!customElements.get('alu-dialog-trigger')) customElements.define('alu-dialog-trigger', AluDialogTrigger);
if (!customElements.get('alu-dialog-content')) customElements.define('alu-dialog-content', AluDialogContent);
