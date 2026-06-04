import fs from "fs";
import path from "path";

describe("user type selection route", () => {
  it("delegates rendering to the feature screen", () => {
    const routeSource = fs.readFileSync(
      path.join(
        process.cwd(),
        "app",
        "(auth)",
        "user-type-selection.tsx",
      ),
      "utf8",
    );

    expect(routeSource).toContain(
      'import UserTypeSelectionScreen from "@/src/features/auth/screens/UserTypeSelectionScreen";',
    );
    expect(routeSource).toContain("export default UserTypeSelectionScreen;");
  });
});
