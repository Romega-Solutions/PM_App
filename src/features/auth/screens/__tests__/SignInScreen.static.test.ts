import fs from "fs";
import path from "path";

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("sign-in screen adoption details", () => {
  it("keeps forgot-password tappable and marks unavailable social auth honestly", () => {
    const signInSource = readSource("src/features/auth/screens/SignInScreen.tsx");
    const socialButtonSource = readSource("src/components/auth/SocialSignInButton.tsx");

    expect(signInSource).toContain("theme.componentSizes.iconButton");
    expect(signInSource).toContain("const { colors } = useTheme();");
    expect(signInSource).toContain("unavailable");
    expect(signInSource).not.toContain("Password must be at least 6 characters");
    expect(socialButtonSource).toContain("unavailable?: boolean");
    expect(socialButtonSource).toContain("Sign in with Google is unavailable");
  });
});
