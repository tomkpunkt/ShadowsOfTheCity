import { expect, test, type Page } from "@playwright/test";

const openStep = async (page: Page, id: string): Promise<void> => {
  await page.locator(`[data-step-id="${id}"]`).click();
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto("/");
});

test("filters equipment by High-Tech and reports matching results", async ({ page }) => {
  await openStep(page, "equipment");
  await page.getByLabel("Technologieniveau").selectOption("high-tech");

  await expect(page.locator('[data-entity-id="equipment.computer"]')).toBeVisible();
  await expect(page.locator('[data-entity-id="armor.kettenhemd"]')).toHaveCount(0);
  await expect(page.locator(".active-filters")).toContainText("1 aktive Eingrenzung");
});

test("shows arkanotechnical items with localized labels", async ({ page }) => {
  await openStep(page, "equipment");
  await page.getByLabel("Technologieniveau").selectOption("magitech");

  await expect(page.locator('[data-entity-id="weapon.1-bogen"]')).toBeVisible();
  await expect(page.locator('[data-entity-id="weapon.1-bogen"]')).toContainText("Arkanotechnisch");
});

test("groups weapons by subcategory with stable counts", async ({ page }) => {
  await openStep(page, "equipment");
  await page.getByRole("button", { name: "Waffen", exact: true }).click();
  await page.getByLabel("Gruppierung").selectOption("subcategory");

  await expect(page.locator('[data-subcategory="firearm"] > header')).toContainText("Schusswaffe");
  await expect(page.locator('[data-subcategory="melee-weapon"] > header')).toContainText(
    "Nahkampfwaffe"
  );
  await expect(page.locator(".catalog-group > header span").first()).not.toHaveText("0");
});

test("opens an illegal draft and explains the unresolved limitation", async ({ page }) => {
  await openStep(page, "compendium");
  await page.getByLabel("Verfügbarkeit").selectOption("illegal");
  await page.locator('[data-entity-id="weapon.seelenfanger"] .entity-card__body').click();

  await expect(page.locator(".detail-drawer--open > header h2")).toHaveText("Seelenfänger");
  await expect(page.locator(".detail-drawer--open")).toContainText("Einschränkungen");
  await expect(page.locator(".detail-drawer--open")).toContainText("Basiswaffe");
});

test("renders a long revised rule text without clipping it in details", async ({ page }) => {
  await openStep(page, "compendium");
  await page.locator(".compendium .search input").fill("Athletik");
  await page.locator('[data-entity-id="skill.athletics"] .entity-card__body').click();

  const ruleSection = page
    .locator(".entity-details__section")
    .filter({ has: page.getByRole("heading", { name: "Regeltext" }) });
  await expect(ruleSection).toBeVisible();
  await expect(ruleSection).toContainText("Stärke");
});

test("finds an entity through its revised description text", async ({ page }) => {
  await openStep(page, "compendium");
  await page.locator(".compendium .search input").fill("Sprach- und Datenkommunikation");

  await expect(page.locator('[data-entity-id="equipment.telefon"]')).toBeVisible();
  await expect(page.locator(".section-heading .count")).toHaveText("1");
});
