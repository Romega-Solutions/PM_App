import fs from "fs";
import path from "path";

describe("filters modal", () => {
  it("uses honest unavailable copy and theme tokens", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "app/(modals)/filters.tsx"),
      "utf8",
    );

    expect(source).toContain("useTheme");
    expect(source).toContain("Filters are unavailable in this build.");
    expect(source).not.toContain("coming soon");
    expect(source).not.toContain("className=");
  });
});
