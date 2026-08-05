import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

import { buildCompleteWizard, openStep } from "./helpers.js";

const screenshotDirectory = path.resolve("docs/review/screenshots");

test.setTimeout(60_000);

const setSheetView = async (page: Page, name: string): Promise<void> => {
  const button = page.locator(".play-sheet__nav").getByRole("button", { name });
  await button.click();
  await expect(button).toHaveAttribute("aria-current", "page");
};

const viewportShot = async (page: Page, name: string): Promise<void> => {
  await page.screenshot({
    path: path.join(screenshotDirectory, `${name}.png`),
    fullPage: false
  });
};

test("captures desktop, mobile, print, and statblock character-sheet references", async ({
  page
}) => {
  await mkdir(screenshotDirectory, { recursive: true });
  await page.addInitScript(() => window.localStorage.clear());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await buildCompleteWizard(page, true);
  await openStep(page, "sheet");

  await viewportShot(page, "27-sheet-desktop-overview");
  await setSheetView(page, "Kampf");
  await viewportShot(page, "28-sheet-desktop-combat");
  await setSheetView(page, "Zauber");
  await viewportShot(page, "29-sheet-desktop-spells");
  await setSheetView(page, "Inventar");
  await viewportShot(page, "30-sheet-desktop-inventory");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByTitle("Navigation einklappen").click();
  await setSheetView(page, "Übersicht");
  await viewportShot(page, "31-sheet-mobile-overview");
  await setSheetView(page, "Kampf");
  await viewportShot(page, "32-sheet-mobile-combat");
  await setSheetView(page, "Zauber");
  await viewportShot(page, "33-sheet-mobile-spells");
  await setSheetView(page, "Inventar");
  await viewportShot(page, "34-sheet-mobile-inventory");

  await page.setViewportSize({ width: 794, height: 1123 });
  await page.emulateMedia({ media: "print" });
  const printPages = page.locator(".print-page");
  await expect(printPages).toHaveCount(5);
  await printPages.nth(0).screenshot({
    path: path.join(screenshotDirectory, "35-sheet-print-core.png")
  });
  await printPages.nth(1).screenshot({
    path: path.join(screenshotDirectory, "36-sheet-print-combat.png")
  });
  await printPages.nth(3).screenshot({
    path: path.join(screenshotDirectory, "37-sheet-print-spells.png")
  });

  await page.emulateMedia({ media: "screen" });
  await page.setViewportSize({ width: 1024, height: 900 });
  await setSheetView(page, "Bogen & Export");
  await page.locator(".statblock-text").screenshot({
    path: path.join(screenshotDirectory, "38-sheet-statblock.png")
  });
});
