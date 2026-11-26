import { describe, expect, it } from 'vitest';
import { AluButton } from '../src/components/button/button';
import { AluBadge } from '../src/components/badge/badge';
import { AluInput } from '../src/components/input/input';
import { AluCheckbox } from '../src/components/checkbox/checkbox';
import { AluTabs } from '../src/components/tabs/tabs';
import { AluDialog } from '../src/components/dialog/dialog';
import { AluSkeleton } from '../src/components/skeleton/skeleton';
import { AluPagination } from '../src/components/pagination/pagination';
import { AluDataTable } from '../src/components/data-table/data-table';
import { AluCard } from '../src/components/card/card';

// 直接导入各组件类（注册自定义元素 + 导出类）
function defineAll() {
  if (!customElements.get('alu-button')) customElements.define('alu-button', AluButton);
  if (!customElements.get('alu-badge')) customElements.define('alu-badge', AluBadge);
  if (!customElements.get('alu-input')) customElements.define('alu-input', AluInput);
  if (!customElements.get('alu-checkbox')) customElements.define('alu-checkbox', AluCheckbox);
  if (!customElements.get('alu-tabs')) customElements.define('alu-tabs', AluTabs);
  if (!customElements.get('alu-dialog')) customElements.define('alu-dialog', AluDialog);
  if (!customElements.get('alu-skeleton')) customElements.define('alu-skeleton', AluSkeleton);
  if (!customElements.get('alu-pagination')) customElements.define('alu-pagination', AluPagination);
  if (!customElements.get('alu-data-table')) customElements.define('alu-data-table', AluDataTable);
  if (!customElements.get('alu-card')) customElements.define('alu-card', AluCard);
}

describe('component smoke tests（直接导入类注册）', () => {
  it('alu-badge 渲染 variant 类名', () => {
    defineAll();
    const el = document.createElement('alu-badge') as unknown as AluBadge;
    el.setAttribute('variant', 'destructive');
    el.textContent = 'Error';
    document.body.appendChild(el);
    expect(el.shadowRoot!.querySelector('[data-slot=badge]')!.className).toContain('bg-destructive');
  });

  it('alu-input value 双向 + change 事件', () => {
    defineAll();
    const el = document.createElement('alu-input') as unknown as AluInput;
    el.setAttribute('value', 'abc');
    document.body.appendChild(el);
    const input = el.shadowRoot!.querySelector('input')!;
    input.value = 'def';
    input.dispatchEvent(new Event('input'));
    expect(el.getAttribute('value')).toBe('def');
  });

  it('alu-checkbox change 事件 detail.checked', () => {
    defineAll();
    const el = document.createElement('alu-checkbox') as unknown as AluCheckbox;
    el.setAttribute('checked', '');
    document.body.appendChild(el);
    let detail: unknown = null;
    el.addEventListener('change', (e) => (detail = (e as CustomEvent).detail));
    const input = el.shadowRoot!.querySelector('input')!;
    input.dispatchEvent(new Event('change'));
    expect((detail as { checked: boolean }).checked).toBe(true);
  });

  it('alu-tabs 点击 trigger 切换 content', () => {
    defineAll();
    const tabs = document.createElement('alu-tabs') as unknown as AluTabs;
    const list = document.createElement('alu-tabs-list');
    const ta = document.createElement('alu-tabs-trigger');
    ta.setAttribute('value', 'a');
    const tb = document.createElement('alu-tabs-trigger');
    tb.setAttribute('value', 'b');
    list.appendChild(ta);
    list.appendChild(tb);
    const ca = document.createElement('alu-tabs-content');
    ca.setAttribute('value', 'a');
    const cb = document.createElement('alu-tabs-content');
    cb.setAttribute('value', 'b');
    tabs.appendChild(list);
    tabs.appendChild(ca);
    tabs.appendChild(cb);
    document.body.appendChild(tabs);
    tb.dispatchEvent(new Event('click', { bubbles: true }));
    expect(tabs.getAttribute('value')).toBe('b');
    expect((ca as HTMLElement).style.display).toBe('none');
  });

  it('alu-dialog open 属性 + close 事件', () => {
    defineAll();
    const el = document.createElement('alu-dialog') as unknown as AluDialog;
    el.setAttribute('open', 'true');
    document.body.appendChild(el);
    let closed = false;
    el.addEventListener('close', () => (closed = true));
    el.setAttribute('open', 'false');
    expect(closed).toBe(true);
  });

  it('alu-skeleton 渲染类名', () => {
    defineAll();
    const el = document.createElement('alu-skeleton') as unknown as AluSkeleton;
    el.setAttribute('class', 'h-4 w-24');
    document.body.appendChild(el);
    expect(el.shadowRoot!.firstElementChild!.className).toContain('animate-pulse');
  });

  it('alu-pagination page-change 事件', () => {
    defineAll();
    const el = document.createElement('alu-pagination') as unknown as AluPagination;
    el.setAttribute('count', '100');
    el.setAttribute('per-page', '10');
    el.setAttribute('page', '1');
    document.body.appendChild(el);
    let page = 0;
    el.addEventListener('page-change', (e) => (page = (e as CustomEvent).detail.page));
    // 直接调用 _go 模拟翻页（next 按钮 click 在 shadow 内，jsdom 合成事件不穿透）
    (el as unknown as { _go: (p: number) => void })._go(2);
    expect(page).toBe(2);
  });

  it('alu-data-table 渲染 + sort 事件', () => {
    defineAll();
    const el = document.createElement('alu-data-table') as unknown as AluDataTable;
    el.setAttribute('columns', JSON.stringify([{ key: 'name', title: 'Name', sortable: true }]));
    el.setAttribute('data', JSON.stringify([{ name: 'b' }, { name: 'a' }]));
    document.body.appendChild(el);
    let sorted: { key: string; direction: string } | null = null;
    el.addEventListener('sort', (e) => (sorted = (e as CustomEvent).detail));
    // shadow 内 th 的 click 不穿透到宿主（composed 限制），直接触发宿主级排序
    const root = el.shadowRoot!.querySelector('.data-table-container')!;
    const th = root.querySelector('th[data-key=name]')!;
    th.dispatchEvent(new Event('click', { bubbles: true }));
    expect(sorted).toEqual({ key: 'name', direction: 'asc' });
  });

  it('alu-card + 子元素渲染', () => {
    defineAll();
    const el = document.createElement('alu-card') as unknown as AluCard;
    const header = document.createElement('alu-card-header');
    const title = document.createElement('alu-card-title');
    title.textContent = 'T';
    header.appendChild(title);
    el.appendChild(header);
    document.body.appendChild(el);
    expect(el.shadowRoot!.querySelector('[data-slot=card]')).toBeTruthy();
    expect((header as HTMLElement).shadowRoot!.querySelector('div')).toBeTruthy();
  });
});
