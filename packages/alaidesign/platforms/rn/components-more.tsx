// React Native 组件族（续）— 导航/反馈/数据/高级
// 接 platforms/rn/components.tsx 已建高频组件（Button/Badge/Card/Input/Checkbox），本文件补全其余族。
import React from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Modal,
  Image,
  Platform,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import type { ThemeTokens, ThemeMode } from '../../src/theme';
import { themeFor } from '../../src/theme';

type Mode = ThemeMode;
const use = (mode: Mode = 'light') => themeFor(mode);

// ==================== 导航 ====================

export interface TabsProps<T extends string = string> {
  value: T;
  onChange?: (v: T) => void;
  items: Array<{ key: T; label: string; content?: React.ReactNode }>;
  variant?: 'default' | 'line';
  mode?: Mode;
}
export function Tabs<T extends string>({ value, onChange, items, variant = 'default', mode = 'light' }: TabsProps<T>) {
  const t = use(mode);
  const active = items.find((i) => i.key === value);
  return (
    <View style={{ gap: 8 }}>
      <View
        style={{
          flexDirection: 'row',
          gap: 4,
          padding: 3,
          borderRadius: t.radius,
          backgroundColor: variant === 'default' ? t.colorMuted : 'transparent',
          borderColor: t.colorBorder,
          borderWidth: variant === 'line' ? 1 : 0,
          borderStyle: 'solid',
        }}>
        {items.map((it) => {
          const on = it.key === value;
          return (
            <Pressable
              key={it.key}
              onPress={() => onChange?.(it.key)}
              style={{
                flex: 1,
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: t.radius,
                alignItems: 'center',
                backgroundColor: on && variant === 'default' ? t.colorCard : 'transparent',
                shadowOpacity: on && variant === 'default' ? 0.1 : 0,
                shadowRadius: 2,
                shadowColor: '#000',
                elevation: on && variant === 'default' ? 1 : 0,
              }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: on ? t.colorMutedForeground : t.colorMutedForeground,
                  opacity: on ? 1 : 0.6,
                }}>
                {it.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View>{active?.content}</View>
    </View>
  );
}

export interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
  mode?: Mode;
}
export function Breadcrumb({ items, mode = 'light' }: BreadcrumbProps) {
  const t = use(mode);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {i > 0 && <Text style={{ color: t.colorMutedForeground, fontSize: 12 }}>›</Text>}
          <Text
            style={{
              fontSize: 13,
              color: i === items.length - 1 ? t.colorMutedForeground : t.colorMutedForeground,
              fontWeight: i === items.length - 1 ? 500 : 400,
            }}>
            {it.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export interface PaginationProps {
  total: number;
  pageSize?: number;
  page?: number;
  onChange?: (page: number) => void;
  siblingCount?: number;
  mode?: Mode;
}
export function Pagination({ total, pageSize = 10, page = 1, onChange, siblingCount = 1, mode = 'light' }: PaginationProps) {
  const t = use(mode);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pages: number[] = [];
  const start = Math.max(2, Math.min(page - siblingCount, total - 2 * siblingCount));
  const end = Math.min(total - 1, page + siblingCount);
  pages.push(1);
  if (start > 2) pages.push(-1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push(-2);
  if (total > 1) pages.push(total);

  const btn = (label: string, onPress?: () => void, disabled = false) => (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={{
        minWidth: 32,
        height: 32,
        borderRadius: t.radius,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
        backgroundColor: t.colorCard,
      }}>
      <Text style={{ fontSize: 13, color: t.colorMutedForeground }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      {btn('‹', () => onChange?.(page > 1 ? page - 1 : totalPages), page <= 1)}
      {pages.map((p, i) =>
        p < 0 ? (
          <Text key={`e${i}`} style={{ color: t.colorMutedForeground, fontSize: 13, paddingHorizontal: 4 }}>
            …
          </Text>
        ) : (
          <Pressable
            key={`p${p}`}
            onPress={() => onChange?.(p)}
            style={{
              minWidth: 32,
              height: 32,
              borderRadius: t.radius,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: p === page ? t.colorPrimary : 'transparent',
              borderColor: p === page ? 'transparent' : t.colorBorder,
              borderWidth: p === page ? 0 : 1,
            }}>
            <Text
              style={{
                fontSize: 13,
                color: p === page ? t.colorPrimaryForeground : t.colorMutedForeground,
                fontWeight: p === page ? 600 : 400,
              }}>
              {p}
            </Text>
          </Pressable>
        ),
      )}
      {btn('›', () => onChange?.(page < totalPages ? page + 1 : 1), page >= totalPages)}
    </View>
  );
}

// ==================== 反馈 ====================

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  mode?: Mode;
}
export function Dialog({ open, onClose, title, description, children, mode = 'light' }: DialogProps) {
  const t = use(mode);
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }} onLayout={() => {}}>
        <View
          style={{
            width: '80%',
            maxWidth: 448,
            backgroundColor: t.colorCard,
            borderRadius: t.radius,
            padding: 24,
            gap: 16,
            borderColor: t.colorBorder,
            borderWidth: 1,
          }}>
          {title ? <Text style={{ fontSize: 18, fontWeight: 600, color: t.colorMutedForeground }}>{title}</Text> : null}
          {description ? <Text style={{ fontSize: 13, color: t.colorMutedForeground }}>{description}</Text> : null}
          <View>{children}</View>
          <Pressable onPress={onClose} style={{ alignSelf: 'flex-end' }}>
            <Text style={{ fontSize: 16, color: t.colorMutedForeground }}>×</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export interface SheetProps {
  open: boolean;
  side?: 'left' | 'right' | 'top' | 'bottom';
  onClose?: () => void;
  title?: string;
  children?: React.ReactNode;
  mode?: Mode;
}
export function Sheet({ open, side = 'right', onClose, title, children, mode = 'light' }: SheetProps) {
  const t = use(mode);
  if (!open) return null;
  const align: any =
    side === 'right' ? { alignItems: 'flex-end' } : side === 'left' ? { alignItems: 'flex-start' } : side === 'bottom' ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' };
  const size: any =
    side === 'right' || side === 'left'
      ? { width: '75%', height: '100%' }
      : side === 'top' || side === 'bottom'
        ? { width: '100%', height: 'auto' }
        : {};
  return (
    <Modal visible={open} transparent animationType="slide">
      <View style={[{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }, align]}>
        <View
          style={[
            size,
            {
              backgroundColor: t.colorCard,
              borderColor: t.colorBorder,
              borderWidth: 1,
              padding: 24,
              gap: 16,
              borderEndWidth: side === 'right' ? 1 : 0,
              borderStartWidth: side === 'left' ? 1 : 0,
            },
          ]}>
          {title ? <Text style={{ fontSize: 16, fontWeight: 600, color: t.colorMutedForeground }}>{title}</Text> : null}
          <View style={{ flex: 1 }}>{children}</View>
          <Pressable onPress={onClose}>
            <Text style={{ fontSize: 13, color: t.colorMutedForeground }}>关闭</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export interface TooltipProps {
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  mode?: Mode;
}
export function Tooltip({ content, side = 'top', children, mode = 'light' }: TooltipProps) {
  const t = use(mode);
  const [show, setShow] = React.useState(false);
  const timer = React.useRef<any>(null);
  const onIn = () => {
    timer.current && clearTimeout(timer.current);
    setShow(true);
  };
  const onOut = () => {
    timer.current = setTimeout(() => setShow(false), 100);
  };
  return (
    <View style={{ position: 'relative' }} onLayout={() => {}}>
      <Pressable onLongPress={onIn} onStartShouldSetResponder={() => { onIn(); return true; }} onResponderRelease={onOut}>
        {children}
      </Pressable>
      {show && (
        <View
          style={{
            position: 'absolute',
            top: side === 'bottom' ? '100%' : -8,
            left: 0,
            right: 0,
            backgroundColor: t.colorPrimary,
            borderRadius: t.radius,
            padding: 6,
            marginTop: side === 'bottom' ? 8 : 0,
            marginBottom: side === 'top' ? 8 : 0,
            alignItems: 'center',
            zIndex: 50,
          }}>
          <Text style={{ fontSize: 12, color: t.colorPrimaryForeground }}>{content}</Text>
        </View>
      )}
    </View>
  );
}

export interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  description: string;
  duration?: number;
  mode?: Mode;
}
export function Toast({ type = 'info', description, duration = 3000, mode = 'light' }: ToastProps) {
  const t = use(mode);
  const [visible, setVisible] = React.useState(false);
  const colors: Record<string, { bg: string; fg: string }> = {
    success: { bg: t.colorSuccess, fg: t.colorPrimaryForeground },
    error: { bg: t.colorDestructive, fg: t.colorPrimaryForeground },
    warning: { bg: t.colorWarning, fg: '#000' },
    info: { bg: t.colorInfo, fg: t.colorPrimaryForeground },
  };
  React.useEffect(() => {
    setVisible(true);
    const id = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(id);
  }, []);
  if (!visible) return null;
  const c = colors[type];
  return (
    <View style={{ position: 'absolute', top: 16, right: 16, zIndex: 9999, maxWidth: 384 }}>
      <View style={{ backgroundColor: c.bg, borderRadius: t.radius, padding: 16, flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: 500, color: c.fg }}>{description}</Text>
        </View>
      </View>
    </View>
  );
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  secondaryLabel?: string;
  onAction?: () => void;
  onSecondary?: () => void;
  mode?: Mode;
}
export function EmptyState({ title, description, actionLabel, secondaryLabel, onAction, onSecondary, mode = 'light' }: EmptyStateProps) {
  const t = use(mode);
  return (
    <View style={{ alignItems: 'center', paddingVertical: 64, paddingHorizontal: 16 }}>
      <View style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: t.colorMuted, marginBottom: 16, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 28, opacity: 0.5 }}>📭</Text>
      </View>
      <Text style={{ fontSize: 18, fontWeight: 600, color: t.colorMutedForeground, marginBottom: 8 }}>{title}</Text>
      {description ? <Text style={{ fontSize: 13, color: t.colorMutedForeground, marginBottom: 24 }}>{description}</Text> : null}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {actionLabel ? (
          <Pressable onPress={onAction} style={{ backgroundColor: t.colorPrimary, borderRadius: t.radius, paddingHorizontal: 16, paddingVertical: 8 }}>
            <Text style={{ color: t.colorPrimaryForeground, fontSize: 13, fontWeight: 500 }}>{actionLabel}</Text>
          </Pressable>
        ) : null}
        {secondaryLabel ? (
          <Pressable onPress={onSecondary} style={{ borderColor: t.colorBorder, borderWidth: 1, borderRadius: t.radius, paddingHorizontal: 16, paddingVertical: 8 }}>
            <Text style={{ color: t.colorMutedForeground, fontSize: 13 }}>{secondaryLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  mode?: Mode;
}
export function ErrorState({ title = '加载失败', message = '请重试', onRetry, mode = 'light' }: ErrorStateProps) {
  const t = use(mode);
  return (
    <View style={{ alignItems: 'center', paddingVertical: 64, paddingHorizontal: 16 }}>
      <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: '#fdecec', marginBottom: 16, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 28 }}>⚠️</Text>
      </View>
      <Text style={{ fontSize: 18, fontWeight: 600, color: t.colorMutedForeground, marginBottom: 8 }}>{title}</Text>
      <Text style={{ fontSize: 13, color: t.colorMutedForeground, marginBottom: 24 }}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={{ borderColor: t.colorBorder, borderWidth: 1, borderRadius: t.radius, paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text style={{ color: t.colorMutedForeground, fontSize: 13 }}>重试</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export interface SwitchProps {
  value?: boolean;
  onValueChange?: (v: boolean) => void;
  disabled?: boolean;
  mode?: Mode;
}
export function Switch({ value, onValueChange, disabled, mode = 'light' }: SwitchProps) {
  const t = use(mode);
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: !!value, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onValueChange?.(!value)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        backgroundColor: value ? t.colorPrimary : t.colorInput,
        opacity: disabled ? 0.5 : 1,
        justifyContent: 'center',
        paddingHorizontal: 2,
      }}>
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: '#fff',
          transform: [{ translateX: value ? 16 : 0 }],
        }}
      />
    </Pressable>
  );
}

// ==================== 数据 ====================

export interface DataTableProps<T extends Record<string, unknown> = any> {
  columns: Array<{ key: string; title: string; sortable?: boolean; align?: 'left' | 'center' | 'right' }>;
  data: T[];
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (row: T) => void;
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
  pagination?: { total: number; pageSize?: number; page?: number };
  mode?: Mode;
}
export function DataTable<T extends Record<string, unknown> = any>({
  columns,
  data,
  loading,
  emptyText = '暂无数据',
  onRowClick,
  onSort,
  pagination,
  mode = 'light',
}: DataTableProps<T>) {
  const t = use(mode);
  return (
    <View style={{ borderRadius: t.radius, borderColor: t.colorBorder, borderWidth: 1, backgroundColor: t.colorCard, overflow: 'hidden' }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={{ flexDirection: 'row', backgroundColor: t.colorMuted, borderBottomColor: t.colorBorder, borderBottomWidth: 1 }}>
            {columns.map((c) => (
              <Pressable
                key={c.key}
                onPress={c.sortable ? () => onSort?.(c.key, 'asc') : undefined}
                style={{ paddingVertical: 16, paddingHorizontal: 24, minWidth: 120 }}>
                <Text style={{ fontSize: 16, fontWeight: 700, color: t.colorMutedForeground }}>{c.title}</Text>
              </Pressable>
            ))}
          </View>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <View key={i} style={{ flexDirection: 'row', borderBottomColor: t.colorBorder, borderBottomWidth: 1 }}>
                  {columns.map((c) => (
                    <View key={c.key} style={{ paddingVertical: 20, paddingHorizontal: 24, minWidth: 120 }}>
                      <Animated.View
                        style={{ height: 18, borderRadius: 6, backgroundColor: t.colorMuted, opacity: 0.6 }} />
                    </View>
                  ))}
                </View>
              ))
            : data.length === 0
              ? (
                  <View style={{ paddingVertical: 64, alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: 600, color: t.colorMutedForeground }}>{emptyText}</Text>
                  </View>
                )
              : data.map((row, ri) => (
                  <Pressable
                    key={ri}
                    onPress={() => onRowClick?.(row)}
                    style={{ flexDirection: 'row', borderBottomColor: t.colorBorder, borderBottomWidth: 1, backgroundColor: t.colorCard }}>
                    {columns.map((c) => (
                      <View key={c.key} style={{ paddingVertical: 20, paddingHorizontal: 24, minWidth: 120 }}>
                        <Text style={{ fontSize: 14, color: t.colorMutedForeground }}>{String((row as any)[c.key] ?? '')}</Text>
                      </View>
                    ))}
                  </Pressable>
                ))}
        </View>
      </ScrollView>
      {pagination && pagination.total > 0 ? <View style={{ padding: 16, backgroundColor: t.colorMuted }} /> : null}
    </View>
  );
}

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  mode?: Mode;
}
export function Skeleton({ width = '100%', height = 16, radius, mode = 'light' }: SkeletonProps) {
  const t = use(mode);
  const opacity = React.useRef(new Animated.Value(0.4)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return <Animated.View style={{ width, height, borderRadius: radius ?? t.radius, backgroundColor: t.colorMuted, opacity }} />;
}

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  clearable?: boolean;
  loading?: boolean;
  mode?: Mode;
}
export function SearchBar({ placeholder = '搜索…', value, onChange, clearable, loading, mode = 'light' }: SearchBarProps) {
  const t = use(mode);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: t.radius,
        borderColor: t.colorBorder,
        borderWidth: 1,
        backgroundColor: t.colorCard,
        paddingHorizontal: 14,
      }}>
      <Text style={{ fontSize: 16, marginRight: 8 }}>{loading ? '↻' : '🔍'}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={t.colorMutedForeground}
        value={value}
        onChangeText={onChange}
        style={{ flex: 1, height: 36, color: t.colorMutedForeground, fontSize: 14 }}
      />
      {clearable && value ? (
        <Pressable onPress={() => onChange?.('')}>
          <Text style={{ fontSize: 14, color: t.colorMutedForeground }}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ==================== 高级 ====================

export interface DatePickerProps {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  mode?: Mode;
}
export function DatePicker({ value, onChange, placeholder = 'YYYY-MM-DD', mode = 'light' }: DatePickerProps) {
  const t = use(mode);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 36, borderRadius: t.radius, borderColor: t.colorBorder, borderWidth: 1, backgroundColor: t.colorCard, paddingHorizontal: 12 }}>
      <Text style={{ fontSize: 14 }}>{'📅'}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={t.colorMutedForeground}
        value={value}
        onChangeText={onChange}
        style={{ flex: 1, color: t.colorMutedForeground, fontSize: 14 }}
      />
    </View>
  );
}

export interface SignaturePadProps {
  width?: number;
  height?: number;
  onChange?: (dataUrl?: string) => void;
  mode?: Mode;
}
// 手写签名需 canvas；RN 用 react-native-svg / 第三方 canvas，此处占位 + 事件
export function SignaturePad({ width = 300, height = 150, onChange, mode = 'light' }: SignaturePadProps) {
  const t = use(mode);
  return (
    <View
      style={{
        width,
        height,
        borderRadius: t.radius,
        borderColor: t.colorBorder,
        borderWidth: 2,
        backgroundColor: t.colorCard,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ color: t.colorMutedForeground, fontSize: 14 }}>签名区（需 canvas 实现）</Text>
    </View>
  );
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: string;
  actions?: React.ReactNode;
  mode?: Mode;
}
export function PageHeader({ title, description, icon, actions, mode = 'light' }: PageHeaderProps) {
  const t = use(mode);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        {icon ? (
          <View style={{ width: 48, height: 48, borderRadius: t.radius, backgroundColor: t.colorPrimary + '1A', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20 }}>{icon}</Text>
          </View>
        ) : null}
        <View>
          <Text style={{ fontSize: 24, fontWeight: 700, color: t.colorMutedForeground }}>{title}</Text>
          {description ? <Text style={{ fontSize: 13, color: t.colorMutedForeground, marginTop: 4 }}>{description}</Text> : null}
        </View>
      </View>
      <View>{actions}</View>
    </View>
  );
}

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  children?: React.ReactNode;
  mode?: Mode;
}
export function FormField({ label, required, helperText, error, children, mode = 'light' }: FormFieldProps) {
  const t = use(mode);
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text style={{ fontSize: 14, fontWeight: 500, color: t.colorMutedForeground }}>
          {label}
          {required ? <Text style={{ color: t.colorDestructive }}> *</Text> : null}
        </Text>
      ) : null}
      <View>{children}</View>
      {error ? <Text style={{ fontSize: 12, color: t.colorDestructive }}>{error}</Text> : helperText ? <Text style={{ fontSize: 12, color: t.colorMutedForeground }}>{helperText}</Text> : null}
    </View>
  );
}

export interface RadioGroupProps {
  value?: string;
  onChange?: (v: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  disabled?: boolean;
  mode?: Mode;
}
export function RadioGroup({ value, onChange, options, disabled, mode = 'light' }: RadioGroupProps) {
  const t = use(mode);
  return (
    <View style={{ gap: 8 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            disabled={disabled || o.disabled}
            onPress={() => onChange?.(o.value)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, opacity: disabled ? 0.5 : 1 }}>
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: t.colorPrimary,
                backgroundColor: on ? t.colorPrimary : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {on && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.colorPrimaryForeground }} />}
            </View>
            <Text style={{ fontSize: 14, color: t.colorMutedForeground }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export interface SelectProps {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  mode?: Mode;
}
export function Select({ value, onChange, placeholder, options, disabled, mode = 'light' }: SelectProps) {
  const t = use(mode);
  return (
    <View style={{ position: 'relative' }}>
      <Pressable
        disabled={disabled}
        onPress={() => {
          // RN 无原生 select；这里触发 onChange 占位（实际需 Modal 选项列表）
        }}
        style={{
          height: 36,
          borderRadius: t.radius,
          borderColor: t.colorBorder,
          borderWidth: 1,
          backgroundColor: t.colorCard,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          opacity: disabled ? 0.5 : 1,
        }}>
        <Text style={{ fontSize: 14, color: t.colorMutedForeground }}>
          {options.find((o) => o.value === value)?.label ?? placeholder ?? ''}
        </Text>
        <Text style={{ color: t.colorMutedForeground }}>▾</Text>
      </Pressable>
    </View>
  );
}

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  mode?: Mode;
}
export function Separator({ orientation = 'horizontal', mode = 'light' }: SeparatorProps) {
  const t = use(mode);
  return (
    <View
      style={
        orientation === 'vertical'
          ? { width: 1, height: '100%', backgroundColor: t.colorBorder }
          : { height: 1, width: '100%', backgroundColor: t.colorBorder }
      }
    />
  );
}

export interface AvatarProps {
  src?: string;
  fallback?: string;
  size?: 'sm' | 'default' | 'lg';
  mode?: Mode;
}
export function Avatar({ src, fallback, size = 'default', mode = 'light' }: AvatarProps) {
  const t = use(mode);
  const dim = size === 'sm' ? 24 : size === 'lg' ? 40 : 32;
  const [failed, setFailed] = React.useState(false);
  if (src && !failed) {
    return (
      <Image
        source={{ uri: src }}
        style={{ width: dim, height: dim, borderRadius: dim / 2 }}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <View
      style={{
        width: dim,
        height: dim,
        borderRadius: dim / 2,
        backgroundColor: t.colorMuted,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ fontSize: dim / 3, color: t.colorMutedForeground, fontWeight: 500 }}>{fallback}</Text>
    </View>
  );
}

export interface TextareaProps {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  mode?: Mode;
}
export function Textarea({ value, onChange, placeholder, disabled, mode = 'light' }: TextareaProps) {
  const t = use(mode);
  return (
    <TextInput
      multiline
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={t.colorMutedForeground}
      editable={!disabled}
      style={{
        minHeight: 60,
        borderRadius: t.radius,
        borderColor: t.colorBorder,
        borderWidth: 1,
        backgroundColor: t.colorCard,
        padding: 12,
        color: t.colorMutedForeground,
        fontSize: 14,
        opacity: disabled ? 0.5 : 1,
      }}
    />
  );
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: Array<{ label: string; destructive?: boolean; onSelect?: () => void }>;
  mode?: Mode;
}
export function DropdownMenu({ trigger, items, mode = 'light' }: DropdownMenuProps) {
  const t = use(mode);
  const [open, setOpen] = React.useState(false);
  return (
    <View style={{ position: 'relative' }}>
      <Pressable onPress={() => setOpen(!open)}>{trigger}</Pressable>
      {open && (
        <View
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: t.colorCard,
            borderColor: t.colorBorder,
            borderWidth: 1,
            borderRadius: t.radius,
            padding: 4,
            elevation: 4,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 8,
            zIndex: 50,
          }}>
          {items.map((it, i) => (
            <Pressable
              key={i}
              onPress={() => {
                setOpen(false);
                it.onSelect?.();
              }}
              style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: t.radius }}>
              <Text style={{ fontSize: 13, color: it.destructive ? t.colorDestructive : t.colorMutedForeground }}>{it.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
