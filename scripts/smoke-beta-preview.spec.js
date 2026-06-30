const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.PM_APP_BETA_URL || "https://beta.pinaymate.com";
const FILIPINA_CARD =
  /(?:Maria, 28|Angela, 25|Grace, 30|Samantha, 31|Kyla, 24|Francesca, 27|Leah, 32|Trisha, 28)/;
const FOREIGNER_CARD = /(?:Daniel, 34|James, 39|Michael, 31|Thomas, 42)/;

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
});
