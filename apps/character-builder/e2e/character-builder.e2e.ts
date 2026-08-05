import { expect, test } from "@playwright/test";

import { buildCompleteWizard, openStep, selectEntity } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.sessionStorage.getItem("e2e-initialized") === null) {
      window.localStorage.clear();
      window.sessionStorage.setItem("e2e-initialized", "true");
    }
  });
});

test("creates a new character from the toolbar after confirmation", async ({ page }) => {
  await page.goto("/");
  await openStep(page, "ancestry");
  await selectEntity(page, "ancestry.elf");

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByTitle("Neuen Charakter anlegen").click();

  await expect(page.getByRole("heading", { level: 1, name: "Übersicht" })).toBeVisible();
  await expect(page.locator(".sidebar__character strong")).toHaveText("Neuer Charakter");
  await expect(page.locator('[data-step-id="ancestry"] .sidebar__state')).toHaveClass(
    /sidebar__state--incomplete/
  );
});

test("builds and persists a complete level-one wizard", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".topbar .status--incomplete")).toBeVisible();

  await buildCompleteWizard(page);
  await openStep(page, "feats");
  const lockedFeat = page.locator('[data-entity-id="feat.general.athletischer-kampfstil"]');
  await expect(lockedFeat.locator(".entity-card__select")).toBeDisabled();
  await expect(lockedFeat.locator(".entity-card__reason")).toContainText("15");
  await openStep(page, "review");
  await expect(page.locator(".topbar .status--valid")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByTitle("JSON exportieren").click();
  const exportedCharacter = await (await downloadPromise).path();
  expect(exportedCharacter).not.toBeNull();

  await openStep(page, "ancestry");
  await selectEntity(page, "ancestry.gnom");
  await openStep(page, "review");
  await expect(page.locator(".topbar .status--invalid")).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles(exportedCharacter);
  await expect(page.locator(".topbar .status--valid")).toBeVisible();
  await openStep(page, "review");
  await expect(page.locator(".review-success")).toBeVisible();

  await page.getByTitle("Lokal speichern").click();
  await page.reload();
  await openStep(page, "review");
  await expect(page.locator(".review-success")).toBeVisible();
});

test("imports a format-one character and exposes migration compatibility", async ({ page }) => {
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles({
    name: "legacy-character.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        formatVersion: 1,
        name: "Legacy Nyx",
        level: 1,
        ancestryId: "ancestry.elf",
        backgroundId: "background.academic",
        classId: "class.magier",
        choices: {},
        attributeBoosts: [],
        inventoryIds: ["legacy.weapon.schwert"]
      })
    )
  });

  await openStep(page, "review");
  await expect(page.getByText("Erfolgreich auf den aktuellen Katalog migriert.")).toBeVisible();
  await expect(page.locator(".sidebar__character strong")).toHaveText("Legacy Nyx");

  await openStep(page, "equipment");
  await expect(page.locator('[data-entity-id="weapon.schwert"]')).toHaveClass(
    /entity-card--selected/
  );
});

test("blocks unresolved rules and invokes the printable character sheet", async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => {
      document.body.dataset["printed"] = "true";
    };
  });
  await page.goto("/");

  await openStep(page, "feats");
  const blockedFeat = page.locator('[data-entity-id="feat.general.zahigkeit"]').first();
  await expect(blockedFeat.locator(".entity-card__select")).toBeDisabled();
  await expect(blockedFeat.locator(".entity-card__reason")).toContainText(
    "rules-decision.feat.zahigkeit-prerequisite"
  );

  await openStep(page, "sheet");
  await page.getByTitle("Charakterbogen drucken").click();
  await expect(page.locator("body")).toHaveAttribute("data-printed", "true");
});

test("plays a wizard session and restores it after reload and JSON reimport", async ({ page }) => {
  await page.goto("/");
  await buildCompleteWizard(page, true);
  await openStep(page, "sheet");

  const hp = page.locator(".play-sheet__vitals > div").first();
  const initialHpText = await hp.locator("strong").innerText();
  const maximumHp = Number(initialHpText.split("/")[1]?.trim());
  expect(maximumHp).toBeGreaterThan(0);

  await page.getByLabel("Trefferpunkte-Betrag").fill("3");
  await page.getByRole("button", { name: "Temporär" }).click();
  await expect(hp).toContainText("+3 temporär");

  await page.getByLabel("Trefferpunkte-Betrag").fill("5");
  await page.getByRole("button", { name: "Schaden" }).click();
  await expect(hp.locator("strong")).toContainText(
    `${String(maximumHp - 2)} / ${String(maximumHp)}`
  );

  await page.getByLabel("Trefferpunkte-Betrag").fill("1");
  await page.getByRole("button", { name: "Heilung" }).click();
  await expect(hp.locator("strong")).toContainText(
    `${String(maximumHp - 1)} / ${String(maximumHp)}`
  );

  await page.getByRole("button", { name: "Zustand", exact: true }).click();
  await page.getByLabel("Zustand", { exact: true }).fill("Benommen");
  await page.getByLabel("Quelle", { exact: true }).fill("E2E");
  await page.getByLabel("Zustand hinzufügen").click();
  await expect(page.locator(".condition-row")).toContainText("Benommen");

  await page.locator(".play-sheet__nav").getByRole("button", { name: "Aktionen" }).click();
  const firstAction = page.locator(".action-row").first();
  await firstAction.locator('button[aria-label$="als verwendet markieren"]').click();
  await expect(firstAction.locator(".usage-control")).toContainText("1 protokolliert");

  await page.locator(".play-sheet__nav").getByRole("button", { name: "Fertigkeiten" }).click();
  const firstSkill = page.locator(".skill-row").first();
  await firstSkill.locator(".roll-value").click();

  await page.locator(".play-sheet__nav").getByRole("button", { name: "Zauber" }).click();
  const consumeSlot = page.getByLabel("Zauberplatz Rang 1 verbrauchen");
  await expect(consumeSlot).toBeEnabled();
  await consumeSlot.click();
  await expect(page.locator('.slot-pips[aria-label="1 Plätze verbraucht"]')).toBeVisible();

  await page.locator(".play-sheet__nav").getByRole("button", { name: "Inventar" }).click();
  const sword = page.locator(".inventory-list article").filter({ hasText: "Schwert" });
  await sword.getByRole("checkbox", { name: "Ausgerüstet" }).check();
  await sword.getByLabel("Menge").fill("2");
  await expect(sword.getByLabel("Menge")).toHaveValue("2");

  await page.locator(".play-sheet__nav").getByRole("button", { name: "Kampf" }).click();
  const attack = page.locator(".attack-row").filter({ hasText: "Schwert" });
  await expect(attack).toBeVisible();
  await attack.locator(".roll-value").click();

  await page.locator(".play-sheet__nav").getByRole("button", { name: "Ressourcen" }).click();
  await page.getByLabel("Ressource", { exact: true }).fill("Fokus");
  await page.getByLabel("Maximum", { exact: true }).fill("3");
  await page.locator(".resource-form select").selectOption("daily");
  await page.getByLabel("Ressource hinzufügen").click();
  const focus = page.locator(".resource-list article").filter({ hasText: "Fokus" });
  await focus.getByLabel("Fokus reduzieren").click();
  await expect(focus).toContainText("2 / 3");

  await page.getByLabel("Formel").fill("1d8+1d6+3");
  await page.getByRole("button", { name: "Würfeln" }).click();
  await expect(page.locator(".dice-history").getByText("1d8+1d6+3")).toBeVisible();

  await page.waitForTimeout(250);
  await page.reload();
  await openStep(page, "sheet");
  await expect(hp.locator("strong")).toContainText(
    `${String(maximumHp - 1)} / ${String(maximumHp)}`
  );
  await expect(
    page.locator(".play-sheet__nav").getByRole("button", { name: "Ressourcen" })
  ).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".resource-list article").filter({ hasText: "Fokus" })).toContainText(
    "2 / 3"
  );
  await expect(page.locator(".dice-history").getByText("1d8+1d6+3")).toBeVisible();

  await page.locator(".play-sheet__nav").getByRole("button", { name: "Bogen & Export" }).click();
  await expect(
    page.locator(".play-sheet").getByRole("heading", { name: "Kompakter Statblock" })
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page
    .locator(".export-actions")
    .getByRole("button", { name: /JSON exportieren/ })
    .click();
  const exportedCharacter = await (await downloadPromise).path();
  expect(exportedCharacter).not.toBeNull();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByTitle("Neuen Charakter anlegen").click();
  await page.locator('input[type="file"]').setInputFiles(exportedCharacter);
  await openStep(page, "sheet");
  await expect(page.locator(".play-sheet__vitals > div").first().locator("strong")).toContainText(
    `${String(maximumHp - 1)} / ${String(maximumHp)}`
  );
});
