import { expect, test, type Page } from "@playwright/test";

const openStep = async (page: Page, id: string): Promise<void> => {
  await page.locator(`[data-step-id="${id}"]`).click();
};

const openCompendiumEntity = async (page: Page, id: string, name: string): Promise<void> => {
  await openStep(page, "compendium");
  const search = page.locator(".compendium .search input");
  await search.fill(name);
  await page.locator(`[data-entity-id="${id}"] .entity-card__body`).click();
  await expect(page.locator(".detail-drawer--open")).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto("/");
});

test("shows all main builder areas with German navigation", async ({ page }) => {
  const areas = [
    ["overview", "Übersicht"],
    ["ancestry", "Abstammung"],
    ["background", "Hintergrund"],
    ["class", "Klasse"],
    ["attributes", "Attribute"],
    ["skills", "Fertigkeiten"],
    ["feats", "Talente und Merkmale"],
    ["spells", "Zauber"],
    ["equipment", "Ausrüstung"],
    ["compendium", "Kompendium"],
    ["review", "Abschlussprüfung"],
    ["sheet", "Charakterbogen"]
  ] as const;
  for (const [id, heading] of areas) {
    await openStep(page, id);
    await expect(page.locator(".workspace__header h1")).toHaveText(heading);
  }
});

test("audits a class across multiple character levels", async ({ page }) => {
  await openStep(page, "class");
  await page.locator('[data-entity-id="class.magier"] .entity-card__select').click();
  await page.locator(".level-control select").selectOption("7");
  await openStep(page, "feats");

  await expect(page.locator('[data-choice-id="choice.class-feat.magier.6"]')).toBeVisible();
  await expect(
    page.locator('[data-entity-id="class-feature.magier.zaubererweiterung"]')
  ).toBeVisible();
});

test("renders a complex spell detail with structured parameters and Markdown", async ({ page }) => {
  await openCompendiumEntity(page, "spell.feuerball", "Feuerball");

  await expect(page.locator(".entity-details__grid")).toContainText("Rang");
  await expect(page.locator(".entity-details__grid")).toContainText("Arkan");
  await expect(page.locator(".markdown-content table")).toBeVisible();
  await expect(page.locator(".text-rule-notice")).toContainText("nicht automatisch berechnet");
});

test("renders nested Markdown, quotes, and tables for ancestry content", async ({ page }) => {
  await openCompendiumEntity(page, "ancestry.elf", "Elf");

  await expect(page.locator(".markdown-content h2").first()).toBeVisible();
  await expect(page.locator(".markdown-content table").first()).toBeVisible();
  await expect(page.locator(".detail-drawer")).not.toContainText("ancestry.elf");
});

test("shows class progression and opens referenced details", async ({ page }) => {
  await openCompendiumEntity(page, "class.magier", "Magier");

  await expect(page.locator(".detail-table")).toBeVisible();
  await expect(page.locator(".detail-table tbody tr")).toHaveCount(15);
  await page.locator(".detail-table .entity-reference").first().click();
  await expect(page.locator(".detail-drawer--open > header h2")).not.toHaveText("Magier");
});

test("searches, combines, and resets compendium filters", async ({ page }) => {
  await openStep(page, "compendium");
  await page.getByLabel("Inhaltstyp").selectOption("spell");
  await page.locator(".compendium .search input").fill("Feuer");

  await expect(page.locator('[data-entity-id="spell.feuerball"]')).toBeVisible();
  await expect(page.locator(".active-filters")).toContainText("2 aktive Eingrenzungen");
  await page.getByRole("button", { name: "Zurücksetzen" }).click();
  await expect(page.getByLabel("Inhaltstyp")).toHaveValue("all");
});

test("keeps long cards and the detail drawer inside a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByTitle("Navigation ausklappen").click();
  await openStep(page, "compendium");
  await page.locator(".compendium .search input").fill("Verbesserte Wahrnehmung");
  await page
    .locator('[data-entity-id="feat.general.verbesserte-wahrnehmung"] button')
    .first()
    .click();

  await page.waitForTimeout(220);
  const drawerBox = await page.locator(".detail-drawer--open").boundingBox();
  expect(drawerBox).not.toBeNull();
  expect((drawerBox?.x ?? 391) + (drawerBox?.width ?? 0)).toBeLessThanOrEqual(390.5);
  await expect(page.locator(".detail-drawer--open > header h2")).toHaveText(
    "Verbesserte Wahrnehmung"
  );
});
