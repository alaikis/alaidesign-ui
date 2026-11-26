import SwiftUI

// AlaiDesign Swift/SwiftUI 设计 token（与 Web tokens.css 同源）
public struct AlaiThemeTokens {
  public let primary: Color
  public let primaryForeground: Color
  public let background: Color
  public let card: Color
  public let border: Color
  public let muted: Color
  public let mutedForeground: Color
  public let success: Color
  public let warning: Color
  public let destructive: Color
  public let radius: Double

  /// light（与 tokens.css :root 对齐）
  public static let light = AlaiThemeTokens(
    primary: Color(red: 0, green: 82/255, blue: 217/255),
    primaryForeground: .white,
    background: Color(red: 243/255, green: 243/255, blue: 243/255),
    card: .white,
    border: Color(red: 220/255, green: 222/255, blue: 227/255),
    muted: Color(red: 245/255, green: 245/255, blue: 245/255),
    mutedForeground: Color(red: 90/255, green: 94/255, blue: 102/255),
    success: Color(red: 0, green: 168/255, blue: 107/255),
    warning: Color(red: 245/255, green: 166/255, blue: 35/255),
    destructive: Color(red: 229/255, green: 72/255, blue: 77/255),
    radius: 6
  )

  /// dark（与 tokens.css .dark 对齐）
  public static let dark = AlaiThemeTokens(
    primary: Color(red: 54/255, green: 110/255, blue: 244/255),
    primaryForeground: .white,
    background: Color(red: 15/255, green: 16/255, blue: 21/255),
    card: Color(red: 20/255, green: 22/255, blue: 28/255),
    border: Color(red: 51/255, green: 54/255, blue: 63/255),
    muted: Color(red: 30/255, green: 33/255, blue: 41/255),
    mutedForeground: Color(red: 161/255, green: 167/255, blue: 179/255),
    success: light.success,
    warning: light.warning,
    destructive: light.destructive,
    radius: 6
  )
}
