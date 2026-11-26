import { cn } from '../../internal/cn';
import { forwardEvent } from '../../internal/base';
import { buttonVariants } from '../../internal/variants/button';

// 表格补充子组件 + 工具栏（与 Svelte 包对齐）

function defineSlot(tag: string, html: string, cls: string, hostDisplay = 'block') {
  class C extends HTMLElement {
    static observedAttributes = ['class'];
    connectedCallback() {
      const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
      shadow.innerHTML =
        `<style>:host{display:${hostDisplay}}</style>` +
        `<${html} data-slot="${tag.replace('alu-table-', '')}" class="${cls}"><slot></slot></${html}>`;
    }
    attributeChangedCallback() {
      const el = this.shadowRoot!.firstElementChild as HTMLElement;
      if (el) el.className = cn(cls, this.getAttribute('class') ?? '');
    }
  }
  if (!customElements.get(tag)) customElements.define(tag, C);
}

defineSlot('alu-table-caption', 'caption', 'text-muted-foreground mt-4 text-sm');
defineSlot('alu-table-footer', 'tfoot', 'bg-muted/10 [&>tr]:border-border/50 [&>tr]:border-t');

// table-actions（工具栏按钮组；actions 为 JSON 属性，元素上 <slot> 放 alu-button）
class AluTableActions extends HTMLElement {
  static observedAttributes = ['align', 'class'];
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    this._render();
  }
  attributeChangedCallback() {
    this._render();
  }
  private _render() {
    const shadow = this.shadowRoot!;
    const align = this.getAttribute('align') ?? 'end';
    const alignCls = align === 'start' ? 'justify-start' : align === 'center' ? 'justify-center' : 'justify-end';
    shadow.innerHTML =
      `<style>:host{display:inline-block}</style>` +
      `<div data-slot="table-actions" class="flex items-center ${alignCls} gap-1"><slot></slot></div>`;
  }
}
if (!customElements.get('alu-table-actions')) customElements.define('alu-table-actions', AluTableActions);

export { buttonVariants, forwardEvent };
