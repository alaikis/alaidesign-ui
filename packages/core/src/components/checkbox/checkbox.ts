import { cn } from '../../internal/cn';
import { icon } from '../icon';
// 与 Svelte 包 checkbox.svelte 对齐（bits-ui Checkbox Root 降级：原生 input + 键盘）
const CHECKBOX_CLASS =
  'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground';

/**
 * <alu-checkbox> — 复选框（对应 Svelte Checkbox，bits-ui Root 降级为原生 input[type=checkbox]）。
 * 属性：checked / indeterminate / disabled / name / value。
 * 事件：change（detail.checked / detail.indeterminate）。
 */
export class AluCheckbox extends HTMLElement {
  static observedAttributes = ['checked', 'indeterminate', 'disabled', 'name', 'value'];

  private _input!: HTMLInputElement;

  get checked(): boolean {
    return this._input?.checked ?? false;
  }
  set checked(v: boolean) {
    if (this._input) this._input.checked = v;
  }

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<style>:host{display:inline-block}</style>';
    this._input = document.createElement('input');
    this._input.type = 'checkbox';
    this._input.setAttribute('data-slot', 'checkbox');
    this._input.className = cn(CHECKBOX_CLASS, this.getAttribute('class') ?? '');
    const wrap = document.createElement('span');
    wrap.setAttribute('data-state', 'unchecked');
    wrap.style.display = 'inline-flex';
    wrap.style.position = 'relative';
    wrap.appendChild(this._input);
    // 对勾图标（checked 态）
    const check = icon('check', 16, 'h-4 w-4');
    check.style.position = 'absolute';
    check.style.inset = '0';
    check.style.margin = 'auto';
    check.style.visibility = 'hidden';
    wrap.appendChild(check);
    shadow.appendChild(wrap);

    this._input.addEventListener('change', () => {
      this._sync();
      this.dispatchEvent(
        new CustomEvent('change', {
          detail: { checked: this._input.checked, indeterminate: this._input.indeterminate },
          bubbles: true,
          composed: true,
        }),
      );
    });
    this._sync();
  }

  attributeChangedCallback() {
    this._sync();
  }

  private _sync() {
    const i = this._input;
    i.checked = this.hasAttribute('checked');
    i.indeterminate = this.hasAttribute('indeterminate');
    i.disabled = this.hasAttribute('disabled');
    i.name = this.getAttribute('name') ?? '';
    i.value = this.getAttribute('value') ?? '';
    const wrap = i.parentElement!;
    wrap.setAttribute('data-state', i.indeterminate ? 'indeterminate' : i.checked ? 'checked' : 'unchecked');
    const check = wrap.querySelector('svg')!;
    check.style.visibility = i.checked || i.indeterminate ? 'visible' : 'hidden';
  }
}

if (!customElements.get('alu-checkbox')) {
  customElements.define('alu-checkbox', AluCheckbox);
}
