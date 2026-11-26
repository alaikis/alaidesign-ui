import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 与 Svelte 包 src/lib/internal/util/cn.ts 同一实现（单一视觉来源）
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
