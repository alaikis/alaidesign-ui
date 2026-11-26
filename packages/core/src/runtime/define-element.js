// AlaiDesign Web Components 运行时适配器
// 用 Svelte 官方 create_custom_element 注册自定义元素（light DOM + default slot），
// 并在其上桥接“回调 prop → 文档承诺的 DOM CustomEvent”。
import { create_custom_element } from 'svelte/internal/client';

/**
 * @param {string} tag 自定义元素标签名（alu-*）
 * @param {any} Component 编译后的 Svelte 组件（普通模式）
 * @param {{ props?: string[], eventBindings?: Array<{ prop: string, handle: (...a:any[]) => Array<[string, any]> | null | undefined }> }} opts
 */
export function defineElement(tag, Component, opts = {}) {
  const { props = [], eventBindings = [] } = opts;

  /** @type {Record<string, any>} */
  const props_definition = {};
  const toKebab = (s) => s.replace(/([A-Z])/g, '-$1').toLowerCase();
  for (const p of props) {
    // camelCase 业务属性映射为 kebab-case HTML 属性（如 perPage → per-page、helperText → helper-text），
    // 与文档/示例中的属性写法一致；回调(on*) 仅作为 JS property，不暴露为属性。
    props_definition[p] = /[A-Z]/.test(p) && !p.startsWith('on') ? { attribute: toKebab(p) } : {};
  }
  // 回调 prop 也注册为元素属性（JS property），便于桥接与外部赋值
  for (const b of eventBindings) if (!props_definition[b.prop]) props_definition[b.prop] = {};

  const Class = create_custom_element(Component, props_definition, ['default'], [], undefined, (Base) =>
    class extends Base {
      connectedCallback() {
        for (const b of eventBindings) {
          this[b.prop] = (...args) => {
            let out;
            try {
              out = b.handle(...args);
            } catch {
              out = null;
            }
            if (!out) return;
            for (const [name, detail] of out) {
              this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
            }
          };
        }
        return super.connectedCallback();
      }
    }
  );

  if (typeof customElements !== 'undefined' && !customElements.get(tag)) {
    customElements.define(tag, Class);
  }
  return Class;
}
