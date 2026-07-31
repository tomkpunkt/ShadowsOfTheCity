import { CatalogSchema, type Catalog, type CharacterDocument } from "@sotc/shared";
import { describe, expect, it } from "vitest";

import catalogJson from "../../../generated/catalog.json" with { type: "json" };

import { calculateCharacter } from "./engine.js";
import { emptySessionState } from "./session.js";
import type { AttributeId, CalculatedCharacter, CharacterState } from "./types.js";

const catalog: Catalog = CatalogSchema.parse(catalogJson);
const entities = new Map(catalog.entities.map((entity) => [entity.id, entity]));
const boostOrder: AttributeId[] = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma"
];

const completeLevelOneCharacter = (
  ancestryId: string,
  backgroundId: string,
  classId: string,
  preferredBoosts: AttributeId[] = boostOrder
): { character: CharacterState; result: CalculatedCharacter } => {
  const ancestry = entities.get(ancestryId);
  const background = entities.get(backgroundId);
  if (ancestry?.type !== "ancestry" || background?.type !== "background") {
    throw new Error("Invalid regression fixture identity");
  }

  const heritage = catalog.entities.find(
    (entity) => entity.type === "heritage" && entity.ancestryId === ancestryId
  );
  const freeBoosts = ancestry.freeBoosts + background.freeBoosts;
  const character: CharacterState = {
    name: `Regression ${classId}`,
    level: 1,
    ancestryId,
    heritageId: heritage?.id,
    backgroundId,
    classId,
    choices: {},
    attributeBoosts: preferredBoosts.slice(0, freeBoosts),
    inventoryIds: [],
    options: {},
    biography: {
      description: "",
      appearance: "",
      personality: "",
      motivation: "",
      relationships: "",
      organizations: "",
      contacts: "",
      goals: "",
      backgroundNotes: ""
    }
  };
  const document: CharacterDocument = {
    formatVersion: 3,
    contentSchemaVersion: 1,
    catalogHash: catalog.contentHash,
    createdWithVersion: "0.1.0",
    lastSavedWithVersion: "0.1.0",
    build: character,
    session: emptySessionState(),
    migrations: [],
    legacyValues: {}
  };

  for (let pass = 0; pass < 10; pass += 1) {
    const result = calculateCharacter(catalog, document);
    let changed = false;
    for (const choice of result.choices) {
      const missing = choice.min - choice.selectedIds.length;
      if (missing <= 0) {
        continue;
      }
      const selection = choice.options
        .filter((option) => option.status === "available")
        .slice(0, missing)
        .map((option) => option.entity.id);
      if (selection.length === missing) {
        character.choices[choice.choiceId] = [...choice.selectedIds, ...selection];
        changed = true;
      }
    }
    if (!changed) {
      return { character, result };
    }
  }

  return { character, result: calculateCharacter(catalog, document) };
};

describe("compiled content regression characters", () => {
  it.each([
    {
      role: "martial",
      ancestryId: "ancestry.ork",
      backgroundId: "background.worker",
      classId: "class.soldner",
      boosts: ["strength", "constitution"] as AttributeId[],
      spellcaster: false
    },
    {
      role: "skill",
      ancestryId: "ancestry.mensch",
      backgroundId: "background.underworld-contact",
      classId: "class.agent",
      boosts: ["dexterity", "intelligence", "charisma"] as AttributeId[],
      spellcaster: false
    },
    {
      role: "caster",
      ancestryId: "ancestry.elf",
      backgroundId: "background.academic",
      classId: "class.magier",
      boosts: ["intelligence", "wisdom"] as AttributeId[],
      spellcaster: true
    },
    {
      role: "technical",
      ancestryId: "ancestry.gnom",
      backgroundId: "background.corporate-child",
      classId: "class.ingenieur",
      boosts: ["constitution", "intelligence"] as AttributeId[],
      spellcaster: false
    }
  ])(
    "resolves a complete $role build",
    ({ ancestryId, backgroundId, classId, boosts, spellcaster }) => {
      const { character, result } = completeLevelOneCharacter(
        ancestryId,
        backgroundId,
        classId,
        boosts
      );

      expect(result.state, result.issues.map((issue) => issue.message).join("\n")).toBe("valid");
      expect(result.hitPoints.value).toBeGreaterThan(0);
      expect(result.classDc?.value).toBeGreaterThan(10);
      expect(result.featureIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.skills)).toHaveLength(19);
      expect(
        character.choices[`choice.class-skills.${classId.replace("class.", "")}`]
      ).toHaveLength(4);
      if (spellcaster) {
        expect(result.spellDc?.value).toBeGreaterThan(10);
        expect(result.spellSlots.length).toBeGreaterThan(0);
      } else {
        expect(result.spellDc).toBeUndefined();
      }
    }
  );
});
