import { describe, expect, it } from "vitest";

import { evaluatePredicate } from "./predicate.js";
import type { CharacterState, EngineContext } from "./types.js";

const hash = "a".repeat(64);

const character: CharacterState = {
  formatVersion: 2,
  contentSchemaVersion: 1,
  catalogHash: hash,
  createdWithVersion: "0.1.0",
  lastSavedWithVersion: "0.1.0",
  name: "Prädikattest",
  level: 5,
  ancestryId: "ancestry.test",
  heritageId: "heritage.test",
  backgroundId: "background.test",
  classId: "class.test",
  choices: { "choice.test": ["feat.test"] },
  attributeBoosts: [],
  inventoryIds: ["weapon.test", "armor.test"],
  equippedItemIds: ["weapon.test", "armor.test"],
  options: { "option.stance": "defensive" },
  migrations: [],
  legacyValues: {}
};

const context: EngineContext = {
  catalog: {
    schemaVersion: 1,
    contentHash: hash,
    aliases: {},
    entities: []
  },
  entities: new Map([
    [
      "weapon.test",
      {
        type: "weapon",
        categoryId: "proficiency.weapon.simple",
        traits: ["trait.item.silent"]
      } as never
    ],
    [
      "armor.test",
      {
        type: "armor",
        categoryId: "proficiency.armor.light",
        traits: []
      } as never
    ]
  ]),
  character,
  attributes: {
    strength: 16,
    dexterity: 14,
    constitution: 12,
    intelligence: 10,
    wisdom: 12,
    charisma: 10
  },
  proficiencyRanks: new Map([["skill.athletics", "expert"]]),
  featIds: new Set(["feat.test"]),
  featureIds: new Set(["feature.test"]),
  traitIds: new Set(["trait.character.test"]),
  spellIds: new Set(["spell.test"]),
  traditions: new Set(["arcane"]),
  inventoryIds: new Set(character.inventoryIds),
  equippedItemIds: new Set(character.equippedItemIds),
  selectedOptionIds: new Set(["feat.test"]),
  characterOptions: new Map(Object.entries(character.options)),
  resources: new Map([["resource.focus", 2]])
};

describe("predicate evaluation", () => {
  it("evaluates nested bounds and identity predicates", () => {
    expect(
      evaluatePredicate(
        {
          all: [
            { characterLevel: { gte: 3, lte: 6 } },
            { attribute: { id: "strength", gte: 16, lte: 18 } },
            { class: { id: "class.test" } },
            { ancestry: { id: "ancestry.test" } },
            { heritage: { id: "heritage.test" } },
            { background: { id: "background.test" } }
          ]
        },
        context
      ).met
    ).toBe(true);
  });

  it("evaluates choices, options, equipment and resources", () => {
    const predicates = [
      { previousChoice: { choiceId: "choice.test", optionId: "feat.test" } },
      { characterOption: { key: "option.stance", value: "defensive" } },
      { equippedItem: { id: "weapon.test" } },
      { itemTrait: { id: "trait.item.silent" } },
      { weaponCategory: { id: "proficiency.weapon.simple" } },
      { armorCategory: { id: "proficiency.armor.light" } },
      { resource: { id: "resource.focus", gte: 2 } }
    ];

    expect(predicates.every((predicate) => evaluatePredicate(predicate, context).met)).toBe(true);
  });

  it("returns expected and actual values for failed upper bounds", () => {
    expect(evaluatePredicate({ characterLevel: { lte: 4 } }, context)).toMatchObject({
      met: false,
      failures: [{ code: "LEVEL_TOO_HIGH", expected: 4, actual: 5 }]
    });
  });
});
