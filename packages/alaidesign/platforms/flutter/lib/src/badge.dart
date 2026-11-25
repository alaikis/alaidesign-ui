// AlaiDesign Flutter Badge + Card（高频组件骨架）
import 'package:flutter/material.dart';
import 'theme.dart';

class AluBadge extends StatelessWidget {
  final String label;
  final AlaiThemeTokens tokens;
  const AluBadge({super.key, required this.label, this.tokens = AlaiThemeTokens.light});

  @override
  Widget build(BuildContext context) {
    final t = tokens;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: t.primary,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(label, style: TextStyle(color: t.primaryForeground, fontSize: 11, fontWeight: FontWeight.w500)),
    );
  }
}

class AluCard extends StatelessWidget {
  final Widget? header;
  final Widget content;
  final Widget? footer;
  final AlaiThemeTokens tokens;
  const AluCard({super.key, this.header, required this.content, this.footer, this.tokens = AlaiThemeTokens.light});

  @override
  Widget build(BuildContext context) {
    final t = tokens;
    return Container(
      decoration: BoxDecoration(
        color: t.card,
        border: Border.all(color: t.border),
        borderRadius: BorderRadius.circular(t.radius),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (header != null) Padding(padding: const EdgeInsets.all(16), child: header!),
          Padding(padding: const EdgeInsets.fromLTRB(16, 0, 16, 16), child: content),
          if (footer != null) Padding(padding: const EdgeInsets.fromLTRB(16, 0, 16, 16), child: footer!),
        ],
      ),
    );
  }
}
