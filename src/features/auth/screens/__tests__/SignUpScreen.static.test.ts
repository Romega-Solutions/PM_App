import fs from "fs";
import path from "path";

const source = () =>
  fs.readFileSync(
    path.join(process.cwd(), "src/features/auth/screens/SignUpScreen.tsx"),
    "utf8",
  );

describe("sign-up screen adoption details", () => {
  it("uses runtime theme tokens and marks Google sign-up unavailable", () => {
    const signUpSource = source();

    expect(signUpSource).toContain("const { colors } = useTheme();");
    expect(signUpSource).toContain("unavailable");
    expect(signUpSource).not.toContain("Google sign-up will be available soon");
    expect(signUpSource).not.toContain("moderateScale");
  });
});
