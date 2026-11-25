import { View, Text, Pressable, TextInput } from 'react-native';
import type { ThemeTokens, ThemeMode } from '../../src/theme';
import { themeFor } from '../../src/theme';

export type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'default' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  mode?: ThemeMode;
  onPress?: () => void;
  children?: React.ReactNode;
}

// 变体 → token 色映射（与 Web 包 buttonVariants 语义一致）
function variantColors(variant: ButtonVariant, t: ThemeTokens): { bg: string; fg: string; border?: string } {
  switch (variant) {
    case 'default':
      return { bg: t.colorPrimary, fg: t.colorPrimaryForeground };
    case 'outline':
      return { bg: t.colorBackground, fg: t.colorCard === '#FFFFFF' ? t.colorMutedForeground : t.colorMutedForeground, border: t.colorBorder };
    case 'secondary':
      return { bg: t.colorMuted, fg: t.colorMutedForeground };
    case 'ghost':
      return { bg: 'transparent', fg: t.colorMutedForeground };
    case 'destructive':
      return { bg: t.colorDestructive, fg: t.colorPrimaryForeground };
    case 'link':
      return { bg: 'transparent', fg: t.colorPrimary };
  }
}

const sizeMap: Record<ButtonSize, number> = { xs: 28, sm: 32, default: 36, lg: 40 };

export function Button({ variant = 'default', size = 'default', disabled, mode = 'light', onPress, children }: ButtonProps) {
  const t = themeFor(mode);
  const c = variantColors(variant, t);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        height: sizeMap[size],
        paddingHorizontal: 10,
        borderRadius: t.radius,
        backgroundColor: c.bg,
        borderColor: c.border ?? 'transparent',
        borderWidth: c.border ? 1 : 0,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
      }}>
      <Text style={{ color: c.fg, fontSize: size === 'xs' ? 12 : size === 'sm' ? 13 : 14, fontWeight: 500 }}>
        {children}
      </Text>
    </Pressable>
  );
}

export interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline';
  mode?: ThemeMode;
  children?: React.ReactNode;
}
export function Badge({ variant = 'default', mode = 'light', children }: BadgeProps) {
  const t = themeFor(mode);
  const map: Record<BadgeProps['variant'], { bg: string; fg: string }> = {
    default: { bg: t.colorPrimary, fg: t.colorPrimaryForeground },
    secondary: { bg: t.colorMuted, fg: t.colorMutedForeground },
    destructive: { bg: t.colorDestructive, fg: t.colorPrimaryForeground },
    success: { bg: t.colorSuccess, fg: t.colorPrimaryForeground },
    warning: { bg: t.colorWarning, fg: '#000000' },
    outline: { bg: t.colorCard, fg: t.colorMutedForeground },
  };
  const c = map[variant];
  return (
    <View
      style={{
        backgroundColor: c.bg,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: t.colorBorder,
      }}>
      <Text style={{ color: c.fg, fontSize: 11, fontWeight: 500 }}>{children}</Text>
    </View>
  );
}

export interface CardProps {
  mode?: ThemeMode;
  style?: any;
  children?: React.ReactNode;
}
export function Card({ mode = 'light', style, children }: CardProps) {
  const t = themeFor(mode);
  return (
    <View style={[{ backgroundColor: t.colorCard, borderColor: t.colorBorder, borderWidth: 1, borderRadius: 8 }, style]}>
      {children}
    </View>
  );
}
export function CardHeader({ children, style }: { children?: React.ReactNode; style?: any }) {
  return <View style={[{ padding: 16, gap: 6 }, style]}>{children}</View>;
}
export function CardTitle({ children, style }: { children?: React.ReactNode; style?: any }) {
  return <Text style={[{ fontSize: 16, fontWeight: 600 }, style]}>{children}</Text>;
}
export function CardDescription({ children, style }: { children?: React.ReactNode; style?: any }) {
  return <Text style={[{ fontSize: 13, color: '#5A5E66' }, style]}>{children}</Text>;
}
export function CardContent({ children, style }: { children?: React.ReactNode; style?: any }) {
  return <View style={[{ padding: 16, paddingTop: 0 }, style]}>{children}</View>;
}
export function CardFooter({ children, style }: { children?: React.ReactNode; style?: any }) {
  return <View style={[{ padding: 16, paddingTop: 0, flexDirection: 'row' }, style]}>{children}</View>;
}

export interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  mode?: ThemeMode;
}
export function Input({ placeholder, value, onChange, disabled, mode = 'light' }: InputProps) {
  const t = themeFor(mode);
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={t.colorMutedForeground}
      value={value}
      onChangeText={onChange}
      disabled={disabled}
      style={{
        height: 36,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: t.colorBorder,
        backgroundColor: t.colorCard,
        paddingHorizontal: 12,
        color: t.colorMutedForeground,
        opacity: disabled ? 0.5 : 1,
      }}
    />
  );
}

export interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  mode?: ThemeMode;
}
export function Checkbox({ checked, indeterminate, disabled, onChange, label, mode = 'light' }: CheckboxProps) {
  const t = themeFor(mode);
  const boxBg = checked ? t.colorPrimary : t.colorCard;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!checked, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8, opacity: disabled ? 0.5 : 1 }}>
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: t.colorPrimary,
          backgroundColor: boxBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {checked && <Text style={{ color: t.colorPrimaryForeground, fontSize: 11, lineHeight: 12 }}>✓</Text>}
        {indeterminate && <View style={{ width: 10, height: 2, backgroundColor: t.colorPrimaryForeground }} />}
      </View>
      {label ? <Text style={{ color: t.colorMutedForeground, fontSize: 14 }}>{label}</Text> : null}
    </Pressable>
  );
}
