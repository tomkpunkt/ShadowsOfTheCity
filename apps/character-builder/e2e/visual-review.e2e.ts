import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

const screenshotDirectory = path.resolve("docs/review/screenshots");

const openStep = async (page: Page, id: string): Promise<void> => {
  await page.locator(`[data-step-id="${id}"]`).click();
  await expect(page.locator(`[data-step-id="${id}"]`)).toHaveClass(/is-active/);
};

const pageShot = async (page: Page, name: string): Promise<void> => {
  await page.screenshot({
    path: path.join(screenshotDirectory, `${name}.png`),
    fullPage: true
  });
};

const drawerShot = async (page: Page, name: string): Promise<void> => {
  await page.locator(".detail-drawer--open").screenshot({
    path: path.join(screenshotDirectory, `${name}.png`)
  });
};

const openCompendiumEntity = async (page: Page, id: string, name: string): Promise<void> => {
  await openStep(page, "compendium");
  await page.locator(".compendium .search input").fill(name);
  await page.locator(`[data-entity-id="${id}"] .entity-card__body`).click();
  await expect(page.locator(".detail-drawer--open")).toBeVisible();
};

test("captures the central visual-quality states", async ({ page }) => {
  await mkdir(screenshotDirectory, { recursive: true });
  await page.addInitScript(() => window.localStorage.clear());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await pageShot(page, "01-start");

  await openStep(page, "ancestry");
  await pageShot(page, "02-ancestry");
  await openStep(page, "background");
  await pageShot(page, "03-background");
  await openStep(page, "class");
  await pageShot(page, "04-class");
  await page.locator('[data-entity-id="class.magier"] .entity-card__select').click();

  await openStep(page, "feats");
  await pageShot(page, "05-feats");
  await pageShot(page, "11-locked-option");
  await openStep(page, "spells");
  await pageShot(page, "06-spells");

  await openCompendiumEntity(
    page,
    "feat.general.verbesserte-wahrnehmung",
    "Verbesserte Wahrnehmung"
  );
  await drawerShot(page, "07-feat-detail");
  await page.getByTitle("Details schließen").click();
  await openCompendiumEntity(page, "spell.feuerball", "Feuerball");
  await drawerShot(page, "08-spell-detail");
  await page.getByTitle("Details schließen").click();
  await openCompendiumEntity(page, "class.magier", "Magier");
  await drawerShot(page, "09-class-detail");
  await page.getByTitle("Details schließen").click();
  await openCompendiumEntity(page, "ancestry.elf", "Elf");
  await page.locator(".detail-drawer .markdown-content table").first().scrollIntoViewIfNeeded();
  await drawerShot(page, "10-markdown-table");
  await page.getByTitle("Details schließen").click();

  await openStep(page, "review");
  await pageShot(page, "12-review");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await pageShot(page, "13-mobile");
});

test("captures editorial and equipment catalog states", async ({ page }) => {
  await mkdir(screenshotDirectory, { recursive: true });
  await page.addInitScript(() => window.localStorage.clear());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  await openStep(page, "equipment");
  await pageShot(page, "14-equipment-categories");

  await page.getByLabel("Nach Technologie unterteilen").check();
  await pageShot(page, "15-technology-subgroups");

  await page.getByLabel("Technologieniveau").selectOption("high-tech");
  await page.getByLabel("Verfügbarkeit").selectOption("common");
  await pageShot(page, "16-combined-equipment-filters");

  await page.locator('[data-entity-id="equipment.computer"]').screenshot({
    path: path.join(screenshotDirectory, "17-equipment-card.png")
  });

  await openCompendiumEntity(page, "weapon.pistole", "Pistole");
  await drawerShot(page, "18-weapon-detail");
  await page.getByTitle("Details schließen").click();

  await openCompendiumEntity(page, "armor.moderne-vollrustung", "Moderne Vollrüstung");
  await drawerShot(page, "19-armor-detail");
  await page.getByTitle("Details schließen").click();

  await openCompendiumEntity(page, "equipment.computer", "Computer");
  await drawerShot(page, "20-high-tech-item");
  await page.getByTitle("Details schließen").click();

  await openCompendiumEntity(page, "armor.kettenhemd", "Kettenhemd");
  await drawerShot(page, "21-archaic-item");
  await page.getByTitle("Details schließen").click();

  await openCompendiumEntity(page, "armor.magische-rustung", "Magische Rüstung");
  await drawerShot(page, "22-arcane-item");
  await page.getByTitle("Details schließen").click();

  await openCompendiumEntity(page, "weapon.1-bogen", "+1 Bogen");
  await drawerShot(page, "23-magitech-item");
  await page.getByTitle("Details schließen").click();

  await openCompendiumEntity(
    page,
    "feat.general.verbesserte-wahrnehmung",
    "Verbesserte Wahrnehmung"
  );
  await drawerShot(page, "24-long-feat-text");
  await page.getByTitle("Details schließen").click();

  await openCompendiumEntity(page, "spell.feuerball", "Feuerball");
  await drawerShot(page, "25-structured-spell");
  await page.getByTitle("Details schließen").click();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByTitle("Navigation ausklappen").click();
  await openStep(page, "equipment");
  await page.waitForTimeout(220);
  await page.locator(".entity-card").first().scrollIntoViewIfNeeded();
  await page.screenshot({
    path: path.join(screenshotDirectory, "26-mobile-equipment.png"),
    fullPage: false
  });
});
