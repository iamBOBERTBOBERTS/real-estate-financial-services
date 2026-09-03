const { test, expect } = require("@playwright/test");

const backupStorageKeys = [
  "approvalPathBuyers",
  "approvalPathLenders",
  "approvalPathPartners",
  "approvalPathAssistancePrograms",
  "approvalPathAuditLogs",
  "approvalPathCurrentUser",
  "approvalPathSettings",
];

async function currentBackup(page) {
  return page.evaluate(() => {
    const read = (key, fallback) => {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    };
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      buyers: read("approvalPathBuyers", []),
      lenders: read("approvalPathLenders", []),
      partners: read("approvalPathPartners", []),
      assistancePrograms: read("approvalPathAssistancePrograms", []),
      auditLogs: read("approvalPathAuditLogs", []),
      currentUser: read("approvalPathCurrentUser", { name: "Demo Owner", role: "Owner" }),
      settings: read("approvalPathSettings", {}),
    };
  });
}

async function storageSnapshot(page) {
  return page.evaluate((keys) => Object.fromEntries(keys.map((key) => [key, localStorage.getItem(key)])), backupStorageKeys);
}

async function openBackupControls(page) {
  await page.getByRole("button", { name: "Admin Workspace" }).click();
  await page.getByRole("button", { name: "Permissions" }).click();
}

async function chooseBackup(page, backup, mode = "replace") {
  await page.locator("#backupImportMode").selectOption(mode);
  await page.locator("#backupFileInput").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
}

function acceptDialogs(page, messages) {
  const listener = async (dialog) => {
    messages.push(dialog.message());
    await dialog.accept();
  };
  page.on("dialog", listener);
  return () => page.off("dialog", listener);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("core workflow screens render and safety gates exist", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Your next step after a stalled mortgage file." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "A calm place for a complicated file." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Admin Workspace" })).toBeVisible();

  await page.getByRole("button", { name: "Admin Workspace" }).click();
  await expect(page.getByRole("heading", { name: "ApprovalPath OS" })).toBeVisible();
  await expect(page.getByText("Pipeline Snapshot")).toBeVisible();
  await expect(page.getByLabel("Demo Role")).toBeVisible();

  await page.getByRole("button", { name: "Review Buyer" }).click();
  await expect(page.getByRole("button", { name: "Export Partner Packet" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Handoff Status" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Outcome Tracking" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Partner Visibility" })).toBeVisible();

  await page.getByRole("button", { name: "Permissions" }).click();
  await expect(page.getByText("Structured Consent")).toBeVisible();
  await expect(page.getByRole("button", { name: "Export Backup" })).toBeVisible();

  await page.getByRole("button", { name: "Audit Logs" }).click();
  await expect(page.getByText("Audit logs are visible only to Owner and Admin roles.")).toBeVisible();
});

test("non-export role cannot export partner packets", async ({ page }) => {
  await page.getByRole("button", { name: "Admin Workspace" }).click();
  await page.getByLabel("Demo Role").selectOption("Read Only");
  await page.getByRole("button", { name: "Review Buyer" }).click();
  await expect(page.getByRole("button", { name: "Export Partner Packet" })).toBeDisabled();
});

test("buyer portal can create a safe intake", async ({ page }) => {
  const portalForm = page.locator("#portalStartForm");
  await portalForm.getByLabel("Your Name").fill("Jordan Portal");
  await portalForm.getByLabel("Email").fill("jordan@example.com");
  await portalForm.getByLabel("Timeline").selectOption("30 days");
  await portalForm.getByLabel("What stalled the file?").selectOption("Missing documents");
  await portalForm.getByLabel("Plain Notes").fill("I was asked for more documents.");
  await portalForm.getByLabel("I understand this local portal uses estimates and categories only.").check();
  await page.getByRole("button", { name: "Send Safe Intake" }).click();
  await expect(page.getByText("Received. Your file is now in the admin workspace for review.")).toBeVisible();

  await page.getByRole("button", { name: "Admin Workspace" }).click();
  await expect(page.locator("#borrowerTable").getByText("Jordan Portal")).toBeVisible();
});

test("lead imports remain inert in preview and stored workflow views", async ({ page }) => {
  await page.evaluate(() => {
    window.__approvalPathXss = false;
  });
  await page.getByRole("button", { name: "Admin Workspace" }).click();
  await page.locator('[data-view="import"]').click();

  const payload = [{
    name: 'Security Test<img src=x onerror="window.__approvalPathXss=true">',
    email: "security@example.com",
    phone: "541-555-0101",
    notes: '<svg onload="window.__approvalPathXss=true"></svg>Safe notes',
  }];
  await page.locator("#leadFileInput").evaluate((input) => {
    input.removeAttribute("webkitdirectory");
    input.removeAttribute("directory");
  });
  await page.locator("#leadFileInput").setInputFiles({
    name: "security-test.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(payload)),
  });
  await page.getByRole("button", { name: "Check the Leads" }).click();

  await expect(page.locator("#importPreviewTable")).toContainText("Security Test");
  await expect(page.locator("#importPreviewTable img, #importPreviewTable svg")).toHaveCount(0);
  expect(await page.evaluate(() => window.__approvalPathXss)).toBe(false);

  await page.getByRole("button", { name: "Add These Leads" }).click();
  await page.locator('[data-view="queue"]').click();
  await expect(page.locator("#queueSnapshot")).toContainText("Safe notes");
  await expect(page.locator("#queueSnapshot img, #queueSnapshot svg")).toHaveCount(0);
  expect(await page.evaluate(() => window.__approvalPathXss)).toBe(false);
});

test("persisted backup values cannot synthesize consent action controls", async ({ page }) => {
  await openBackupControls(page);
  const backup = await currentBackup(page);
  const buyerId = backup.buyers[0].id;
  backup.buyers[0].name = `Security Buyer<button id="injected-consent-action" data-consent-id="attacker-created">Change consent</button>`;
  await chooseBackup(page, backup);

  const dialogs = [];
  const stopDialogs = acceptDialogs(page, dialogs);
  await page.getByRole("button", { name: "Import Backup" }).click();
  await expect.poll(() => dialogs.length).toBe(1);
  stopDialogs();

  await expect(page.locator("#injected-consent-action")).toHaveCount(0);
  await expect(page.locator('[data-consent-id="attacker-created"]')).toHaveCount(0);
  await expect(page.locator("#consentTable")).toContainText("Security Buyer<button");

  const legitimateAction = page.locator(`[data-consent-id="${buyerId}"]`);
  await expect(legitimateAction).toHaveCount(1);
  await legitimateAction.click();
  await expect(page.locator(`[data-consent-id="${buyerId}"]`)).toHaveText("Mark Signed");
});

test("valid backup merge preserves the workflow and updates matching records", async ({ page }) => {
  await openBackupControls(page);
  const backup = await currentBackup(page);
  const buyerId = backup.buyers[0].id;
  backup.buyers[0].name = "Merged Buyer";
  await chooseBackup(page, backup, "merge");

  const dialogs = [];
  const stopDialogs = acceptDialogs(page, dialogs);
  await page.getByRole("button", { name: "Import Backup" }).click();
  await expect.poll(() => dialogs.length).toBe(1);
  stopDialogs();

  await expect(page.locator(`[data-consent-id="${buyerId}"]`)).toHaveCount(1);
  await expect(page.locator("#consentTable")).toContainText("Merged Buyer");
});

test("malformed later backup collections leave merge storage untouched", async ({ page }) => {
  await openBackupControls(page);
  const backup = await currentBackup(page);
  backup.buyers[0].name = "This must not be stored";
  backup.auditLogs = { malformed: true };
  const before = await storageSnapshot(page);
  await chooseBackup(page, backup, "merge");

  const dialogs = [];
  const stopDialogs = acceptDialogs(page, dialogs);
  await page.getByRole("button", { name: "Import Backup" }).click();
  await expect.poll(() => dialogs.length).toBe(2);
  stopDialogs();

  expect(dialogs[1]).toContain("could not be read");
  expect(await storageSnapshot(page)).toEqual(before);
});

test("quota failure rolls back a partially written replacement", async ({ page }) => {
  await openBackupControls(page);
  const backup = await currentBackup(page);
  backup.buyers[0].name = "This replacement must roll back";
  const before = await storageSnapshot(page);
  await chooseBackup(page, backup, "replace");
  await page.evaluate(() => {
    const originalSetItem = Storage.prototype.setItem;
    let failed = false;
    Storage.prototype.setItem = function setItemWithOneQuotaFailure(key, value) {
      if (!failed && key === "approvalPathLenders") {
        failed = true;
        throw new DOMException("Simulated quota exhaustion", "QuotaExceededError");
      }
      return originalSetItem.call(this, key, value);
    };
  });

  const dialogs = [];
  const stopDialogs = acceptDialogs(page, dialogs);
  await page.getByRole("button", { name: "Import Backup" }).click();
  await expect.poll(() => dialogs.length).toBe(2);
  stopDialogs();

  expect(dialogs[1]).toContain("could not be read");
  expect(await storageSnapshot(page)).toEqual(before);
});
