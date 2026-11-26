// swift-tools-version:5.9
import PackageDescription

let package = Package(
  name: "AlaiDesign",
  platforms: [
    .iOS(.v15),
    .macOS(.v12),
  ],
  products: [
    .library(name: "AlaiDesign", targets: ["AlaiDesign"]),
  ],
  targets: [
    .target(name: "AlaiDesign", path: "Sources/AlaiDesign"),
  ],
)
