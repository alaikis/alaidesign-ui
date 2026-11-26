import { h } from 'vue';
import type { App, Component } from 'vue';
// 导入即注册全部 AlaiDesign 自定义元素（alu-*）
import '@alaikis/alaidesign-ui';

// Vue 桥接：包装已注册的 AlaiDesign 自定义元素为 Vue 组件。
// 真正的组件逻辑在 @alaikis/alaidesign-ui（由 Svelte 源编译），此处仅渲染标签并透传属性/事件/插槽。

export interface AluComponentProps {
	class?: string;
	[key: string]: unknown;
}

// 包装单个自定义元素为 Vue 组件（渲染原生标签，透传 attrs 与默认插槽）
export function aluElement(tag: string): Component {
	return {
		name: tag.replace(/(^|-)(\w)/g, (_m, _p, c: string) => c.toUpperCase()),
		inheritAttrs: true,
		setup(_props, { attrs, slots }) {
			return () =>
				h(
					tag,
					{ ...attrs },
					slots.default ? slots.default() : undefined
				);
		},
	};
}

// 批量导出 wrapper 组件名（供官网代码 tab 展示）
export const ALU_VUE_COMPONENTS: Record<string, string> = {
	'alu-button': 'AluButton',
	'alu-card': 'AluCard',
	'alu-badge': 'AluBadge',
	'alu-input': 'AluInput',
	'alu-checkbox': 'AluCheckbox',
	'alu-tabs': 'AluTabs',
	'alu-skeleton': 'AluSkeleton',
	'alu-tooltip': 'AluTooltip',
	'alu-dialog': 'AluDialog',
	'alu-dropdown-menu': 'AluDropdownMenu',
	'alu-sheet': 'AluSheet',
	'alu-radio-group': 'AluRadioGroup',
	'alu-avatar': 'AluAvatar',
	'alu-data-table': 'AluDataTable',
	'alu-date-picker': 'AluDatePicker',
};

// 便捷函数组件（可直接在模板使用 <AluButton>）
export const AluButton = aluElement('alu-button');
export const AluCard = aluElement('alu-card');
export const AluBadge = aluElement('alu-badge');
export const AluInput = aluElement('alu-input');
export const AluCheckbox = aluElement('alu-checkbox');
export const AluTabs = aluElement('alu-tabs');
export const AluSkeleton = aluElement('alu-skeleton');
export const AluTooltip = aluElement('alu-tooltip');
export const AluDialog = aluElement('alu-dialog');
export const AluDropdownMenu = aluElement('alu-dropdown-menu');
export const AluSheet = aluElement('alu-sheet');
export const AluRadioGroup = aluElement('alu-radio-group');
export const AluAvatar = aluElement('alu-avatar');

// 插件：注册全部 wrapper 组件
export function install(app: App): void {
	app.component('AluButton', AluButton);
	app.component('AluCard', AluCard);
	app.component('AluBadge', AluBadge);
	app.component('AluInput', AluInput);
	app.component('AluCheckbox', AluCheckbox);
	app.component('AluTabs', AluTabs);
	app.component('AluSkeleton', AluSkeleton);
	app.component('AluTooltip', AluTooltip);
	app.component('AluDialog', AluDialog);
	app.component('AluDropdownMenu', AluDropdownMenu);
	app.component('AluSheet', AluSheet);
	app.component('AluRadioGroup', AluRadioGroup);
	app.component('AluAvatar', AluAvatar);
}

export default aluElement;
