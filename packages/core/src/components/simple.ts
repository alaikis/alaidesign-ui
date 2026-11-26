import { cn } from './cn';


// 空状态（与 Svelte 包 empty-state.svelte 对齐）
class AluEmptyState extends HTMLElement {
  static observedAttributes = ['icon', 'icon-size', 'title', 'description', 'action-label', 'secondary-action-label', 'class'];
  private _iconSizes: Record<string, string> = {
    sm: 'w-12 h-12 [&>svg]:h-6 [&>svg]:w-6',
    md: 'w-16 h-16 [&>svg]:h-8 [&>svg]:w-8',
    lg: 'w-20 h-20 [&>svg]:h-10 [&>svg]:w-10',
  };
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    this._render();
    shadow.addEventListener('click', this._onClick);
  }
  attributeChangedCallback() {
    this._render();
  }
  private _render() {
    const shadow = this.shadowRoot!;
    const iconSize = this.getAttribute('icon-size') ?? 'md';
    const title = this.getAttribute('title') ?? '';
    const description = this.getAttribute('description') ?? '';
    const actionLabel = this.getAttribute('action-label') ?? '';
    const secondaryLabel = this.getAttribute('secondary-action-label') ?? '';
    shadow.innerHTML =
      `<style>:host{display:block}</style>` +
      `<div class="flex flex-col items-center justify-center py-16 px-4 text-center ${this.getAttribute('class') ?? ''}">
        <div class="${this._iconSizes[iconSize] ?? this._iconSizes.md} rounded-lg bg-muted/50 flex items-center justify-center mb-4" data-role="icon-box"></div>
        <h3 class="text-lg font-semibold text-foreground mb-2">${title}</h3>
        ${description ? `<p class="text-sm text-muted-foreground max-w-sm mb-6">${description}</p>` : ''}
        <div class="flex gap-2">
          ${actionLabel ? `<alu-button data-action="primary">${actionLabel}</alu-button>` : ''}
          ${secondaryLabel ? `<alu-button variant="outline" data-action="secondary">${secondaryLabel}</alu-button>` : ''}
        </div>
      </div>`;
    const iconBox = shadow.querySelector('[data-role="icon-box"]')!;
    const iconName = this.getAttribute('icon')?.replace(/^lucide:/, '') ?? 'inbox';
    iconBox.innerHTML = '';
    iconBox.appendChild(icon(iconName, 32, 'text-muted-foreground/50'));
  }
  private _onClick = (e: Event) => {
    const btn = (e.target as HTMLElement).closest('alu-button');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    if (action === 'primary') this.dispatchEvent(new CustomEvent('action', { bubbles: true, composed: true }));
    if (action === 'secondary') this.dispatchEvent(new CustomEvent('secondary-action', { bubbles: true, composed: true }));
  };
}
if (!customElements.get('alu-empty-state')) customElements.define('alu-empty-state', AluEmptyState);

// 错误状态（与 Svelte 包 error-state.svelte 对齐）
class AluErrorState extends HTMLElement {
  static observedAttributes = ['title', 'message', 'class'];
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    this._render();
    shadow.addEventListener('click', this._onClick);
  }
  attributeChangedCallback() {
    this._render();
  }
  private _render() {
    const shadow = this.shadowRoot!;
    const title = this.getAttribute('title') ?? 'Something went wrong';
    const message = this.getAttribute('message') ?? 'An error occurred while loading data. Please try again.';
    shadow.innerHTML =
      `<style>:host{display:block}</style>` +
      `<div class="flex flex-col items-center justify-center py-16 px-4 text-center ${this.getAttribute('class') ?? ''}">
        <div class="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-4" data-role="icon-box"></div>
        <h3 class="text-lg font-semibold text-foreground mb-2">${title}</h3>
        <p class="text-sm text-muted-foreground max-w-sm mb-6">${message}</p>
        <alu-button variant="outline" class="gap-2" data-retry>Retry</alu-button>
      </div>`;
    const box = shadow.querySelector('[data-role="icon-box"]')!;
    box.innerHTML = '';
    box.appendChild(icon('alert-circle', 32, 'text-red-500'));
  }
  private _onClick = (e: Event) => {
    if ((e.target as HTMLElement).closest('[data-retry]')) {
      this.dispatchEvent(new CustomEvent('retry', { bubbles: true, composed: true }));
    }
  };
}
if (!customElements.get('alu-error-state')) customElements.define('alu-error-state', AluErrorState);

// 页头（与 Svelte 包 page-header.svelte 对齐）
class AluPageHeader extends HTMLElement {
  static observedAttributes = ['title', 'description', 'icon', 'class'];
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    this._render();
  }
  attributeChangedCallback() {
    this._render();
  }
  private _render() {
    const shadow = this.shadowRoot!;
    const title = this.getAttribute('title') ?? '';
    const description = this.getAttribute('description') ?? '';
    const iconName = this.getAttribute('icon')?.replace(/^lucide:/, '');
    shadow.innerHTML =
      `<style>:host{display:block}</style>` +
      `<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${this.getAttribute('class') ?? ''}">
        <div class="flex items-start gap-4">
          ${iconName ? `<div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" data-role="icon-box"></div>` : ''}
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl font-bold tracking-tight text-foreground">${title}</h1>
            ${description ? `<p class="text-muted-foreground mt-1">${description}</p>` : ''}
          </div>
        </div>
        <div class="flex items-center gap-2"><slot name="actions"></slot></div>
      </div>`;
    if (iconName) {
      const box = shadow.querySelector('[data-role="icon-box"]')!;
      box.appendChild(icon(iconName, 24, 'text-primary'));
    }
  }
}
if (!customElements.get('alu-page-header')) customElements.define('alu-page-header', AluPageHeader);

// 错误边界（svelte:boundary 降级：属性 error 存在时渲染错误 UI，否则渲染 slot；reset 事件）
class AluErrorBoundary extends HTMLElement {
  static observedAttributes = ['error', 'class'];
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    this._render();
  }
  attributeChangedCallback() {
    this._render();
  }
  private _render() {
    const shadow = this.shadowRoot!;
    const error = this.getAttribute('error');
    if (error) {
      shadow.innerHTML =
        `<style>:host{display:block}</style>` +
        `<div class="flex flex-col items-center justify-center py-16 px-4 text-center ${this.getAttribute('class') ?? ''}">
          <div class="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-4" data-role="icon-box"></div>
          <h3 class="text-lg font-semibold text-foreground mb-2">Something went wrong</h3>
          <p class="text-sm text-muted-foreground max-w-sm mb-6">${error}</p>
          <alu-button variant="outline" class="gap-2" data-reset>Try Again</alu-button>
        </div>`;
      const box = shadow.querySelector('[data-role="icon-box"]')!;
      box.appendChild(icon('alert-circle', 32, 'text-red-500'));
      (shadow.querySelector('[data-reset]') as HTMLElement).addEventListener('click', () => {
        this.removeAttribute('error');
        this._render();
        this.dispatchEvent(new CustomEvent('reset', { bubbles: true, composed: true }));
      });
    } else {
      shadow.innerHTML = '<style>:host{display:block}</style><slot></slot>';
    }
  }
}
if (!customElements.get('alu-error-boundary')) customElements.define('alu-error-boundary', AluErrorBoundary);

// 表单项（label + slot + helper/error；与 Svelte 包 form-field.svelte 对齐）
class AluFormField extends HTMLElement {
  static observedAttributes = ['label', 'required', 'helper-text', 'error', 'for', 'class'];
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    this._render();
  }
  attributeChangedCallback() {
    this._render();
  }
  private _render() {
    const shadow = this.shadowRoot!;
    const label = this.getAttribute('label');
    const required = this.hasAttribute('required');
    const helper = this.getAttribute('helper-text');
    const error = this.getAttribute('error');
    const forAttr = this.getAttribute('for') ?? '';
    shadow.innerHTML =
      `<style>:host{display:block}</style>` +
      `<div class="space-y-1.5 ${this.getAttribute('class') ?? ''}">
        ${label ? `<label for="${forAttr}" class="text-sm font-medium text-foreground">${label}${required ? '<span class="text-destructive ml-0.5">*</span>' : ''}</label>` : ''}
        <div class="flex flex-col gap-1"><slot${forAttr ? ` data-for="${forAttr}"` : ''}></slot>
          ${!error && helper ? `<p class="text-xs text-muted-foreground">${helper}</p>` : ''}
          ${error ? `<p class="text-xs text-destructive">${error}</p>` : ''}
        </div>
      </div>`;
  }
}
if (!customElements.get('alu-form-field')) customElements.define('alu-form-field', AluFormField);

// 提示条（type/description/duration；与 Svelte 包 sonner.svelte 对齐）
class AluSonner extends HTMLElement {
  static observedAttributes = ['type', 'description', 'duration'];
  private _timer: number | null = null;
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    this._render();
    const duration = Number(this.getAttribute('duration')) || 3000;
    if (duration > 0) {
      this._timer = window.setTimeout(() => this._dismiss(), duration);
    }
  }
  attributeChangedCallback() {
    this._render();
  }
  private _render() {
    const shadow = this.shadowRoot!;
    const type = this.getAttribute('type') ?? 'info';
    const description = this.getAttribute('description') ?? '';
    const iconMap: Record<string, string> = { success: 'check-circle', error: 'alert-circle', warning: 'alert-triangle', info: 'info' };
    const colorMap: Record<string, string> = { success: 'text-green-600', error: 'text-red-600', warning: 'text-yellow-600', info: 'text-blue-600' };
    const bgMap: Record<string, string> = {
      success: 'bg-green-50 border-green-200',
      error: 'bg-red-50 border-red-200',
      warning: 'bg-yellow-50 border-yellow-200',
      info: 'bg-blue-50 border-blue-200',
    };
    shadow.innerHTML =
      `<style>:host{display:block}</style>` +
      `<div class="fixed top-4 right-4 z-[9999] max-w-sm ${bgMap[type] ?? bgMap.info} border rounded-lg shadow p-4 flex items-start gap-3">
        <span data-role="icon" class="h-5 w-5 flex-shrink-0 mt-0.5 ${colorMap[type] ?? colorMap.info}"></span>
        <p class="text-sm font-medium flex-1">${description}</p>
        <button data-role="close" class="flex-shrink-0 hover:opacity-70 transition-opacity"></button>
      </div>`;
    const iconEl = shadow.querySelector('[data-role="icon"]')!;
    iconEl.appendChild(icon(iconMap[type] ?? 'info', 20, 'h-5 w-5'));
    const close = shadow.querySelector('[data-role="close"]') as HTMLElement;
    close.appendChild(icon('x', 16, 'h-4 w-4'));
    close.addEventListener('click', () => this._dismiss());
  }
  private _dismiss() {
    if (this._timer) window.clearTimeout(this._timer);
    this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
    this.remove();
  }
}
if (!customElements.get('alu-sonner')) customElements.define('alu-sonner', AluSonner);

// 分隔线（水平/垂直；与 Svelte 包 separator.svelte 对齐）
class AluSeparator extends HTMLElement {
  static observedAttributes = ['orientation', 'class'];
  get orientation(): 'horizontal' | 'vertical' {
    return (this.getAttribute('orientation') as 'horizontal' | 'vertical') ?? 'horizontal';
  }
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    this._render();
  }
  attributeChangedCallback() {
    this._render();
  }
  private _render() {
    const shadow = this.shadowRoot!;
    const o = this.orientation;
    const cls = cn('bg-border shrink-0 h-px w-full', this.getAttribute('class') ?? '');
    shadow.innerHTML =
      `<style>:host{display:${o === 'vertical' ? 'inline-block' : 'block'}}${o === 'vertical' ? ':host{width:1px;height:100%}' : ''}</style>` +
      `<div data-slot="separator" data-orientation="${o}" role="separator" class="${o === 'vertical' ? 'bg-border w-px h-full' : cls}"></div>`;
  }
}
if (!customElements.get('alu-separator')) customElements.define('alu-separator', AluSeparator);

// 多行输入（与 Svelte 包 textarea.svelte 对齐）
class AluTextarea extends HTMLElement {
  static observedAttributes = ['value', 'placeholder', 'disabled', 'class'];
  get value(): string {
    return this.shadowRoot?.querySelector('textarea')?.value ?? this.getAttribute('value') ?? '';
  }
  set value(v: string) {
    this.setAttribute('value', v);
    const ta = this.shadowRoot?.querySelector('textarea');
    if (ta) ta.value = v;
  }
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const cls = cn('flex min-h-[60px] w-full rounded-lg border border-border bg-card px-3 py-2 text-sm transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-info focus:ring-2 focus:ring-info/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50', this.getAttribute('class') ?? '');
    shadow.innerHTML =
      `<style>:host{display:block}</style>` +
      `<textarea data-slot="textarea" class="${cls}"${this.getAttribute('placeholder') ? ` placeholder="${this.getAttribute('placeholder')}"` : ''}>${this.getAttribute('value') ?? ''}</textarea>`;
    const ta = shadow.querySelector('textarea')!;
    if (this.hasAttribute('disabled')) ta.disabled = true;
    ta.addEventListener('input', () => {
      this.setAttribute('value', ta.value);
      this.dispatchEvent(new CustomEvent('input', { detail: { value: ta.value }, bubbles: true, composed: true }));
    });
    ta.addEventListener('change', () => {
      this.dispatchEvent(new CustomEvent('change', { detail: { value: ta.value }, bubbles: true, composed: true }));
    });
  }
}
if (!customElements.get('alu-textarea')) customElements.define('alu-textarea', AluTextarea);

// 开关（Toggle Root 降级；与 Svelte 包 switch.svelte 对齐）
class AluSwitch extends HTMLElement {
  static observedAttributes = ['checked', 'disabled', 'class'];
  get checked(): boolean {
    return this.hasAttribute('checked');
  }
  set checked(v: boolean) {
    if (v) this.setAttribute('checked', '');
    else this.removeAttribute('checked');
  }
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const cls = cn('peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=on]:bg-primary data-[state=off]:bg-input', this.getAttribute('class') ?? '');
    shadow.innerHTML =
      `<style>:host{display:inline-block}</style>` +
      `<button type="button" role="switch" data-slot="switch" aria-checked="${this.checked}" data-state="${this.checked ? 'on' : 'off'}" class="${cls}"><span class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow ring-0 transition-transform duration-200 ${this.checked ? 'translate-x-4' : 'translate-x-0'}"></span></button>`;
    const btn = shadow.querySelector('button')!;
    if (this.hasAttribute('disabled')) btn.disabled = true;
    btn.addEventListener('click', () => {
      const now = !this.checked;
      this.checked = now;
      this._sync(btn, now);
      this.dispatchEvent(new CustomEvent('change', { detail: { checked: now }, bubbles: true, composed: true }));
    });
    this.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        btn.click();
      }
    });
  }
  attributeChangedCallback() {
    const btn = this.shadowRoot?.querySelector('button') as HTMLButtonElement | null;
    if (btn) this._sync(btn, this.checked);
  }
  private _sync(btn: HTMLButtonElement, checked: boolean) {
    btn.setAttribute('aria-checked', String(checked));
    btn.setAttribute('data-state', checked ? 'on' : 'off');
    const knob = btn.querySelector('span')!;
    knob.className = `pointer-events-none block h-4 w-4 rounded-full bg-background shadow ring-0 transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`;
  }
}
if (!customElements.get('alu-switch')) customElements.define('alu-switch', AluSwitch);

// 下拉选择（原生 select 包装；与 Svelte 包 select.svelte 对齐）
class AluSelect extends HTMLElement {
  static observedAttributes = ['value', 'placeholder', 'disabled', 'class'];
  get value(): string {
    return this.getAttribute('value') ?? this._sel?.value ?? '';
  }
  set value(v: string) {
    this.setAttribute('value', v);
    if (this._sel) this._sel.value = v;
  }
  private _sel!: HTMLSelectElement;
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const cls = cn('h-9 w-full appearance-none rounded-lg border border-border bg-card px-3 py-1.5 pr-8 text-sm transition-all duration-200 focus:border-info focus:ring-2 focus:ring-info/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50', this.getAttribute('class') ?? '');
    shadow.innerHTML =
      `<style>:host{display:block}</style>` +
      `<div class="relative"><select data-slot="select" class="${cls}"><slot name="options"></slot></select>` +
      `<svg class="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></div>`;
    this._sel = shadow.querySelector('select')!;
    this._sel.addEventListener('change', () => {
      this.setAttribute('value', this._sel.value);
      this.dispatchEvent(new CustomEvent('change', { detail: { value: this._sel.value }, bubbles: true, composed: true }));
    });
    if (this.hasAttribute('disabled')) this._sel.disabled = true;
  }
  attributeChangedCallback(name: string) {
    if (name === 'disabled') this._sel?.toggleAttribute('disabled', this.hasAttribute('disabled'));
  }
}
if (!customElements.get('alu-select')) customElements.define('alu-select', AluSelect);

// 内联 SVG 图标工厂函数（simple.ts 专用，避免 lucide import 解析问题）
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
        : name === 'alert-circle'
          ? 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z|M12 8v4|M12 16h.01'
          : name === 'info'
            ? 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M12 16v-4|M12 8h.01'
            : name === 'check-circle'
              ? 'M22 11.08V12a10 10 0 1 1-5.93-9.14|M22 4 12 14.01l-3-3'
              : name === 'alert-triangle'
                ? 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z|M12 9v4|M12 17h.01'
                : 'M22 12h-6l-2 3h-4l-2-3H2';
  for (const p of pathD.split('|')) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', p.trim());
    svg.appendChild(path);
  }
  return svg;
}

export { AluEmptyState, AluErrorState, AluPageHeader, AluErrorBoundary, AluFormField, AluSonner, AluSeparator, AluTextarea, AluSwitch, AluSelect };
