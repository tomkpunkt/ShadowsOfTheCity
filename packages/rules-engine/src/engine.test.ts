import { describe, expect, it } from "vitest";

import { calculateCharacter } from "./engine.js";
import type { CharacterState } from "./types.js";

const hash = "a".repeat(64);

const catalog = {
  schemaVersion: 1,
  contentHash: hash,
  aliases: {},
  entities: [
    {
      schemaVersion: 1,
      id: "ancestry.test",
      type: "ancestry",
      name: "Testabstammung",
      source: "test.source",
      status: "canonical",
      description: "",
      traits: [],
      references: [],
      hp: 8,
      size: "medium",
      speed: 30,
      boosts: ["strength"],
      flaws: [],
      freeBoosts: 1,
      languageIds: ["language.common"],
      additionalLanguagesFromIntelligence: true,
      featureIds: [],
      heritageIds: [],
      featIds: []
    },
    {
      schemaVersion: 1,
      id: "background.test",
      type: "background",
      name: "Testbackground",
      source: "test.source",
      status: "canonical",
      description: "",
      traits: [],
      references: [],
      boosts: ["strength", "wisdom"],
      freeBoosts: 1,
      trainedSkillIds: ["skill.athletics"],
      grantedFeatIds: [],
      choiceIds: [],
      effects: []
    },
    {
      schemaVersion: 1,
      id: "class.test",
      type: "class",
      name: "Testklasse",
      source: "test.source",
      status: "canonical",
      description: "",
      traits: [],
      references: [],
      keyAttributes: ["strength"],
      hpPerLevel: 10,
      trainedSkillChoices: 0,
      initialProficiencies: {
        perception: "trained",
        saves: {
          fortitude: "trained",
          reflex: "trained",
          will: "trained"
        },
        skills: {},
        weapons: {
          "proficiency.weapon.simple": "trained"
        },
        armor: {
          "proficiency.armor.light": "trained"
        }
      },
      featureIds: ["class-feature.test.guard", "class-feature.test.veteran"],
      choiceIds: ["choice.test-feat"],
      spellcastingProgressionId: "spellcasting.test"
    },
    {
      schemaVersion: 1,
      id: "class-feature.test.guard",
      type: "class-feature",
      name: "Wachhaltung",
      source: "test.source",
      status: "canonical",
      description: "",
      traits: [],
      references: [],
      classId: "class.test",
      level: 1,
      prerequisites: [],
      effects: [
        {
          kind: "modifier",
          target: "armor-class",
          bonusType: "status",
          value: 2
        },
        {
          kind: "resource",
          resourceId: "resource.focus",
          delta: 1
        }
      ],
      choiceIds: []
    },
    {
      schemaVersion: 1,
      id: "class-feature.test.veteran",
      type: "class-feature",
      name: "Veteran",
      source: "test.source",
      status: "canonical",
      description: "",
      traits: [],
      references: [],
      classId: "class.test",
      level: 5,
      prerequisites: [],
      effects: [{ kind: "hit-points", perLevel: 2 }],
      choiceIds: []
    },
    {
      schemaVersion: 1,
      id: "feat.test.strong",
      type: "feat",
      name: "Stark",
      source: "test.source",
      status: "canonical",
      description: "",
      traits: [],
      references: [],
      category: "class",
      classId: "class.test",
      level: 1,
      prerequisites: [{ attribute: { id: "strength", gte: 16 } }],
      effects: [
        { kind: "hit-points", perLevel: 1 },
        {
          kind: "modifier",
          target: "armor-class",
          bonusType: "status",
          value: 1
        }
      ]
    },
    {
      schemaVersion: 1,
      id: "feat.test.locked",
      type: "feat",
      name: "Erfahren",
      source: "test.source",
      status: "canonical",
      description: "",
      traits: [],
      references: [],
      category: "class",
      classId: "class.test",
      level: 1,
      prerequisites: [
        {
          proficiency: {
            id: "skill.athletics",
            rankAtLeast: "expert"
          }
        }
      ],
      effects: []
    },
    {
      schemaVersion: 1,
      id: "choice.test-feat",
      type: "choice",
      name: "Test-Feat",
      source: "test.source",
      status: "canonical",
      description: "",
      traits: [],
      references: [],
      choice: {
        id: "choice.test-feat",
        level: 1,
        kind: "feat",
        min: 0,
        max: 1,
        filter: {
          entityTypes: ["feat"],
          classId: "class.test",
          category: "class",
          maxLevel: 1
        },
        prerequisites: [{ class: { id: "class.test" } }],
        effects: [],
        excludes: [],
        repeatable: false
      }
    },
    {
      schemaVersion: 1,
      id: "skill.athletics",
      type: "skill",
      name: "Athletik",
      source: "test.source",
      status: "canonical",
      description: "",
      traits: [],
      references: [],
      attribute: "strength"
    },
    {
      schemaVersion: 1,
      id: "language.common",
      type: "language",
      name: "Gemeinsprache",
      source: "test.source",
      status: "canonical",
      description: "",
      traits: [],
      references: [],
      rarity: "common"
    },
    {
      schemaVersion: 1,
      id: "resource.focus",
      type: "resource",
      name: "Fokus",
      source: "test.source",
      status: "canonical",
      description: "",
      traits: [],
      references: [],
      minimum: 0,
      maximum: 3,
      refresh: "day"
    },
    {
      schemaVersion: 1,
      id: "spellcasting.test",
      type: "spellcasting-progression",
      name: "Testmagie",
      source: "test.source",
      status: "canonical",
      description: "",
      traits: [],
      references: [],
      classId: "class.test",
      tradition: "arcane",
      mode: "prepared",
      castingAttribute: "wisdom",
      proficiencyByLevel: {
        "1": "trained",
        "5": "expert"
      },
      slotsByLevel: {
        "1": [2],
        "5": [3, 3, 2]
      }
    },
    {
      schemaVersion: 1,
      id: "armor.leather",
      type: "armor",
      name: "Leder",
      source: "test.source",
      status: "canonical",
      description: "",
      traits: [],
      references: [],
      level: 0,
      priceGp: 10,
      bulk: 1,
      hands: 0,
      category: "armor",
      subcategory: "light-armor",
      technologyLevel: "archaic",
      availability: "common",
      origins: ["civilian"],
      categoryId: "trait.item.armor.light",
      itemBonus: 1,
      dexterityCap: 4
    },
    {
      schemaVersion: 1,
      id: "weapon.club",
      type: "weapon",
      name: "Keule",
      source: "test.source",
      status: "canonical",
      description: "",
      traits: [],
      references: [],
      level: 0,
      priceGp: 1,
      bulk: 1,
      hands: 1,
      category: "weapon",
      subcategory: "melee-weapon",
      technologyLevel: "archaic",
      availability: "common",
      origins: ["civilian"],
      categoryId: "trait.item.weapon.simple",
      groupId: "trait.weapon-group.blunt",
      damage: {
        dice: 1,
        die: "d6",
        type: "damage.bludgeoning",
        modifier: "strength",
        flat: 0
      }
    }
  ]
};

const character = (overrides: Partial<CharacterState> = {}): CharacterState => ({
  formatVersion: 2,
  contentSchemaVersion: 1,
  catalogHash: hash,
  createdWithVersion: "0.1.0",
  lastSavedWithVersion: "0.1.0",
  name: "Ada",
  level: 1,
  ancestryId: "ancestry.test",
  backgroundId: "background.test",
  classId: "class.test",
  choices: {
    "choice.test-feat": ["feat.test.strong"]
  },
  attributeBoosts: ["strength", "dexterity"],
  inventoryIds: ["armor.leather", "weapon.club"],
  equippedItemIds: ["armor.leather", "weapon.club"],
  options: {},
  migrations: [],
  legacyValues: {},
  ...overrides
});

describe("calculateCharacter", () => {
  it("calculates a valid level-one character with provenance", () => {
    const result = calculateCharacter(catalog, character());

    expect(result.state).toBe("valid");
    expect(result.attributes.strength.value).toBe(16);
    expect(result.hitPoints.value).toBe(19);
    expect(result.hitPoints.breakdown.map((entry) => entry.sourceId)).toContain("feat.test.strong");
    expect(result.resources["resource.focus"]).toMatchObject({
      value: 1,
      breakdown: [expect.objectContaining({ sourceId: "class-feature.test.guard" })]
    });
    expect(result.featureIds).toContain("class-feature.test.guard");
    expect(result.featureIds).not.toContain("class-feature.test.veteran");
  });

  it("uses the strongest typed bonus and stacks untyped contributions", () => {
    const result = calculateCharacter(catalog, character());

    expect(result.armorClass.value).toBe(17);
    const statusEntries = result.armorClass.breakdown.filter((entry) => entry.kind === "status");
    expect(statusEntries).toHaveLength(1);
    expect(statusEntries[0]?.value).toBe(2);
  });

  it("applies level progression to features, hit points, and spell slots", () => {
    const result = calculateCharacter(catalog, character({ level: 5 }));

    expect(result.featureIds).toContain("class-feature.test.veteran");
    expect(result.hitPoints.value).toBe(73);
    expect(result.spellSlots.map((entry) => entry.slots.value)).toEqual([3, 3, 2]);
    expect(result.spellSlots[0]?.slots.breakdown[0]?.sourceId).toBe("spellcasting.test");
    expect(result.spellAttack?.breakdown).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: "proficiency.spell.arcane",
          value: 9
        })
      ])
    );
  });

  it("keeps a now-invalid choice and explains the unmet prerequisite", () => {
    const result = calculateCharacter(
      catalog,
      character({
        choices: {
          "choice.test-feat": ["feat.test.locked"]
        }
      })
    );

    expect(result.state).toBe("invalid");
    const choice = result.choices.find((candidate) => candidate.choiceId === "choice.test-feat");
    expect(choice?.selectedIds).toEqual(["feat.test.locked"]);
    expect(choice?.options.find((option) => option.entity.id === "feat.test.locked")).toMatchObject(
      {
        status: "invalid",
        failures: [
          expect.objectContaining({
            code: "PROFICIENCY_TOO_LOW",
            expected: "expert",
            actual: "trained"
          })
        ]
      }
    );
  });

  it("reports missing core decisions as incomplete", () => {
    const result = calculateCharacter(
      catalog,
      character({
        ancestryId: undefined,
        choices: {},
        attributeBoosts: ["strength"]
      })
    );

    expect(result.state).toBe("incomplete");
    expect(result.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "MISSING_ANCESTRY" })])
    );
  });

  it("rejects stale catalog hashes without discarding selections", () => {
    const result = calculateCharacter(catalog, character({ catalogHash: "b".repeat(64) }));

    expect(result.state).toBe("invalid");
    expect(result.featIds).toContain("feat.test.strong");
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "CATALOG_HASH_MISMATCH"
        })
      ])
    );
  });

  it("calculates weapon attack, damage, and carried bulk", () => {
    const result = calculateCharacter(catalog, character());

    expect(result.weaponAttacks["weapon.club"]).toMatchObject({
      attack: { value: 6 },
      damage: {
        dice: "1d6",
        flat: { value: 3 }
      }
    });
    expect(result.bulk.value).toBe(2);
  });

  it("is deterministic for equal catalog and decisions", () => {
    expect(calculateCharacter(catalog, character())).toEqual(
      calculateCharacter(catalog, character())
    );
  });
});
