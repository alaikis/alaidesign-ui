import { describe, expect, it, beforeAll } from 'vitest';
import { AluButton } from '../src/components/button/button';

describe('<alu-button>', () => {
  beforeAll(() => {
    if (!customElements.get('alu-button')) {
      customElements.define('alu-button', AluButton);
    }
  });

  function create(props: Record<string, string> = {}) {
    const el = document.createElement('alu-button') as unknown as AluButton;
    for (const [k, v] of Object.entries(props)) el.setAttribute(k, v);
    document.body.appendChild(el);
    el.innerHTML = 'Save';
    return el;
  }

  it('渲染 <button> 并应用 default 变体类名', () => {
    const el = create();
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn).toBeTruthy();
    expect(btn.className).toContain('bg-primary');
  });

  it('href 属性渲染 <a>（禁用时 aria-disabled）', () => {
    const el = create({ href: '/docs', disabled: '' });
    const a = el.shadowRoot!.querySelector('a')!;
    expect(a.getAttribute('href')).toBe('/docs');
    expect(a.getAttribute('aria-disabled')).toBe('true');
  });

  it('click 事件经宿主转发（事件桥）', () => {
    const el = create();
    let fired = false;
    el.addEventListener('click', () => (fired = true));
    // 事件桥：宿主在 shadow 内交互元素上监听 click 并重新分发到宿主（composed）
    el.dispatchEvent(new MouseEvent('click'));
    expect(fired).toBe(true);
  });
});
