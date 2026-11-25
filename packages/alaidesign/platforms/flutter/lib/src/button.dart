// AlaiDesign Flutter Button
import 'package:flutter/material.dart';
import 'theme.dart';

enum AluButtonVariant { defaultVariant, outline, secondary, ghost, destructive, link }

class AluButton extends StatelessWidget {
  final AluButtonVariant variant;
  final double? height;
  final bool disabled;
  final AlaiThemeTokens tokens;
  final VoidCallback? onTap;
  final Widget child;

  const AluButton({
    super.key,
    this.variant = AluButtonVariant.defaultVariant,
    this.height = 36,
    this.disabled = false,
    this.tokens = AlaiThemeTokens.light,
    this.onTap,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final t = tokens;
    final (bg, fg, border) = switch (variant) {
      AluButtonVariant.defaultVariant => (t.primary, t.primaryForeground, Colors.transparent),
      AluButtonVariant.outline => (t.background, t.mutedForeground, t.border),
      AluButtonVariant.secondary => (t.muted, t.mutedForeground, Colors.transparent),
      AluButtonVariant.ghost => (Colors.transparent, t.mutedForeground, Colors.transparent),
      AluButtonVariant.destructive => (t.destructive, t.primaryForeground, Colors.transparent),
      AluButtonVariant.link => (Colors.transparent, t.primary, Colors.transparent),
    };
    return Material(
      color: bg,
      borderRadius: BorderRadius.circular(t.radius),
      child: InkWell(
        borderRadius: BorderRadius.circular(t.radius),
        onTap: disabled ? null : onTap,
        child: Container(
          height: height,
          padding: const EdgeInsets.symmetric(horizontal: 10),
          decoration: BoxDecoration(
            border: Border.all(color: border, width: variant == AluButtonVariant.outline ? 1 : 0),
            borderRadius: BorderRadius.circular(t.radius),
          ),
          opacity: disabled ? 0.5 : 1,
          alignment: Alignment.center,
          child: DefaultTextStyle(
            style: TextStyle(color: fg, fontSize: 14, fontWeight: FontWeight.w500),
            child: child,
          ),
        ),
      ),
    );
  }
}
