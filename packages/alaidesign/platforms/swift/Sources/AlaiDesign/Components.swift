import SwiftUI

// AlaiDesign Swift/SwiftUI 高频组件骨架（Button/Badge/Card）

public enum AluButtonVariant: String, CaseIterable {
  case defaultVariant = "default"
  case outline, secondary, ghost, destructive, link
}

public struct AluButton: View {
  let variant: AluButtonVariant
  let disabled: Bool
  let tokens: AlaiThemeTokens
  let action: () -> Void
  @ViewBuilder let label: () -> AnyView

  public init(
    variant: AluButtonVariant = .defaultVariant,
    disabled: Bool = false,
    tokens: AlaiThemeTokens = .light,
    action: @escaping () -> Void,
    @ViewBuilder label: @escaping () -> AnyView
  ) {
    self.variant = variant
    self.disabled = disabled
    self.tokens = tokens
    self.action = action
    self.label = label
  }

  private var bg: Color {
    switch variant {
      case .defaultVariant: return tokens.primary
      case .outline: return tokens.background
      case .secondary: return tokens.muted
      case .ghost: return .clear
      case .destructive: return tokens.destructive
      case .link: return .clear
    }
  }
  private var fg: Color {
    switch variant {
      case .defaultVariant, .destructive: return tokens.primaryForeground
      case .outline, .secondary, .ghost: return tokens.mutedForeground
      case .link: return tokens.primary
    }
  }
  private var border: Color { variant == .outline ? tokens.border : .clear }

  public var body: some View {
    Button(action: action, label: { label().foregroundStyle(fg) })
      .buttonStyle(.plain)
      .frame(height: 36)
      .padding(.horizontal, 10)
      .background(bg)
      .overlay(RoundedRectangle(cornerRadius: tokens.radius).strokeBorder(border, lineWidth: variant == .outline ? 1 : 0))
      .clipShape(RoundedRectangle(cornerRadius: tokens.radius))
      .disabled(disabled)
      .opacity(disabled ? 0.5 : 1)
  }
}

public struct AluBadge: View {
  let text: String
  let tokens: AlaiThemeTokens
  public init(_ text: String, tokens: AlaiThemeTokens = .light) {
    self.text = text
    self.tokens = tokens
  }
  public var body: some View {
    Text(text)
      .font(.system(size: 11, weight: .medium))
      .padding(.horizontal, 8)
      .padding(.vertical, 2)
      .background(tokens.primary)
      .foregroundStyle(tokens.primaryForeground)
      .clipShape(RoundedRectangle(cornerRadius: 4))
  }
}

public struct AluCard: View {
  let header: (() -> AnyView)?
  let content: () -> AnyView
  let footer: (() -> AnyView)?
  let tokens: AlaiThemeTokens

  public init(
    @ViewBuilder header: (() -> AnyView)? = nil,
    @ViewBuilder content: @escaping () -> AnyView,
    @ViewBuilder footer: (() -> AnyView)? = nil,
    tokens: AlaiThemeTokens = .light
  ) {
    self.header = header
    self.content = content
    self.footer = footer
    self.tokens = tokens
  }

  public var body: some View {
    VStack(spacing: 0) {
      if let header { VStack(alignment: .leading, spacing: 6) { header() }.padding(16) }
      content().padding(.horizontal, 16).padding(.bottom, 16)
      if let footer { footer().padding(16) }
    }
    .background(tokens.card)
    .overlay(RoundedRectangle(cornerRadius: tokens.radius).strokeBorder(tokens.border))
    .clipShape(RoundedRectangle(cornerRadius: tokens.radius))
  }
}
