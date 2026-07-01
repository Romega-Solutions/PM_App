const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.PM_APP_BETA_URL || "https://beta.pinaymate.com";
const FILIPINA_CARD =
  /(?:Maria, 28|Angela, 25|Grace, 30|Samantha, 31|Kyla, 24|Francesca, 27|Leah, 32|Trisha, 28)/;
const FOREIGNER_CARD = /(?:Daniel, 34|James, 39|Michael, 31|Thomas, 42)/;
const MARRIAGE_FILIPINA_CARD = /(?:Samantha, 31|Leah, 32)/;

function collectPageNoise(page) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => pageErrors.push(error.message));

  page.on("requestfailed", (request) => {
    const url = request.url();
    const failureText = request.failure()?.errorText || "";
    const isNavigationAbort = failureText.includes("ERR_ABORTED");

    if (
      !isNavigationAbort &&
      !url.includes("favicon") &&
      !url.includes("analytics")
    ) {
      failedRequests.push(`${request.method()} ${url} ${failureText}`);
    }
  });

  return { consoleErrors, pageErrors, failedRequests };
}

async function assertNoCriticalNoise(noise) {
  expect(noise.pageErrors, "page errors").toEqual([]);
  expect(noise.failedRequests, "failed requests").toEqual([]);
  expect(
    noise.consoleErrors.filter((item) => !item.includes("AdUnit")),
    "console errors",
  ).toEqual([]);
}

async function assertBottomNav(page) {
  for (const label of ["Discover", "Liked You", "Messages", "You"]) {
    const locator = page.getByText(label, { exact: true }).last();
    await expect(locator, `${label} tab`).toBeVisible({ timeout: 15000 });

    const box = await locator.boundingBox();
    expect(box, `${label} tab box`).not.toBeNull();
    expect(box.y + box.height, `${label} tab not clipped`).toBeLessThanOrEqual(
      page.viewportSize().height,
    );
  }
}

async function openCurrentProfileDetails(page) {
  await page.getByRole("button", { name: "View profile details" }).click();
  await expect(page.getByText("Something feels off?", { exact: true })).toBeVisible({
    timeout: 15000,
  });
}

async function startPreview(
  page,
  label,
  expectedCardPattern,
  blockedCardPattern,
) {
  await page.goto(`${BASE_URL}/welcome`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
  await page.goto(`${BASE_URL}/welcome`, { waitUntil: "domcontentloaded" });
  await expect(page.getByText(label, { exact: true })).toBeVisible({
    timeout: 20000,
  });
  await page.getByText(label, { exact: true }).click();
  await expect(page.getByText(expectedCardPattern).first()).toBeVisible({
    timeout: 30000,
  });
  await expect(page.getByText(blockedCardPattern)).toHaveCount(0);
  await assertBottomNav(page);
}

async function exerciseDemoLikedYouActions(page) {
  await page.getByText("Liked You", { exact: true }).last().click();
  await expect(page.getByText("Before you message", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByText("Beta preview", { exact: true })).toBeVisible({
    timeout: 15000,
  });

  await page
    .getByLabel("Match filters")
    .getByText("Mutual", { exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /^Message / }).first(),
  ).toBeVisible({ timeout: 15000 });

  await page.getByRole("button", { name: /^Report or block / }).first().click();
  await expect(page.getByText("Report member", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await page
    .getByRole("radio", {
      name: "Scam, money request, or suspicious behavior",
    })
    .click();
  await page
    .getByLabel("Report details")
    .fill("Demo liked-you proof: suspicious off-app payment request.");
  await page.getByRole("button", { name: "Send private report" }).click();
  await expect(
    page.getByText("Demo report and block recorded", { exact: true }),
  ).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("No real report or block was sent.")).toBeVisible();
  await page.getByRole("button", { name: "Close report form" }).click();

  await page.getByRole("button", { name: /^Unmatch with / }).first().click();
  await expect(page.getByText("Beta preview action", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByText(/No real unmatch was sent/)).toBeVisible();

  await page.getByRole("button", { name: /^Message / }).first().click();
  await expect(page.getByText(/Demo chat/).first()).toBeVisible({
    timeout: 15000,
  });
  await expect(
    page.getByText("Demo chat replies and photos stay local on this device."),
  ).toBeVisible({ timeout: 15000 });
}

async function exerciseAuthEntryScreens(page) {
  await page.goto(`${BASE_URL}/signin`, { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Welcome back", { exact: true })).toBeVisible({
    timeout: 20000,
  });
  await expect(page.getByRole("button", { name: "Forgot password" })).toBeVisible({
    timeout: 15000,
  });

  await page.getByText("Create Account", { exact: true }).click();
  await expect(
    page.getByText("Choose your profile path", { exact: true }),
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole("button", { name: "Choose a profile type before continuing" }),
  ).toBeDisabled();
  await page.getByRole("radio", { name: "I am a foreign man" }).click();
  await page.getByRole("button", { name: "Continue to account signup" }).click();

  await expect(
    page.getByText("Create your Foreign Man profile", { exact: true }),
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByText("Email signup is the active path", { exact: true }),
  ).toBeVisible({ timeout: 15000 });

  await page.getByRole("button", { name: "Create profile" }).click();
  await expect(page.getByText("First name is required")).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByText("Email is required")).toBeVisible();
  await expect(page.getByText("Password is required")).toBeVisible();

  await page.getByRole("textbox", { name: "First name" }).fill("A");
  await page.getByRole("textbox", { name: "Email" }).fill("not-an-email");
  await page
    .getByRole("textbox", { name: "Password", exact: true })
    .fill("short");
  await page
    .getByRole("textbox", { name: "Confirm Password" })
    .fill("different");
  await page.getByRole("button", { name: "Show password" }).click();
  await page.getByRole("button", { name: "Show confirm password" }).click();
  await page.getByRole("button", { name: "Create profile" }).click();
  await expect(page.getByText("First name must be at least 2 characters")).toBeVisible();
  await expect(page.getByText("Please enter a valid email")).toBeVisible();
  await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();
  await expect(page.getByText("Passwords do not match")).toBeVisible();

  await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Reset Password", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await page.getByRole("button", { name: "Send password reset link to your email" }).click();
  await expect(
    page.getByText("Enter the email address connected to your account."),
  ).toBeVisible({ timeout: 15000 });
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("invalid-email");
  await page.getByRole("button", { name: "Send password reset link to your email" }).click();
  await expect(
    page.getByText("Use a valid email address, like name@example.com."),
  ).toBeVisible();

  await page.goto(`${BASE_URL}/reset-password`, { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Create New Password", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByText("Password must include", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Update your password" }).click();
  await expect(page.getByText("Password is required.")).toBeVisible({
    timeout: 15000,
  });
  await page
    .getByRole("textbox", { name: "New Password", exact: true })
    .fill("NewPassword1!");
  await page
    .getByRole("textbox", { name: "Confirm New Password" })
    .fill("Different1!");
  await page.getByRole("button", { name: "Show new password" }).click();
  await page.getByRole("button", { name: "Show confirmed password" }).click();
  await page.getByRole("button", { name: "Update your password" }).click();
  await expect(page.getByText("Passwords do not match.")).toBeVisible();
}

test.describe("PinayMate beta preview smoke", () => {
  const viewports = [
    { name: "mobile", width: 390, height: 844 },
    { name: "laptop", width: 1366, height: 900 },
    { name: "desktop", width: 1512, height: 982 },
  ];

  for (const viewport of viewports) {
    test(`${viewport.name}: previews, switch, messages, and nav`, async ({
      page,
    }) => {
      test.setTimeout(90000);
      await page.setViewportSize(viewport);
      const noise = collectPageNoise(page);

      await startPreview(
        page,
        "Foreigner preview",
        FILIPINA_CARD,
        FOREIGNER_CARD,
      );
      await page.getByText("Messages", { exact: true }).last().click();
      await expect(page.getByText("Beta seeded inbox", { exact: true })).toBeVisible({
        timeout: 15000,
      });
      await page.getByText("You", { exact: true }).last().click();
      await expect(
        page.getByRole("button", { name: "Switch to foreigner preview" }),
      ).toBeVisible({ timeout: 15000 });
      await page
        .getByRole("button", { name: "Switch to Pinay preview" })
        .click();
      await expect(
        page.getByRole("button", { name: "Switch to Pinay preview" }),
      ).toBeVisible({ timeout: 15000 });
      await page.getByText("Discover", { exact: true }).last().click();
      await expect(page.getByText(FOREIGNER_CARD).first()).toBeVisible({
        timeout: 30000,
      });
      await expect(page.getByText(FILIPINA_CARD)).toHaveCount(0);
      await assertBottomNav(page);

      await startPreview(page, "Pinay preview", FOREIGNER_CARD, FILIPINA_CARD);
      await page.getByText("Messages", { exact: true }).last().click();
      await expect(page.getByText("Your note about family")).toBeVisible({
        timeout: 15000,
      });

      await assertNoCriticalNoise(noise);
    });
  }

  test("laptop: demo safety report and block uses preview-safe receipt", async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1366, height: 900 });
    const noise = collectPageNoise(page);

    await startPreview(
      page,
      "Foreigner preview",
      FILIPINA_CARD,
      FOREIGNER_CARD,
    );
    await openCurrentProfileDetails(page);
    await page.getByRole("button", { name: /Report or block/ }).click();
    await expect(page.getByText("Report member", { exact: true })).toBeVisible({
      timeout: 15000,
    });

    await page
      .getByRole("radio", {
        name: "Scam, money request, or suspicious behavior",
      })
      .click();
    await page
      .getByLabel("Report details")
      .fill("Demo safety proof: suspicious off-app payment request.");
    await expect(
      page.getByText(
        "Recommended for safety reports. Blocking helps prevent future discovery, chat, and media access between you.",
      ),
    ).toBeVisible();
    await page.getByRole("button", { name: "Send private report" }).click();

    await expect(
      page.getByText("Demo report and block recorded", { exact: true }),
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByText("No real report or block was sent."),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close report form" }).click();
    await assertBottomNav(page);

    await assertNoCriticalNoise(noise);
  });

  test("laptop: seeded chat opens and sends a local demo reply", async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1366, height: 900 });
    const noise = collectPageNoise(page);
    const demoReply =
      "Demo smoke reply: staying respectful and inside the app.";

    await startPreview(
      page,
      "Foreigner preview",
      FILIPINA_CARD,
      FOREIGNER_CARD,
    );
    await page.getByText("Messages", { exact: true }).last().click();
    await expect(page.getByText("Beta seeded inbox", { exact: true })).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole("button", { name: /Open chat with/ }).first().click();
    await expect(page.getByText(/Demo chat/).first()).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByText("Demo chat replies and photos stay local on this device."),
    ).toBeVisible({ timeout: 15000 });

    await page.getByLabel("Message input").fill(demoReply);
    await page.getByRole("button", { name: "Send demo reply" }).click();
    await expect(page.getByLabel(new RegExp(`^You: ${demoReply}`))).toBeVisible({
      timeout: 15000,
    });

    await page
      .getByRole("button", { name: /Open safety options for/ })
      .first()
      .click();
    await expect(page.getByText("Report safety concern", { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Demo block", { exact: true })).toBeVisible();
    await expect(page.getByText("Unmatch only", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Close safety options" }).click();

    await assertNoCriticalNoise(noise);
  });

  test("laptop: liked-you demo actions stay local and open seeded chat", async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1366, height: 900 });
    const noise = collectPageNoise(page);

    await startPreview(
      page,
      "Foreigner preview",
      FILIPINA_CARD,
      FOREIGNER_CARD,
    );
    await exerciseDemoLikedYouActions(page);

    await assertNoCriticalNoise(noise);
  });

  test("laptop: auth signup and recovery entry screens validate", async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1366, height: 900 });
    const noise = collectPageNoise(page);

    await exerciseAuthEntryScreens(page);

    await assertNoCriticalNoise(noise);
  });

  test("laptop: demo discovery filters save and update the seeded feed", async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1366, height: 900 });
    const noise = collectPageNoise(page);

    await startPreview(
      page,
      "Foreigner preview",
      FILIPINA_CARD,
      FOREIGNER_CARD,
    );

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Demo filters saved");
      await dialog.accept();
    });

    await page
      .getByRole("button", { name: "Adjust discovery filters" })
      .first()
      .click();
    await expect(page.getByText("Discovery filters", { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Age range", { exact: true })).toBeVisible();
    await expect(page.getByText("Distance radius", { exact: true })).toBeVisible();
    await expect(page.getByText("Relationship goal", { exact: true })).toBeVisible();

    await page.getByRole("radio", { name: /marriage/i }).click();
    await page.getByRole("button", { name: "Save discovery filters" }).click();

    await expect(page.getByText(MARRIAGE_FILIPINA_CARD).first()).toBeVisible({
      timeout: 30000,
    });
    await assertBottomNav(page);

    await assertNoCriticalNoise(noise);
  });
});
