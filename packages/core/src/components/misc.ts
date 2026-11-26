import { AluCheckbox } from './checkbox/checkbox';
import { cn } from './cn';


// 内联 SVG 图标工厂函数（misc.ts 专用，避免 lucide import 解析问题）
function icon(name: string, size: number, cls = ''): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  if (cls) svg.setAttribute('class', cls);
  const pathD =
    name === 'x'
      ? 'M18 6 6 18|M6 6l12 12'
      : name === 'search'
        ? 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z|M21 21l-4.35-4.35'
        : 'M22 12h-6l-2 3h-4l-2-3H2';
  for (const p of pathD.split('|')) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', p.trim());
    svg.appendChild(path);
  }
  return svg;
}

// 搜索栏（350ms 防抖 + 清除 + 回车；与 Svelte 包 search-bar.svelte 对齐）
class AluSearchBar extends HTMLElement {
  static observedAttributes = ['placeholder', 'clearable', 'loading', 'class'];
  get value(): string {
    return this.getAttribute('value') ?? this._input?.value ?? '';
  }
  set value(v: string) {
    this.setAttribute('value', v);
    if (this._input) this._input.value = v;
    this._syncClear();
  }
  private _input!: HTMLInputElement;
  private _timer: number | null = null;

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const cls = cn('relative flex items-center rounded-md border transition-colors border-border hover:border-border/80', this.getAttribute('class') ?? '');
    shadow.innerHTML =
      `<style>:host{display:inline-flex}</style>` +
      `<div data-shell class="${cls}">
        <div class="pl-3.5 flex items-center pointer-events-none" data-role="icon"></div>
        <input placeholder="${this.getAttribute('placeholder') ?? 'Search...'}" value="${this.value}"
          class="h-9 w-full rounded-md bg-transparent px-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none"/>
        <button type="button" data-role="clear" class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors" style="display:none"></button>
      </div>`;
    this._input = shadow.querySelector('input')!;
    const shell = shadow.querySelector('[data-shell]')!;
    this._input.addEventListener('input', () => {
      this.setAttribute('value', this._input.value);
      this._syncClear();
      if (this._timer) window.clearTimeout(this._timer);
      this._timer = window.setTimeout(() => {
        this.dispatchEvent(new CustomEvent('search', { detail: { value: this._input.value }, bubbles: true, composed: true }));
      }, 350);
    });
    this._input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (this._timer) window.clearTimeout(this._timer);
        this.dispatchEvent(new CustomEvent('search', { detail: { value: this._input.value }, bubbles: true, composed: true }));
      }
    });
    this._input.addEventListener('focus', () => shell.classList.add('border-primary/60', 'ring-2', 'ring-primary/20'));
    this._input.addEventListener('blur', () => shell.classList.remove('border-primary/60', 'ring-2', 'ring-primary/20'));
    shadow.querySelector('[data-role="clear"]')!.addEventListener('click', () => {
      this.value = '';
      this.dispatchEvent(new CustomEvent('search', { detail: { value: '' }, bubbles: true, composed: true }));
      this._input.focus();
    });
    this._syncIcon();
    this._syncClear();
  }

  private _syncIcon() {
    const box = this.shadowRoot!.querySelector('[data-role="icon"]')!;
    box.innerHTML = '';
    const loading = this.hasAttribute('loading');
    box.appendChild(icon(loading ? 'loader-circle' : 'search', 16, `h-4 w-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`));
  }

  private _syncClear() {
    const clear = this.shadowRoot!.querySelector('[data-role="clear"]') as HTMLElement;
    const show = this.hasAttribute('clearable') !== false && !!this.value;
    clear.style.display = show ? 'flex' : 'none';
    clear.innerHTML = '';
    if (show) clear.appendChild(icon('x', 16, 'h-4 w-4'));
  }
}
if (!customElements.get('alu-search-bar')) customElements.define('alu-search-bar', AluSearchBar);

export { AluCheckbox, AluSearchBar };
