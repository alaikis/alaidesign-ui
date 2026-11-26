import { cn } from '../../internal/cn';

// 与 Svelte 包 input.svelte 对齐（输入框类名同源）
const INPUT_CLASS = [
  'h-9 rounded-md border border-border bg-card px-3 py-1.5 text-sm transition-all duration-200',
  'placeholder:text-muted-foreground/70',
  'focus:border-info focus:ring-2 focus:ring-info/20 focus:outline-none',
  'disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-60',
  'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
].join(' ');

/**
 * <alu-input> — 输入框（对应 Svelte Input）。
 * 属性：type / value / placeholder / disabled / readonly / required。
 * value 为双向属性：修改 input 后 dispatch `input` 事件（detail.value），宿主可监听同步。
 */
export class AluInput extends HTMLElement {
  static observedAttributes = ['type', 'value', 'placeholder', 'disabled', 'readonly', 'required'];

  private _input!: HTMLInputElement;

  get value(): string {
    return this.getAttribute('value') ?? this._input?.value ?? '';
  }
  set value(v: string) {
    this.setAttribute('value', v);
    if (this._input && this._input.value !== v) this._input.value = v;
  }

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<style>:host{display:inline-block}</style>';
    this._input = document.createElement('input');
    this._input.setAttribute('data-slot', 'input');
    this._input.className = cn(INPUT_CLASS, this.getAttribute('class') ?? '');
    this._input.addEventListener('input', (e) => {
      this.setAttribute('value', (e.target as HTMLInputElement).value);
      this.dispatchEvent(new CustomEvent('input', { detail: { value: this._input.value }, bubbles: true, composed: true }));
    });
    this._input.addEventListener('change', (e) => {
      this.dispatchEvent(new CustomEvent('change', { detail: { value: this._input.value }, bubbles: true, composed: true }));
    });
    shadow.appendChild(this._input);
    this._sync();
  }

  attributeChangedCallback(name: string, _old: string | null, _new: string | null) {
    if (!this._input) return;
    if (name === 'value' && this._input.value !== this.getAttribute('value')) {
      this._input.value = this.getAttribute('value') ?? '';
    }
    if (name !== 'value') this._sync();
  }

  private _sync() {
    const i = this._input;
    i.type = this.getAttribute('type') ?? 'text';
    i.placeholder = this.getAttribute('placeholder') ?? '';
    i.disabled = this.hasAttribute('disabled');
    i.readOnly = this.hasAttribute('readonly');
    i.required = this.hasAttribute('required');
  }
}

if (!customElements.get('alu-input')) {
  customElements.define('alu-input', AluInput);
}
