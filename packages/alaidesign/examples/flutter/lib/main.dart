// Flutter 实例化测试 — 验证 alaikis_alaidesign pub 包
// 使用：Flutter 工程 pubspec.yaml 加
//   dependencies:
//     alaikis_alaidesign:
//       path: ../../platforms/flutter
// 然后跑此示例。
import 'package:alaikis_alaidesign/alaikis_alaidesign.dart';
import 'package:flutter/material.dart';

void main() => runApp(const AlaiDemo());

class AlaiDemo extends StatelessWidget {
  const AlaiDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        backgroundColor: AlaiThemeTokens.light.background,
        body: SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  AluButton(onTap: () {}, child: const Text('Default')),
                  const SizedBox(width: 8),
                  AluButton(variant: AluButtonVariant.outline, onTap: () {}, child: const Text('Outline')),
                  const SizedBox(width: 8),
                  AluButton(variant: AluButtonVariant.destructive, onTap: () {}, child: const Text('删除')),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  AluBadge(label: 'Default'),
                  const SizedBox(width: 8),
                  AluBadge(label: 'Success'),
                ],
              ),
              const SizedBox(height: 16),
              AluCard(
                header: const Text('运单管理'),
                content: const Text('SH-001 · UPS · 已签收'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
