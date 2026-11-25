// SwiftUI 实例化测试 — 验证 AlaiDesign SPM 包
// 使用：Xcode → Add Package Dependency → 本地 AlaiDesign 包（Package.swift）
// 然后跑此 view。
import SwiftUI
import AlaiDesign

struct AlaiDemoView: View {
  @State private var on = true

  var body: some View {
    VStack(spacing: 16) {
      HStack(spacing: 8) {
        AluButton("Default") {}
        AluButton(variant: .outline, "Outline") {}
        AluButton(variant: .destructive, "删除") {}
      }
      HStack(spacing: 8) {
        AluBadge("Default")
        AluBadge("Success")
      }
      AluCard(header: { Text("运单管理") }, content: { Text("SH-001 · UPS · 已签收") })
      Toggle("开关", isOn: $on)
    }
    .padding()
    .tint(AlaiThemeTokens.light.primary)
  }
}

#Preview { AlaiDemoView() }
