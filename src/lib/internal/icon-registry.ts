// 统一图标包：@lucide/svelte。按名称映射到常用图标组件（离线、可 tree-shake，无运行时网络）。
import ChevronRight from '@lucide/svelte/icons/chevron-right';
import ChevronUp from '@lucide/svelte/icons/chevron-up';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
import Inbox from '@lucide/svelte/icons/inbox';
import RefreshCw from '@lucide/svelte/icons/refresh-cw';
import LoaderCircle from '@lucide/svelte/icons/loader-circle';
import Search from '@lucide/svelte/icons/search';
import X from '@lucide/svelte/icons/x';
import CircleCheck from '@lucide/svelte/icons/circle-check';
import CircleExclamationPoint from '@lucide/svelte/icons/circle-exclamation-point';
import TriangleExclamationPoint from '@lucide/svelte/icons/triangle-exclamation-point';
import Info from '@lucide/svelte/icons/info';
import Package from '@lucide/svelte/icons/package';
import Truck from '@lucide/svelte/icons/truck';
import FileText from '@lucide/svelte/icons/file-text';
import Check from '@lucide/svelte/icons/check';
import Circle from '@lucide/svelte/icons/circle';

export const iconRegistry: Record<string, any> = {
	'chevron-right': ChevronRight,
	'chevron-up': ChevronUp,
	'chevron-down': ChevronDown,
	'chevrons-up-down': ChevronsUpDown,
	inbox: Inbox,
	'refresh-cw': RefreshCw,
	'loader-2': LoaderCircle,
	'loader-circle': LoaderCircle,
	search: Search,
	x: X,
	'check-circle': CircleCheck,
	'circle-check': CircleCheck,
	'alert-circle': CircleExclamationPoint,
	'circle-alert': CircleExclamationPoint,
	'circle-exclamation-point': CircleExclamationPoint,
	'alert-triangle': TriangleExclamationPoint,
	'triangle-alert': TriangleExclamationPoint,
	'triangle-exclamation-point': TriangleExclamationPoint,
	info: Info,
	package: Package,
	truck: Truck,
	'file-text': FileText,
	check: Check,
	circle: Circle,
};

export function resolveIcon(name: string | undefined | null): any {
	if (!name) return iconRegistry.circle;
	const key = String(name).replace(/^lucide:/, '').trim();
	return iconRegistry[key] ?? iconRegistry.circle;
}
