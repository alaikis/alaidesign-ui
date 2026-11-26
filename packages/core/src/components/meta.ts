/**
 * 组件元数据 — 官网三框架代码 tab 与 wrapper 生成的单一来源。
 * 每个条目对应一个 <alu-*> 自定义元素。
 */
export interface ComponentMeta {
  tag: string;
  /** 默认导出的组件类名（wrapper 侧同名导出） */
  exportName: string;
  /** HTML 属性（Svelte props 的 Web Components 映射） */
  attributes: string[];
  /** 自定义事件（dispatch 到宿主的事件名，原生 click/change/input 不需要列出） */
  events: string[];
  /** 是否有 default slot */
  hasSlot: boolean;
  /** 复合组件的子元素 tag 列表（官网展示组合用法） */
  children?: string[];
}

export const components: ComponentMeta[] = [
  {
    tag: 'alu-button',
    exportName: 'AluButton',
    attributes: ['variant', 'size', 'href', 'disabled'],
    events: [],
    hasSlot: true,
  },
  {
    tag: 'alu-card',
    exportName: 'AluCard',
    attributes: ['class'],
    events: [],
    hasSlot: true,
  },
  {
    tag: 'alu-badge',
    exportName: 'AluBadge',
    attributes: ['variant'],
    events: [],
    hasSlot: true,
  },
  {
    tag: 'alu-input',
    exportName: 'AluInput',
    attributes: ['type', 'value', 'placeholder', 'disabled', 'readonly'],
    events: ['change', 'input'],
    hasSlot: false,
  },
  {
    tag: 'alu-checkbox',
    exportName: 'AluCheckbox',
    attributes: ['checked', 'disabled', 'indeterminate'],
    events: ['change'],
    hasSlot: false,
  },
  {
    tag: 'alu-tabs',
    exportName: 'AluTabs',
    attributes: ['value', 'orientation'],
    events: ['tab-change'],
    hasSlot: true,
    children: ['alu-tabs-list', 'alu-tabs-trigger', 'alu-tabs-content'],
  },
  {
    tag: 'alu-skeleton',
    exportName: 'AluSkeleton',
    attributes: ['class'],
    events: [],
    hasSlot: false,
  },
  {
    tag: 'alu-tooltip',
    exportName: 'AluTooltip',
    attributes: ['content', 'side'],
    events: [],
    hasSlot: true,
  },
  {
    tag: 'alu-dialog',
    exportName: 'AluDialog',
    attributes: ['open'],
    events: ['open', 'close'],
    hasSlot: true,
    children: ['alu-dialog-trigger', 'alu-dialog-content'],
  },
  {
    tag: 'alu-data-table',
    exportName: 'AluDataTable',
    attributes: ['columns', 'data', 'loading', 'pagination', 'row-key'],
    events: ['row-click', 'page-change', 'sort'],
    hasSlot: false,
  },
];
