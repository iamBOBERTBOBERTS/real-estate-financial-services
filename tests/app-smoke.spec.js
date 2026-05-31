const { test, expect } = require("@playwright/test");

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
