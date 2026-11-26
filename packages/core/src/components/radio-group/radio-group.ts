import { cn } from '../../internal/cn';

// 单选组（与 Svelte 包 radio-group/ 对齐，bits-ui RadioGroup 降级为原生 radio）
const RADIO_GROUP_CLASS = 'grid gap-2';
const RADIO_ITEM_CLASS =
  'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export class AluRadioGroup extends HTMLElement {
  static observedAttributes = ['value', 'disabled', 'class'];

  get value(): string {
    return this.getAttribute('value') ?? '';
  }
  set value(v: string) {
    this.setAttribute('value', v);
    this._sync();
  }

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      `<style>:host{display:block}</style>` +
      `<div data-slot="radio-group" role="radiogroup" class="${cn(RADIO_GROUP_CLASS, this.getAttribute('class') ?? '')}"><slot></slot></div>`;
    this.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest?.('alu-radio-group-item');
      if (!item || this.hasAttribute('disabled')) return;
      this.value = item.getAttribute('value') ?? '';
      this.dispatchEvent(
        new CustomEvent('value-change', { detail: { value: this.value }, bubbles: true, composed: true }),
      );
    });
    this._sync();
  }

  attributeChangedCallback() {
    this._sync();
  }

  private _sync() {
    this.querySelectorAll<HTMLElement>(':scope > alu-radio-group-item, [slot] alu-radio-group-item').forEach((item) => {
      const v = item.getAttribute('value') ?? '';
      item.toggleAttribute('data-active', v === this.value);
      item.setAttribute('aria-checked', String(v === this.value));
    });
  }
}

export class AluRadioGroupItem extends HTMLElement {
  static observedAttributes = ['value', 'disabled', 'data-active', 'class'];

  get value(): string {
    return this.getAttribute('value') ?? '';
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
    const disabled = this.hasAttribute('disabled');
    const active = this.hasAttribute('data-active');
    shadow.innerHTML =
      `<style>:host{display:inline-block}</style>` +
      `<label data-slot="radio-group-item" class="inline-flex items-center gap-2 cursor-pointer${disabled ? ' cursor-not-allowed opacity-50' : ''}">
        <input type="radio" ${disabled ? 'disabled' : ''} ${active ? 'checked' : ''} class="${RADIO_ITEM_CLASS}" style="appearance:none;${active ? 'background:currentColor;box-shadow:inset 0 0 0 4px var(--background,#fff)' : ''}"/>
        <slot></slot>
      </label>`;
  }
}

if (!customElements.get('alu-radio-group')) customElements.define('alu-radio-group', AluRadioGroup);
if (!customElements.get('alu-radio-group-item')) customElements.define('alu-radio-group-item', AluRadioGroupItem);
