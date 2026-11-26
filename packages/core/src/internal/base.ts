// 通用渲染基础：shadow DOM 容器 + token 透传（:host 继承宿主 CSS 变量）。
// 所有组件的 shadow root 通过此基础类挂载，保证 .dark 切换与 token 一致。
export function attachShadowWithTokens(el: HTMLElement): ShadowRoot {
  const shadow = el.shadowRoot ?? el.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = `
    :host {
      display: inline-block;
      --primary: var(--primary, #0052D9);
      --primary-foreground: var(--primary-foreground, #FFFFFF);
      --background: var(--background, #F3F3F3);
      --foreground: var(--foreground, #1F2329);
      --muted: var(--muted, #F5F5F5);
      --muted-foreground: var(--muted-foreground, #5A5E66);
      --card: var(--card, #FFFFFF);
      --card-foreground: var(--card-foreground, #1F2329);
      --border: var(--border, #DCDEE3);
      --secondary: var(--secondary, #F7F7F7);
      --secondary-foreground: var(--secondary-foreground, #1F2329);
      --destructive: var(--destructive, #E5484D);
      --destructive-foreground: var(--destructive-foreground, #FFFFFF);
      --success: var(--success, #00A86B);
      --success-foreground: var(--success-foreground, #FFFFFF);
      --warning: var(--warning, #F5A623);
      --warning-foreground: var(--warning-foreground, #000000);
      --info: var(--info, #0052D9);
      --info-foreground: var(--info-foreground, #FFFFFF);
      --input: var(--input, #FFFFFF);
      --ring: var(--ring, #0052D9);
      --radius: var(--radius, 0.375rem);
    }
  `;
  shadow.appendChild(style);
  return shadow;
}

/** 把子节点（Svelte children 等价物）移入 slot 容器 */
export function ensureSlot(shadow: ShadowRoot, hostEl: HTMLElement): HTMLSlotElement {
  let slot = shadow.querySelector('slot') as HTMLSlotElement | null;
  if (!slot) {
    slot = document.createElement('slot');
    shadow.appendChild(slot);
  }
  return slot;
}

/** 将宿主 light DOM 子节点（用户插入的 <alu-x> 内的 DOM）渲染到 shadow 内 slot 时不需要手动处理，
 *  浏览器原生处理 <slot>。此函数用于在 shadow 内追加固定结构。 */
export function appendNode(shadow: ShadowRoot, node: Node) {
  shadow.appendChild(node);
}

/** 事件桥：把 shadow 内交互元素的 DOM 事件重新分发到宿主（bubbles+composed，跨 shadow 边界） */
export function forwardEvent(hostEl: HTMLElement, source: EventTarget, name: string) {
  source.addEventListener(name, (e: Event) => {
    hostEl.dispatchEvent(
      new CustomEvent(name, {
        detail: e,
        bubbles: true,
        composed: true,
        cancelable: (e as Event).cancelable,
      }),
    );
  });
}
