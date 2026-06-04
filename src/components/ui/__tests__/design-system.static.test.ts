import fs from "fs";
import path from "path";

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("shared UI primitives use design-system interaction tokens", () => {
  it.each([
    {
      filePath: "src/components/ui/PrimaryButton.tsx",
      tokens: [
        "theme.componentSizes.button",
        "theme.iconSizes.control",
        "theme.strokeWidths.emphasis",
      ],
    },
    {
      filePath: "src/components/ui/SecondaryButton.tsx",
      tokens: ["theme.componentSizes.button"],
    },
    {
      filePath: "src/components/ui/GhostButton.tsx",
      tokens: ["theme.componentSizes.button", "theme.spacing.touchGap"],
    },
    {
      filePath: "src/components/ui/BackButton.tsx",
      tokens: [
        "theme.componentSizes.iconButton",
        "theme.hitSlop.sm",
        "theme.iconSizes.navigation",
        "theme.strokeWidths.emphasis",
      ],
    },
    {
      filePath: "src/components/navigation/MainTabIcon.tsx",
      tokens: [
        "theme.componentSizes.tabIconPillWidth",
        "theme.iconSizes.navigation",
        "theme.strokeWidths",
      ],
    },
  ])("$filePath consumes its interaction tokens", ({ filePath, tokens }) => {
    const source = readSource(filePath);

    for (const token of tokens) {
      expect(source).toContain(token);
    }
    expect(source).not.toContain("hitSlop={8}");
  });

  it("settings rows use tokenized touch targets, icon sizing, and Pressable feedback", () => {
    const source = readSource("src/components/settings/SettingsRow.tsx");

    expect(source).toContain("Pressable");
    expect(source).toContain("theme.componentSizes.settingsRowMinHeight");
    expect(source).toContain("theme.componentSizes.iconButton");
    expect(source).toContain("theme.iconSizes.control");
    expect(source).toContain("theme.strokeWidths.emphasis");
  });
});
