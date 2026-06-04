import fs from "fs";
import path from "path";

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("high-impact UI controls follow Material interaction tokens", () => {
  it.each([
    {
      filePath: "src/features/auth/screens/SignInScreen.tsx",
      tokens: ["theme.componentSizes.iconButton"],
    },
    {
      filePath: "src/components/settings/SettingsScreenScaffold.tsx",
      tokens: [
        "theme.componentSizes.iconButton",
        "theme.hitSlop.sm",
        "theme.iconSizes.navigation",
        "theme.strokeWidths.emphasis",
      ],
    },
    {
      filePath: "src/features/messaging/components/ChatHeader.tsx",
      tokens: [
        "theme.componentSizes.iconButton",
        "theme.hitSlop.sm",
        "theme.iconSizes.navigation",
        "theme.iconSizes.inline",
        "theme.strokeWidths.emphasis",
      ],
    },
    {
      filePath: "src/features/messaging/components/MessageComposer.tsx",
      tokens: [
        "theme.componentSizes.iconButton",
        "theme.componentSizes.input",
        "theme.hitSlop.sm",
        "theme.iconSizes.inline",
        "theme.strokeWidths.emphasis",
      ],
    },
    {
      filePath: "src/features/matching/components/ActionButtons.tsx",
      tokens: [
        "theme.componentSizes.iconButton",
        "theme.iconSizes.control",
        "theme.iconSizes.feature",
        "theme.strokeWidths.emphasis",
      ],
    },
    {
      filePath: "src/features/matching/components/ProfileDetailsModal.tsx",
      tokens: [
        "theme.componentSizes.iconButton",
        "theme.iconSizes.navigation",
        "theme.iconSizes.inline",
        "theme.iconSizes.metadata",
        "theme.strokeWidths.emphasis",
      ],
    },
  ])("$filePath uses shared Material interaction tokens", ({ filePath, tokens }) => {
    const source = readSource(filePath);

    for (const token of tokens) {
      expect(source).toContain(token);
    }
    expect(source).not.toContain("hitSlop={8}");
    expect(source).not.toContain("hitSlop={6}");
  });
});
