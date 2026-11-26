import { cn } from '../../internal/cn';
import { tv } from 'tailwind-variants';

// 与 Svelte 包 tabs/tabs-list.svelte 对齐（tabsListVariants 同源）
export const tabsListVariants = tv({
  base:
    'rounded-md p-[3px] group-data-horizontal/tabs:h-8 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col',
  variants: {
    variant: {
      default: 'cn-tabs-list-variant-default bg-muted',
      line: 'cn-tabs-list-variant-line gap-1 bg-transparent',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const TABS_TRIGGER_CLASS =
  'gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap transition-all focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-active:bg-background dark:data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 data-active:text-foreground';

/**
 * <alu-tabs> — 选项卡组（bits-ui Tabs Root 降级）。
 * 结构：
 *   <alu-tabs value="a" orientation="horizontal">
 *     <alu-tabs-list variant="default">
 *       <alu-tabs-trigger value="a">Tab A</alu-tabs-trigger>
 *       <alu-tabs-trigger value="b">Tab B</alu-tabs-trigger>
 *     </alu-tabs-list>
 *     <alu-tabs-content value="a">…A…</alu-tabs-content>
 *     <alu-tabs-content value="b">…B…</alu-tabs-content>
 *   </alu-tabs>
 * 事件：tab-change（detail.value）— 点击 trigger 时触发。
 */
export class AluTabs extends HTMLElement {
  static observedAttributes = ['value', 'orientation'];

  private _active = '';

  get value(): string {
    return this.getAttribute('value') ?? this._active;
  }

  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<style>:host{display:block}</style>' +
      `<div data-slot="tabs" class="gap-2 group/tabs flex data-[orientation=horizontal]:flex-col" data-orientation="${this.getAttribute('orientation') ?? 'horizontal'}"><slot></slot></div>`;

    const onTrigger = (e: Event) => {
      const trigger = (e.target as HTMLElement).closest?.('alu-tabs-trigger') as HTMLElement | null;
      const value = trigger?.getAttribute('value') ?? (e as CustomEvent).detail?.value;
      if (value) this._activate(value);
    };
    this.addEventListener('click', onTrigger);
  }

  attributeChangedCallback(name: string, _o: string | null, n: string | null) {
    if (name === 'value' && n) this._activate(n, false);
  }

  private _activate(value: string, emit = true) {
    this._active = value;
    this.setAttribute('value', value);
    // 同步子 trigger/content 的 data-active
    this.querySelectorAll<HTMLElement>('alu-tabs-trigger').forEach((t) => {
      const tv = t.getAttribute('value') ?? '';
      t.toggleAttribute('data-active', tv === value);
      if (tv === value) t.setAttribute('data-state', 'active');
      else t.removeAttribute('data-state');
    });
    this.querySelectorAll<HTMLElement>('alu-tabs-content').forEach((c) => {
      const match = c.getAttribute('value') === value;
      c.toggleAttribute('data-active', match);
      c.style.display = match ? '' : 'none';
    });
    if (emit) {
      this.dispatchEvent(new CustomEvent('tab-change', { detail: { value }, bubbles: true, composed: true }));
    }
  }
}

/**
 * <alu-tabs-list> — 选项卡组列表（容器），属性 variant。
 */
export class AluTabsList extends HTMLElement {
  static observedAttributes = ['variant', 'class'];
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const variant = this.getAttribute('variant') ?? 'default';
    shadow.innerHTML =
      '<style>:host{display:inline-flex}</style>' +
      `<div data-slot="tabs-list" role="tablist" data-variant="${variant}" class="${cn(tabsListVariants({ variant: variant as 'default' | 'line' }), this.getAttribute('class') ?? '')}"><slot></slot></div>`;
  }
}

/**
 * <alu-tabs-trigger> — 单个选项卡按钮，属性 value。点击时冒泡 click（alu-tabs 监听）。
 */
export class AluTabsTrigger extends HTMLElement {
  static observedAttributes = ['value', 'data-active', 'class'];
  get value(): string {
    return this.getAttribute('value') ?? '';
  }
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<style>:host{display:inline-flex}</style>' +
      `<button role="tab" type="button" data-slot="tabs-trigger" class="${TABS_TRIGGER_CLASS}" ${this.value ? `value="${this.value}"` : ''}><slot></slot></button>`;
  }
}

/**
 * <alu-tabs-content> — 选项卡内容面板，属性 value。
 */
export class AluTabsContent extends HTMLElement {
  static observedAttributes = ['value'];
  get value(): string {
    return this.getAttribute('value') ?? '';
  }
  connectedCallback() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<style>:host{display:block}</style>' +
      `<div data-slot="tabs-content" role="tabpanel" class="mt-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-md p-4 text-foreground" value="${this.value}"><slot></slot></div>`;
  }
}

if (!customElements.get('alu-tabs')) customElements.define('alu-tabs', AluTabs);
if (!customElements.get('alu-tabs-list')) customElements.define('alu-tabs-list', AluTabsList);
if (!customElements.get('alu-tabs-trigger')) customElements.define('alu-tabs-trigger', AluTabsTrigger);
if (!customElements.get('alu-tabs-content')) customElements.define('alu-tabs-content', AluTabsContent);
