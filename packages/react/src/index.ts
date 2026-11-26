import React, { forwardRef, useRef, useEffect } from 'react';
// 导入即注册全部 AlaiDesign 自定义元素（alu-*）
import '@alaikis/alaidesign-ui';

// React wrapper 基础：将 AlaiDesign Web Components 包装为 React 组件。
// 事件桥：onXxx props → useRef + useEffect addEventListener（零额外依赖）。
// 每个 wrapper 组件 = forwardRef 函数 + 属性透传 + 事件监听。

export interface AluEventProps {
  onClick?: (e: Event) => void;
  onChange?: (e: Event) => void;
  onInput?: (e: Event) => void;
  onOpen?: (e: Event) => void;
  onClose?: (e: Event) => void;
  onSelect?: (e: Event) => void;
  onTabChange?: (e: Event) => void;
  onPageChange?: (e: Event) => void;
  onSort?: (e: Event) => void;
  onRowClick?: (e: Event) => void;
  onValueChange?: (e: Event) => void;
  onSearch?: (e: Event) => void;
  onRetry?: (e: Event) => void;
  onAction?: (e: Event) => void;
  onSecondaryAction?: (e: Event) => void;
  onShow?: (e: Event) => void;
  onHide?: (e: Event) => void;
  onDismiss?: (e: Event) => void;
  onReset?: (e: Event) => void;
  [key: `on${string}`]: ((e: Event) => void) | undefined;
}

export interface AluBaseProps extends AluEventProps {
  class?: string;
  children?: React.ReactNode;
  [attr: string]: unknown;
}

// 包装单个自定义元素为 React 组件
export function aluComponent(tag: string, events: string[] = []) {
  const Component = forwardRef<HTMLElement, AluBaseProps>(function AluComponent(props, ref) {
    const elRef = useRef<HTMLElement | null>(null);
    const setRef = (el: HTMLElement | null) => {
      (elRef as { current: HTMLElement | null }).current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) (ref as { current: HTMLElement | null }).current = el;
    };

    useEffect(() => {
      const el = elRef.current;
      if (!el) return;
      const listeners: Array<() => void> = [];
      for (const eventName of events) {
        const handler = (props as Record<string, unknown>)[`on${cap(eventName)}`];
        if (typeof handler === 'function') {
          const fn = handler as EventListener;
          el.addEventListener(eventName, fn);
          listeners.push(() => el.removeEventListener(eventName, fn));
        }
      }
      return () => listeners.forEach((fn) => fn());
    });

    const { class: className, children, ...rest } = props;
    const attrs: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) {
      if (k.startsWith('on') || v === undefined || v === null || v === false) continue;
      attrs[k.replace(/([A-Z])/g, '-$1').toLowerCase()] = v === true ? '' : v;
    }
    if (className) attrs.class = className;

    return React.createElement(tag, { ...attrs, ref: setRef }, children as React.ReactNode);
  });
  Component.displayName = `Alu${tag.replace('alu-', '')}`;
  return Component;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// 便捷：常用组件 wrapper
export const AluButton = aluComponent('alu-button', ['click']);
export const AluCard = aluComponent('alu-card');
export const AluBadge = aluComponent('alu-badge');
export const AluInput = aluComponent('alu-input', ['change', 'input']);
export const AluCheckbox = aluComponent('alu-checkbox', ['change']);
export const AluTabs = aluComponent('alu-tabs', ['tab-change']);
export const AluSkeleton = aluComponent('alu-skeleton');
export const AluTooltip = aluComponent('alu-tooltip', ['show', 'hide']);
export const AluDialog = aluComponent('alu-dialog', ['open', 'close']);
export const AluDataTable = aluComponent('alu-data-table', ['row-click', 'page-change', 'sort']);

export const ALU_REACT_COMPONENTS: Record<string, string> = {
  'alu-button': 'AluButton',
  'alu-card': 'AluCard',
  'alu-badge': 'AluBadge',
  'alu-input': 'AluInput',
  'alu-checkbox': 'AluCheckbox',
  'alu-tabs': 'AluTabs',
  'alu-skeleton': 'AluSkeleton',
  'alu-tooltip': 'AluTooltip',
  'alu-dialog': 'AluDialog',
  'alu-data-table': 'AluDataTable',
};

export default aluComponent;
