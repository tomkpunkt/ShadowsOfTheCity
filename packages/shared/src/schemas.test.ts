import { describe, expect, it } from "vitest";

import {
  CharacterDocumentSchema,
  ChoiceSchema,
  ContentEntitySchema,
  EffectSchema,
  EntityIdSchema,
  PredicateSchema
} from "./schemas.js";

describe("EntityIdSchema", () => {
  it("accepts stable lowercase IDs", () => {
    expect(EntityIdSchema.parse("feat.athletic-fighting-style")).toBe(
      "feat.athletic-fighting-style"
    );
  });

  it("rejects display names and uppercase IDs", () => {
    expect(EntityIdSchema.safeParse("Feat.Zähigkeit").success).toBe(false);
  });
});

describe("PredicateSchema", () => {
  it("accepts nested declarative prerequisites", () => {
    const result = PredicateSchema.safeParse({
      all: [
        { characterLevel: { gte: 4 } },
        {
          any: [
            { hasFeat: { id: "feat.athletic-fighting-style" } },
            { attribute: { id: "strength", gte: 16 } }
          ]
        }
      ]
    });

    expect(result.success).toBe(true);
  });

  it("rejects unknown operators", () => {
    expect(PredicateSchema.safeParse({ maybe: [] }).success).toBe(false);
  });

  it("supports upper bounds and character-state predicates", () => {
    expect(
      PredicateSchema.safeParse({
        all: [
          { characterLevel: { gte: 2, lte: 8 } },
          { heritage: { id: "heritage.test" } },
          { equippedItem: { id: "weapon.test" } },
          { previousChoice: { choiceId: "choice.test", optionId: "feat.test" } },
          { characterOption: { key: "option.stance", value: "defensive" } }
        ]
      }).success
    ).toBe(true);
    expect(PredicateSchema.safeParse({ characterLevel: {} }).success).toBe(false);
  });
});

describe("EffectSchema", () => {
  it("supports every canonical effect family", () => {
    const effects = [
      {
        kind: "value",
        target: "armor-class",
        operation: "add",
        value: 1,
        bonusType: "status"
      },
      {
        kind: "derived",
        target: "class-dc",
        from: "attribute-score",
        fromSelector: "intelligence",
        multiplier: 1,
        offset: 10
      },
      {
        kind: "proficiency-rule",
        proficiencyId: "skill.athletics",
        operation: "increase",
        steps: 1
      },
      { kind: "grant", grantType: "feat", id: "feat.test", quantity: 1 },
      {
        kind: "resource-rule",
        resourceId: "resource.focus",
        operation: "set",
        value: 1,
        capacity: 3,
        refresh: "day"
      },
      { kind: "movement", movementType: "climb", operation: "set", value: 15 },
      {
        kind: "action",
        actionId: "action.test",
        actionType: "activity",
        actions: 2,
        parameters: {}
      },
      {
        kind: "attack-rule",
        selector: "weapon.test",
        attackModifier: 1,
        damageDice: "2d6"
      },
      {
        kind: "spellcasting-rule",
        tradition: "arcane",
        operation: "known-spells",
        spellIds: ["spell.test"],
        value: 1
      }
    ];

    expect(effects.every((effect) => EffectSchema.safeParse(effect).success)).toBe(true);
  });

  it("requires a decision ID for unresolved text rules", () => {
    expect(
      EffectSchema.safeParse({
        kind: "text",
        text: "Die Kernwirkung ist noch nicht festgelegt.",
        machineReadable: false,
        classification: "requires-rules-decision"
      }).success
    ).toBe(false);
  });
});

describe("CharacterDocumentSchema", () => {
  const character = {
    formatVersion: 2,
    contentSchemaVersion: 1,
    catalogHash: "a".repeat(64),
    createdWithVersion: "0.1.0",
    lastSavedWithVersion: "0.1.0",
    name: "Ada",
    level: 1,
    choices: {},
    attributeBoosts: [],
    inventoryIds: ["weapon.test"],
    equippedItemIds: ["weapon.test"],
    options: {},
    migrations: [],
    legacyValues: {}
  };

  it("validates the canonical versioned character format", () => {
    expect(CharacterDocumentSchema.safeParse(character).success).toBe(true);
  });

  it("rejects equipped items outside the inventory and unknown fields", () => {
    expect(
      CharacterDocumentSchema.safeParse({
        ...character,
        equippedItemIds: ["weapon.other"]
      }).success
    ).toBe(false);
    expect(CharacterDocumentSchema.safeParse({ ...character, hiddenRule: true }).success).toBe(
      false
    );
  });
});

describe("ChoiceSchema", () => {
  it("rejects contradictory selection bounds", () => {
    const result = ChoiceSchema.safeParse({
      id: "choice.test",
      level: 1,
      kind: "skill",
      min: 2,
      max: 1
    });

    expect(result.success).toBe(false);
  });
});

describe("ContentEntitySchema", () => {
  it("validates a complete skill entity", () => {
    const result = ContentEntitySchema.safeParse({
      schemaVersion: 1,
      id: "skill.athletics",
      type: "skill",
      name: "Athletik",
      source: "source.core",
      status: "canonical",
      description: "Klettern, Springen und Schwimmen.",
      attribute: "strength"
    });

    expect(result.success).toBe(true);
  });

  it("rejects unknown entity types", () => {
    const result = ContentEntitySchema.safeParse({
      schemaVersion: 1,
      id: "mystery.unknown",
      type: "mystery",
      name: "Unbekannt",
      source: "source.core",
      status: "draft",
      description: ""
    });

    expect(result.success).toBe(false);
  });

  it("validates the closed multidimensional item taxonomy", () => {
    const result = ContentEntitySchema.safeParse({
      schemaVersion: 1,
      id: "equipment.test-scanner",
      type: "equipment",
      name: "Testscanner",
      source: "source.core",
      status: "canonical",
      summary: "Der Testscanner erfasst technische Signale in seiner unmittelbaren Umgebung.",
      rulesText:
        "Der Scanner zeigt vorhandene technische Signale an, verändert aber keine Spielwerte.",
      description: "Ein technisches Prüfgerät.",
      editorialStatus: "reviewed",
      category: "electronics",
      subcategory: "sensor",
      technologyLevel: "high-tech",
      availability: "restricted",
      origins: ["corporate", "governmental"],
      level: 1,
      priceGp: 100,
      bulk: 1,
      hands: 1,
      categoryId: "trait.item.equipment.technology",
      effects: []
    });

    expect(result.success).toBe(true);
  });

  it("rejects open-ended item classification values", () => {
    const result = ContentEntitySchema.safeParse({
      schemaVersion: 1,
      id: "equipment.special",
      type: "equipment",
      name: "Spezialgerät",
      source: "source.core",
      status: "draft",
      summary: "Ein nicht klassifizierter Testgegenstand für die Schemaabsicherung.",
      rulesText: "Dieser Testeintrag besitzt absichtlich eine ungültige Sammelkategorie.",
      description: "Test",
      category: "special",
      subcategory: "special",
      technologyLevel: "future",
      availability: "rare",
      origins: ["unknown"],
      level: 0,
      priceGp: 0,
      bulk: 0,
      hands: 0,
      categoryId: "trait.test",
      effects: []
    });

    expect(result.success).toBe(false);
  });
});
