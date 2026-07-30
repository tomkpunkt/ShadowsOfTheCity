import { expect, test, type Page } from "@playwright/test";

const openStep = async (page: Page, id: string): Promise<void> => {
  await page.locator(`[data-step-id="${id}"]`).click();
};

const selectEntity = async (page: Page, id: string): Promise<void> => {
  const card = page.locator(`[data-entity-id="${id}"]`);
  await card.locator(".entity-card__select").click();
  await expect(card).toHaveClass(/entity-card--selected/);
};

const selectFirstAvailable = async (page: Page, choiceId: string): Promise<void> => {
  const choice = page.locator(`[data-choice-id="${choiceId}"]`);
  await choice.locator(".entity-card__select:not([disabled])").first().click();
  await expect(choice.locator(".status--valid")).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.sessionStorage.getItem("e2e-initialized") === null) {
      window.localStorage.clear();
      window.sessionStorage.setItem("e2e-initialized", "true");
    }
  });
});

test("builds and persists a complete level-one wizard", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".topbar .status--incomplete")).toBeVisible();

  await openStep(page, "ancestry");
  await selectEntity(page, "ancestry.elf");
  await selectEntity(page, "heritage.elf.hochhaus-erbe");

  await openStep(page, "background");
  await selectEntity(page, "background.academic");

  await openStep(page, "class");
  await selectEntity(page, "class.magier");
  await selectFirstAvailable(page, "choice.magier.schule-der-magie");

  await openStep(page, "feats");
  const lockedFeat = page.locator('[data-entity-id="feat.general.athletischer-kampfstil"]');
  await expect(lockedFeat.locator(".entity-card__select")).toBeDisabled();
  await expect(lockedFeat.locator(".entity-card__reason")).toContainText("15");

  await openStep(page, "attributes");
  await page.getByLabel("Intelligenz").click();
  await page.getByLabel("Weisheit").click();

  await openStep(page, "skills");
  const skillChoice = page.locator('[data-choice-id="choice.class-skills.magier"]');
  const availableSkills = skillChoice.locator(".entity-card__select:not([disabled])");
  for (let index = 0; index < 4; index += 1) {
    await availableSkills.nth(index).click();
  }
  await expect(skillChoice.locator(".status--valid")).toBeVisible();

  await openStep(page, "spells");
  await selectFirstAvailable(page, "choice.class-spells.magier");

  await openStep(page, "feats");
  await selectFirstAvailable(page, "choice.ancestry-feat.elf.1");
  await selectFirstAvailable(page, "choice.class-feat.magier.1");
  await selectFirstAvailable(page, "choice.general-feat.1");

  await openStep(page, "review");
  await expect(page.locator(".review-success")).toBeVisible();
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
