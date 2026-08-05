import { CatalogSchema, type Catalog, type CharacterDocument } from "@sotc/shared";
import { calculateCharacter, type AttributeId } from "@sotc/rules-engine";
import { describe, expect, it } from "vitest";

import catalogJson from "../../../generated/catalog.json" with { type: "json" };

import { migrateCharacter } from "./storage.js";

const catalog: Catalog = CatalogSchema.parse(catalogJson);

const completeChoices = (initial: CharacterDocument): CharacterDocument => {
  const character = structuredClone(initial);
  for (let pass = 0; pass < 10; pass += 1) {
    const result = calculateCharacter(catalog, character);
    let changed = false;
    for (const choice of result.choices) {
      const missing = choice.min - choice.selectedIds.length;
      const selection = choice.options
        .filter((option) => option.status === "available")
        .slice(0, missing)
        .map((option) => option.entity.id);
      if (missing > 0 && selection.length === missing) {
        character.build.choices[choice.choiceId] = [...choice.selectedIds, ...selection];
        changed = true;
      }
    }
    if (!changed) {
      return character;
    }
  }
  return character;
};

describe("legacy character regression", () => {
  it("migrates and evaluates a complete real-content build without data loss", () => {
    const imported = migrateCharacter(
      {
        formatVersion: 1,
        catalogHash: "legacy-catalog",
        name: "Rika",
        level: 1,
        ancestryId: "ancestry.ork",
        backgroundId: "background.worker",
        classId: "class.soldner",
        choices: {},
        attributeBoosts: ["strength", "constitution"] satisfies AttributeId[],
        inventoryIds: ["legacy.weapon.schwert"],
        campaignNote: "Aus dem alten Charakterbogen erhalten"
      },
      catalog
    );
    const character = completeChoices(imported.document);
    const result = calculateCharacter(catalog, character);

    expect(imported.compatibility).toBe("migrated");
    expect(imported.document.build.inventoryIds).toEqual(["weapon.schwert"]);
    expect(imported.document.legacyValues).toEqual({
      campaignNote: "Aus dem alten Charakterbogen erhalten"
    });
    expect(result.state, result.issues.map((issue) => issue.message).join("\n")).toBe("valid");
    expect(
      Object.fromEntries(
        Object.entries(result.attributes).map(([attribute, value]) => [attribute, value.value])
      )
    ).toEqual({
      strength: 16,
      dexterity: 10,
      constitution: 16,
      intelligence: 8,
      wisdom: 10,
      charisma: 10
    });
    expect(result.hitPoints.value).toBe(23);
    expect(result.armorClass.value).toBe(13);
    expect(
      Object.fromEntries(Object.entries(result.saves).map(([save, value]) => [save, value.value]))
    ).toEqual({ fortitude: 6, reflex: 3, will: 3 });
    expect(result.perception.value).toBe(3);
    expect(result.skills["skill.athletics"]?.value).toBe(6);
    expect(result.proficiencies["proficiency.weapon.simple"]).toBe("trained");
    expect(result.featureIds).toEqual([
      "class-feature.soldner.kampfstil",
      "class-feature.soldner.kampfstil.frontkampfer",
      "class-feature.soldner.soldnerisches-training"
    ]);
    expect(result.featIds).toEqual([
      "feat.ancestry-feature.ork.volksfertigkeit-blutresonanz",
      "feat.ancestry.ork.wilde-entschlossenheit",
      "feat.class.soldner.zielsicherer-schlag",
      "feat.general.athletischer-kampfstil"
    ]);
    expect(result.spells.knownIds).toEqual([]);
    expect(result.weaponAttacks["weapon.schwert"]?.attack.value).toBeGreaterThan(0);
    expect(result.inventory).toEqual([
      expect.objectContaining({ id: "weapon.schwert", equipped: true, known: true })
    ]);
    expect(result.choices.every((choice) => choice.state === "valid")).toBe(true);
    expect(result.issues).toEqual([]);
  });
});
