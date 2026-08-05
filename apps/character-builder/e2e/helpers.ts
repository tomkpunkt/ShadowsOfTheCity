import { expect, type Page } from "@playwright/test";

export const openStep = async (page: Page, id: string): Promise<void> => {
  await page.locator(`[data-step-id="${id}"]`).click();
};

export const selectEntity = async (page: Page, id: string): Promise<void> => {
  const card = page.locator(`[data-entity-id="${id}"]`);
  await card.locator(".entity-card__select").click();
  await expect(card).toHaveClass(/entity-card--selected/);
};

export const selectFirstAvailable = async (page: Page, choiceId: string): Promise<void> => {
  const choice = page.locator(`[data-choice-id="${choiceId}"]`);
  await choice.locator(".entity-card__select:not([disabled])").first().click();
  await expect(choice.locator(".status--valid")).toBeVisible();
};

export const buildCompleteWizard = async (page: Page, includeWeapon = false): Promise<void> => {
  await openStep(page, "ancestry");
  await selectEntity(page, "ancestry.elf");
  await selectEntity(page, "heritage.elf.hochhaus-erbe");

  await openStep(page, "background");
  await selectEntity(page, "background.academic");

  await openStep(page, "class");
  await selectEntity(page, "class.magier");
  await selectFirstAvailable(page, "choice.magier.schule-der-magie");

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

  if (includeWeapon) {
    await openStep(page, "equipment");
    await selectEntity(page, "weapon.schwert");
  }

  await openStep(page, "review");
  await expect(page.locator(".review-success")).toBeVisible();
};
