const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");

const BASE_URL = process.env.PM_APP_BETA_URL || "https://beta.pinaymate.com";
const EMAIL = process.env.PM_WEB_MVP_EMAIL || process.env.OCR_PROOF_EMAIL;
const PASSWORD =
  process.env.PM_WEB_MVP_PASSWORD || process.env.OCR_PROOF_PASSWORD;
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY;
const PROFILE_PHOTO_FIXTURE = path.join(
  __dirname,
  "..",
  "assets",
  "images",
  "icon.png",
);
const OCR_PROOF_DIR = path.join(__dirname, "..", "codex-tmp", "ocr-proof");
const OCR_VALID_DOCUMENT = path.join(OCR_PROOF_DIR, "synthetic-valid-document.png");

function collectPageNoise(page) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];

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

  page.on("response", (response) => {
    const status = response.status();
    const url = response.url();

    if (
      status >= 400 &&
      !url.includes("favicon") &&
      !url.includes("analytics")
    ) {
      badResponses.push(`${status} ${url}`);
    }
  });

  return { consoleErrors, pageErrors, failedRequests, badResponses };
}

async function assertNoCriticalNoise(noise) {
  expect(noise.pageErrors, "page errors").toEqual([]);
  expect(noise.failedRequests, "failed requests").toEqual([]);
  expect(noise.badResponses, "bad responses").toEqual([]);
  expect(
    noise.consoleErrors.filter(
      (item) =>
        !item.includes("AdUnit") &&
        !(
          item.includes("TypeError: Failed to fetch") &&
          item.includes("_getUser")
        ),
    ),
    "console errors",
  ).toEqual([]);
}

async function clearBrowserSession(page) {
  await page.goto(`${BASE_URL}/welcome`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

async function signIn(page) {
  await clearBrowserSession(page);
  await page.goto(`${BASE_URL}/signin`, { waitUntil: "domcontentloaded" });

  await expect(page.getByText("Welcome back", { exact: true })).toBeVisible({
    timeout: 20000,
  });

  const inputs = page.locator("input");
  await expect(inputs.first(), "email input").toBeVisible({ timeout: 15000 });
  await inputs.first().fill(EMAIL);
  await inputs.nth(1).fill(PASSWORD);

  await page.getByText("Sign In", { exact: true }).last().click();

  await expect(page.getByText("Discover", { exact: true }).last()).toBeVisible({
    timeout: 30000,
  });
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
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

async function openTab(page, label) {
  await page.getByText(label, { exact: true }).last().click();
  await expect(page.getByText(label, { exact: true }).last()).toBeVisible({
    timeout: 15000,
  });
}

async function openProtectedRoute(page, path) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
}

async function toggleSwitchAndWaitForRpc(page, locator, rpcName) {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(`/rpc/${rpcName}`) &&
      response.request().method() === "POST",
    { timeout: 15000 },
  );

  await locator.click();
  const response = await responsePromise;
  expect(response.status(), `${rpcName} response status`).toBeLessThan(400);
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
}

async function clickAndWaitForRpc(page, locator, rpcName) {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(`/rpc/${rpcName}`) &&
      response.request().method() === "POST",
    { timeout: 15000 },
  );

  await locator.click();
  const response = await responsePromise;
  expect(response.status(), `${rpcName} response status`).toBeLessThan(400);
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
}

async function saveProfileAndWait(page) {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/rest/v1/profiles") &&
      response.request().method() === "PATCH",
    { timeout: 15000 },
  );

  await page.getByRole("button", { name: "Save profile" }).click();

  const response = await responsePromise;
  expect(response.status(), "profile update response status").toBeLessThan(400);

  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  await expect(page.getByText("Profile access", { exact: true })).toBeVisible({
    timeout: 15000,
  });
}

function getProfilePhotoStoragePath(photoUrl) {
  const marker = "/profile-photos/";
  const markerIndex = photoUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(photoUrl.slice(markerIndex + marker.length).split("?")[0])
    .replace(/^\/+/, "");
}

async function createSignedInProofClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY for profile photo cleanup.",
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });

  if (error || !user) {
    throw new Error("Profile photo cleanup sign-in failed.");
  }

  return { supabase, user };
}

async function snapshotProfilePhotos() {
  const { supabase, user } = await createSignedInProofClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("photos, photos_completed")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error("Could not snapshot profile photos before upload smoke.");
  }

  return {
    photos: Array.isArray(data?.photos) ? data.photos : [],
    photosCompleted: Boolean(data?.photos_completed),
  };
}

async function restoreProfilePhotos(snapshot) {
  const { supabase, user } = await createSignedInProofClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("photos")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error("Could not read uploaded profile photos for cleanup.");
  }

  const originalPhotoSet = new Set(snapshot.photos);
  const latestPhotos = Array.isArray(data?.photos) ? data.photos : [];
  const uploadedPaths = latestPhotos
    .filter((photo) => !originalPhotoSet.has(photo))
    .map(getProfilePhotoStoragePath)
    .filter(Boolean)
    .filter((photoPath) => photoPath.startsWith(`${user.id}/`));

  if (uploadedPaths.length > 0) {
    const { error: removeError } = await supabase.storage
      .from("profile-photos")
      .remove(uploadedPaths);

    if (removeError) {
      throw new Error("Could not delete uploaded profile photo during cleanup.");
    }
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      photos: snapshot.photos,
      photos_completed: snapshot.photosCompleted,
    })
    .eq("id", user.id);

  if (updateError) {
    throw new Error("Could not restore profile photos after upload smoke.");
  }
}

async function ensureSyntheticOcrDocument() {
  if (fs.existsSync(OCR_VALID_DOCUMENT)) {
    return OCR_VALID_DOCUMENT;
  }

  fs.mkdirSync(OCR_PROOF_DIR, { recursive: true });
  const validDocumentSvg = `
    <svg width="1200" height="760" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="760" fill="#f8fafc"/>
      <rect x="52" y="52" width="1096" height="656" rx="28" fill="#ffffff" stroke="#0f172a" stroke-width="8"/>
      <text x="92" y="142" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="700" fill="#0f172a">PINAYMATE TEST IDENTIFICATION</text>
      <text x="92" y="232" font-family="Arial, Helvetica, sans-serif" font-size="46" fill="#111827">Name: Maria Santos</text>
      <text x="92" y="312" font-family="Arial, Helvetica, sans-serif" font-size="46" fill="#111827">Given Name: Maria</text>
      <text x="92" y="392" font-family="Arial, Helvetica, sans-serif" font-size="46" fill="#111827">Surname: Santos</text>
      <text x="92" y="472" font-family="Arial, Helvetica, sans-serif" font-size="46" fill="#111827">Date of Birth: 1998-04-03</text>
      <text x="92" y="552" font-family="Arial, Helvetica, sans-serif" font-size="36" fill="#334155">Synthetic QA image. Not a government document.</text>
    </svg>
  `;

  await sharp(Buffer.from(validDocumentSvg)).png().toFile(OCR_VALID_DOCUMENT);
  return OCR_VALID_DOCUMENT;
}

async function snapshotVerificationSubmission() {
  const { supabase, user } = await createSignedInProofClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "verification_selfie, verification_document, verification_completed, verification_status, is_verified",
    )
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error("Could not snapshot verification state before smoke.");
  }

  return {
    userId: user.id,
    selfiePath: data?.verification_selfie || "",
    documentPath: data?.verification_document || "",
    completed: Boolean(data?.verification_completed),
    status: data?.verification_status || "pending",
    isVerified: Boolean(data?.is_verified),
  };
}

async function cleanupVerificationSubmission(snapshot) {
  const { supabase, user } = await createSignedInProofClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("verification_selfie, verification_document")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error("Could not read verification state for cleanup.");
  }

  const snapshotPaths = new Set(
    [snapshot.selfiePath, snapshot.documentPath].filter(Boolean),
  );
  const latestPaths = [data?.verification_selfie, data?.verification_document]
    .filter(Boolean)
    .filter((item) => !snapshotPaths.has(item))
    .filter((item) => item.startsWith(`${user.id}/`));
  const cleanupPaths = [...latestPaths];

  if (!snapshot.completed && !snapshot.selfiePath && !snapshot.documentPath) {
    const { data: objects } = await supabase.storage
      .from("verification-docs")
      .list(user.id);

    for (const object of objects ?? []) {
      const objectPath = `${user.id}/${object.name}`;
      if (!cleanupPaths.includes(objectPath)) {
        cleanupPaths.push(objectPath);
      }
    }
  }

  if (cleanupPaths.length > 0) {
    await supabase.rpc("clear_verification_submission");
    const { error: removeError } = await supabase.storage
      .from("verification-docs")
      .remove(cleanupPaths);

    if (removeError) {
      throw new Error("Could not delete uploaded verification proof files.");
    }
  }

  if (!snapshot.completed && !snapshot.selfiePath && !snapshot.documentPath) {
    const { error: clearError } = await supabase.rpc("clear_verification_submission");

    if (clearError) {
      throw new Error("Could not clear verification proof submission.");
    }
  }
}

async function uploadProfilePhotoThroughPicker(page) {
  const uploadResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/storage/v1/object/profile-photos/") &&
      response.request().method() === "POST",
    { timeout: 30000 },
  );
  const profileUpdatePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/rest/v1/profiles") &&
      response.request().method() === "PATCH",
    { timeout: 30000 },
  );
  const imageResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/storage/v1/object/public/profile-photos/") &&
      response.request().method() === "GET" &&
      response.status() < 400,
    { timeout: 30000 },
  );
  const fileChooserPromise = page.waitForEvent("filechooser", {
    timeout: 15000,
  });

  await page
    .getByRole("button", { name: "Choose profile photo from library" })
    .click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(PROFILE_PHOTO_FIXTURE);

  const uploadResponse = await uploadResponsePromise;
  expect(uploadResponse.status(), "profile photo storage upload").toBeLessThan(
    400,
  );

  const profileUpdate = await profileUpdatePromise;
  expect(profileUpdate.status(), "profile photos profile update").toBeLessThan(
    400,
  );

  await expect(page.getByText("Minimum photo added", { exact: true })).toBeVisible({
    timeout: 20000,
  });
  await imageResponsePromise;
}

async function submitVerificationThroughPickers(page) {
  const validDocument = await ensureSyntheticOcrDocument();
  const selfieChooserPromise = page.waitForEvent("filechooser", {
    timeout: 15000,
  });

  await page.getByRole("button", { name: /Take a verification selfie/ }).click();
  const selfieChooser = await selfieChooserPromise;
  await selfieChooser.setFiles(PROFILE_PHOTO_FIXTURE);

  await expect(page.getByText("Verification selfie", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByText("Captured", { exact: true })).toBeVisible({
    timeout: 15000,
  });

  const ocrResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      (response.url().includes(".functions.supabase.co/ocr") ||
        response.url().includes("/functions/v1/ocr")),
    { timeout: 45000 },
  );
  const storageUploads = [];
  page.on("response", (response) => {
    if (
      response.url().includes("/storage/v1/object/verification-docs/") &&
      response.request().method() === "POST"
    ) {
      storageUploads.push(response);
    }
  });
  const submitResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/rest/v1/rpc/submit_verification") &&
      response.request().method() === "POST",
    { timeout: 45000 },
  );
  const documentChooserPromise = page.waitForEvent("filechooser", {
    timeout: 15000,
  });

  await page.getByRole("button", { name: /Upload an ID document/ }).click();
  const documentChooser = await documentChooserPromise;
  await documentChooser.setFiles(validDocument);

  const ocrResponse = await ocrResponsePromise;
  expect(ocrResponse.status(), "verification OCR response").toBeLessThan(400);

  const submitResponse = await submitResponsePromise;
  expect(
    submitResponse.status(),
    "verification submit_verification response",
  ).toBeLessThan(400);

  await expect.poll(
    () => storageUploads.filter((response) => response.status() < 400).length,
    {
      message: "verification private storage uploads",
      timeout: 15000,
    },
  ).toBeGreaterThanOrEqual(2);

  await expect(page.getByText("Review pending", { exact: true })).toBeVisible({
    timeout: 20000,
  });
  await expect(page.getByText("ID document", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByText("Submitted", { exact: true })).toBeVisible({
    timeout: 15000,
  });
}

test.describe("PinayMate authenticated web MVP smoke", () => {
  test.skip(
    !EMAIL || !PASSWORD,
    "Set PM_WEB_MVP_EMAIL and PM_WEB_MVP_PASSWORD for authenticated MVP smoke.",
  );

  const viewports = [
    { name: "mobile", width: 390, height: 844 },
    { name: "laptop", width: 1366, height: 900 },
  ];

  for (const viewport of viewports) {
    test(`${viewport.name}: sign in and core app shell`, async ({ page }) => {
      test.setTimeout(90000);
      await page.setViewportSize(viewport);
      const noise = collectPageNoise(page);

      await signIn(page);
      await assertBottomNav(page);

      await openTab(page, "Liked You");
      await openTab(page, "Messages");
      await openTab(page, "You");
      await openTab(page, "Discover");

      await assertBottomNav(page);
      await assertNoCriticalNoise(noise);
    });
  }

  test("laptop: account setup and upload screens render", async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1366, height: 900 });

    await signIn(page);
    const noise = collectPageNoise(page);

    await page.goto(
      `${BASE_URL}/account-setup/basic-info?userType=foreigner&firstName=Smoke`,
      { waitUntil: "domcontentloaded" },
    );
    await expect(page.getByText("Profile basics", { exact: true })).toBeVisible({
      timeout: 20000,
    });

    await page.goto(`${BASE_URL}/account-setup/profile-photos?userType=foreigner`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("Add your photos", { exact: true })).toBeVisible({
      timeout: 20000,
    });
    await expect(
      page.getByText("Photo safety checklist", { exact: true }),
    ).toBeVisible({ timeout: 15000 });
    const photoSnapshot = await snapshotProfilePhotos();
    try {
      await uploadProfilePhotoThroughPicker(page);
    } finally {
      await restoreProfilePhotos(photoSnapshot);
    }

    await page.goto(
      `${BASE_URL}/account-setup/verification-upload?userType=foreigner`,
      { waitUntil: "domcontentloaded" },
    );
    await expect(
      page.getByText("Verify your identity", { exact: true }),
    ).toBeVisible({ timeout: 20000 });
    await expect(
      page.getByText("Review-based verification", { exact: true }),
    ).toBeVisible({ timeout: 15000 });
    const verificationSnapshot = await snapshotVerificationSubmission();
    expect(
      verificationSnapshot.completed ||
        verificationSnapshot.selfiePath ||
        verificationSnapshot.documentPath,
      "disposable proof user should start without verification submission",
    ).toBeFalsy();
    try {
      await submitVerificationThroughPickers(page);
    } finally {
      await cleanupVerificationSubmission(verificationSnapshot);
    }

    await assertNoCriticalNoise(noise);
  });

  test("laptop: profile edit saves and restores a public detail", async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1366, height: 900 });

    await signIn(page);
    const noise = collectPageNoise(page);

    await openProtectedRoute(page, "/profile-settings/edit");
    await expect(page.getByText("Edit Profile", { exact: true })).toBeVisible({
      timeout: 20000,
    });
    await expect(
      page.getByText("Profile details for discovery", { exact: true }),
    ).toBeVisible({ timeout: 15000 });

    const occupationInput = page.getByLabel("Occupation");
    await expect(occupationInput).toBeVisible({ timeout: 15000 });
    const originalOccupation = await occupationInput.inputValue();
    const proofOccupation =
      originalOccupation.trim() === "Web MVP proof"
        ? "Web MVP proof restore check"
        : "Web MVP proof";

    await occupationInput.fill(proofOccupation);
    await saveProfileAndWait(page);

    await openProtectedRoute(page, "/profile-settings/edit");
    await expect(page.getByText("Edit Profile", { exact: true })).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByLabel("Occupation")).toHaveValue(proofOccupation, {
      timeout: 15000,
    });

    await page.getByLabel("Occupation").fill(originalOccupation);
    await saveProfileAndWait(page);

    await assertNoCriticalNoise(noise);
  });

  test("laptop: authenticated beta discovery opens details and demo match chat", async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1366, height: 900 });

    await signIn(page);
    const noise = collectPageNoise(page);

    await expect(page.getByText("Beta demo feed", { exact: true })).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText("Demo profile", { exact: true }).first()).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole("button", { name: "View profile details" }).click();
    await expect(page.getByText("Something feels off?", { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole("button", { name: "Close profile details" }).click();

    await page
      .getByRole("button", { name: "Like this profile", exact: true })
      .click();
    await expect(page.getByText("Demo Match!", { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByText("Demo only. No real like, super like, match, or message was sent."),
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /Open .* in matches/ }).click();
    await expect(page.getByText(/Demo chat/).first()).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByText("Demo chat replies and photos stay local on this device."),
    ).toBeVisible({ timeout: 15000 });

    await assertNoCriticalNoise(noise);
  });

  test("laptop: authenticated beta seeded inbox opens and sends a local reply", async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1366, height: 900 });
    const demoReply =
      "Authenticated demo smoke reply: staying respectful and inside the app.";

    await signIn(page);
    const noise = collectPageNoise(page);

    await openTab(page, "Messages");
    await expect(page.getByText("Beta seeded inbox", { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByText(
        "Sample unread and active chats are shown until real conversations are available.",
      ),
    ).toBeVisible({ timeout: 15000 });

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
    await expect(
      page.getByText("Report safety concern", { exact: true }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Demo block", { exact: true })).toBeVisible();
    await expect(page.getByText("Unmatch only", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Close safety options" }).click();

    await assertNoCriticalNoise(noise);
  });

  test("laptop: privacy, preference, and notification settings save", async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1366, height: 900 });

    await signIn(page);
    const noise = collectPageNoise(page);

    await openProtectedRoute(page, "/profile-settings/privacy");
    await expect(page.getByText("Privacy Settings", { exact: true })).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText("Privacy controls", { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole("button", {
        name: "Request account deletion for support review",
      }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Settings need to reload")).toHaveCount(0);
    const readReceiptsSwitch = page.getByRole("switch", {
      name: /Read Receipts:/i,
    });
    await expect(readReceiptsSwitch).toBeVisible({ timeout: 15000 });
    await expect(readReceiptsSwitch).toBeEnabled();
    await toggleSwitchAndWaitForRpc(
      page,
      readReceiptsSwitch,
      "save_privacy_settings",
    );
    await expect(readReceiptsSwitch).toBeVisible({ timeout: 15000 });
    await expect(readReceiptsSwitch).toBeEnabled();
    await toggleSwitchAndWaitForRpc(
      page,
      readReceiptsSwitch,
      "save_privacy_settings",
    );

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toMatch(/Request account deletion/i);
      await dialog.accept();
    });
    await clickAndWaitForRpc(
      page,
      page.getByRole("button", {
        name: "Request account deletion for support review",
      }),
      "request_account_deletion",
    );
    await expect(
      page.getByText("Deletion request received", { exact: true }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/support review/i).last()).toBeVisible({
      timeout: 15000,
    });

    await openProtectedRoute(page, "/profile-settings/preferences");
    await expect(page.getByText("Match Preferences", { exact: true }).first()).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText("Age range", { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Distance radius", { exact: true })).toBeVisible();
    await expect(page.getByText("Relationship goal", { exact: true })).toBeVisible();
    await expect(page.getByText("Preference signals, not promises")).toBeVisible();
    await page.getByRole("radio", { name: /marriage/i }).click();
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toMatch(/Preferences updated successfully/i);
      await dialog.accept();
    });
    await page.getByRole("button", { name: "Save preferences" }).last().click();
    await expect(page.getByText("Match Preferences", { exact: true }).first()).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText("Preference signals, not promises")).toBeVisible();

    await openProtectedRoute(page, "/profile-settings/notifications");
    await expect(page.getByText("Notifications", { exact: true })).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText("Notification controls", { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole("switch", { name: /Enable push notifications:/ }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Preferences need to reload")).toHaveCount(0);
    const emailUpdatesSwitch = page.getByRole("switch", {
      name: /Email updates:/i,
    });
    await expect(emailUpdatesSwitch).toBeVisible({ timeout: 15000 });
    await expect(emailUpdatesSwitch).toBeEnabled();
    await toggleSwitchAndWaitForRpc(
      page,
      emailUpdatesSwitch,
      "save_notification_preferences",
    );
    await expect(emailUpdatesSwitch).toBeVisible({ timeout: 15000 });
    await expect(emailUpdatesSwitch).toBeEnabled();
    await toggleSwitchAndWaitForRpc(
      page,
      emailUpdatesSwitch,
      "save_notification_preferences",
    );

    await assertNoCriticalNoise(noise);
  });
});
