// AlaiDesign Flutter 设计 token（与 Web tokens.css 同源）
import 'dart:ui';

class AlaiThemeTokens {
  final Color primary;
  final Color primaryForeground;
  final Color background;
  final Color card;
  final Color border;
  final Color muted;
  final Color mutedForeground;
  final Color success;
  final Color warning;
  final Color destructive;
  final double radius;

  const AlaiThemeTokens({
    required this.primary,
    required this.primaryForeground,
    required this.background,
    required this.card,
    required this.border,
    required this.muted,
    required this.mutedForeground,
    required this.success,
    required this.warning,
    required this.destructive,
    this.radius = 6,
  });

  /// light（与 tokens.css :root 对齐）
  static const AlaiThemeTokens light = AlaiThemeTokens(
    primary: Color(0xFF0052D9),
    primaryForeground: Color(0xFFFFFFFF),
    background: Color(0xFFF3F3F3),
    card: Color(0xFFFFFFFF),
    border: Color(0xFFDCDEE3),
    muted: Color(0xFFF5F5F5),
    mutedForeground: Color(0xFF5A5E66),
    success: Color(0xFF00A86B),
    warning: Color(0xFFF5A623),
    destructive: Color(0xFFE5484D),
  );

  /// dark（与 tokens.css .dark 对齐）
  static const AlaiThemeTokens dark = AlaiThemeTokens(
    primary: Color(0xFF366EF4),
    primaryForeground: Color(0xFFFFFFFF),
    background: Color(0xFF0F1015),
    card: Color(0xFF14161C),
    border: Color(0xFF33363F),
    muted: Color(0xFF1E2129),
    mutedForeground: Color(0xFFA1A7B3),
    success: Color(0xFF00A86B),
    warning: Color(0xFFF5A623),
    destructive: Color(0xFFE5484D),
  );
}
