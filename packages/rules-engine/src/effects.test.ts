import { describe, expect, it } from "vitest";

import { applyEffect, createAccumulator, stackedModifierBreakdown } from "./effects.js";
import type { CharacterState, EngineContext } from "./types.js";

const hash = "a".repeat(64);

const character: CharacterState = {
  formatVersion: 2,
  contentSchemaVersion: 1,
  catalogHash: hash,
  createdWithVersion: "0.1.0",
  lastSavedWithVersion: "0.1.0",
  name: "Effekttest",
  level: 3,
  choices: {},
  attributeBoosts: [],
  inventoryIds: [],
  equippedItemIds: [],
  options: {},
  migrations: [],
  legacyValues: {}
};

const context = (): EngineContext => ({
  catalog: {
    schemaVersion: 1,
    contentHash: hash,
    aliases: {},
    entities: []
  },
  entities: new Map(),
  character,
  attributes: {
    strength: 12,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  },
  proficiencyRanks: new Map(),
  featIds: new Set(),
  featureIds: new Set(),
  traitIds: new Set(),
  spellIds: new Set(),
  traditions: new Set(),
  inventoryIds: new Set(),
  equippedItemIds: new Set(),
  selectedOptionIds: new Set(),
  characterOptions: new Map(),
  resources: new Map()
});

describe("canonical effects", () => {
  it("applies set, add, minimum, maximum and replace deterministically", () => {
    const engine = context();
    const accumulator = createAccumulator();
    for (const [operation, value] of [
      ["set", 14],
      ["add", 2],
      ["minimum", 18],
      ["maximum", 17],
      ["replace", 16]
    ] as const) {
      applyEffect(
        {
          kind: "value",
          target: "attribute-score",
          selector: "strength",
          operation,
          value
        },
        `rule.${operation}`,
        engine,
        accumulator
      );
    }

    expect(engine.attributes.strength).toBe(16);
    expect(accumulator.attributeChanges.map((entry) => entry.value)).toEqual([2, 2, 2, -1, -1]);
  });

  it("stacks typed and untyped value modifiers through the common pipeline", () => {
    const engine = context();
    const accumulator = createAccumulator();
    for (const [sourceId, bonusType, value] of [
      ["rule.status.one", "status", 1],
      ["rule.status.two", "status", 2],
      ["rule.untyped", "untyped", 1]
    ] as const) {
      applyEffect(
        {
          kind: "value",
          target: "armor-class",
          operation: "add",
          bonusType,
          value
        },
        sourceId,
        engine,
        accumulator
      );
    }

    expect(
      stackedModifierBreakdown(accumulator.modifiers, "armor-class").map((entry) => entry.value)
    ).toEqual([1, 2]);
  });

  it("applies proficiency set, minimum and increase operations", () => {
    const engine = context();
    const accumulator = createAccumulator();
    applyEffect(
      {
        kind: "proficiency-rule",
        proficiencyId: "skill.athletics",
        operation: "set",
        rank: "trained"
      },
      "rule.set",
      engine,
      accumulator
    );
    applyEffect(
      {
        kind: "proficiency-rule",
        proficiencyId: "skill.athletics",
        operation: "increase",
        steps: 2
      },
      "rule.increase",
      engine,
      accumulator
    );
    applyEffect(
      {
        kind: "proficiency-rule",
        proficiencyId: "skill.athletics",
        operation: "at-least",
        rank: "expert"
      },
      "rule.minimum",
      engine,
      accumulator
    );

    expect(engine.proficiencyRanks.get("skill.athletics")).toBe("master");
  });

  it("records grants, resources, movement, actions, attacks and spellcasting", () => {
    const engine = context();
    const accumulator = createAccumulator();
    for (const [grantType, id] of [
      ["feat", "feat.test"],
      ["feature", "feature.test"],
      ["spell", "spell.test"],
      ["item", "equipment.test"],
      ["language", "language.test"],
      ["choice", "choice.test"],
      ["action", "action.test"]
    ] as const) {
      applyEffect(
        { kind: "grant", grantType, id, quantity: 1 },
        `rule.grant.${grantType}`,
        engine,
        accumulator
      );
    }
    applyEffect(
      {
        kind: "resource-rule",
        resourceId: "resource.focus",
        operation: "set",
        value: 2,
        capacity: 3,
        refresh: "day"
      },
      "rule.resource",
      engine,
      accumulator
    );
    applyEffect(
      { kind: "movement", movementType: "climb", operation: "set", value: 15 },
      "rule.movement",
      engine,
      accumulator
    );
    applyEffect(
      {
        kind: "action",
        actionId: "action.charge",
        actionType: "activity",
        actions: 2,
        parameters: {}
      },
      "rule.action",
      engine,
      accumulator
    );
    applyEffect(
      { kind: "attack-rule", selector: "weapon.test", attackModifier: 1, damageDice: "2d6" },
      "rule.attack",
      engine,
      accumulator
    );
    applyEffect(
      {
        kind: "spellcasting-rule",
        tradition: "arcane",
        operation: "known-spells",
        spellIds: ["spell.extra"],
        value: 1
      },
      "rule.spellcasting",
      engine,
      accumulator
    );
    applyEffect(
      {
        kind: "derived",
        target: "class-dc",
        from: "attribute-score",
        fromSelector: "intelligence",
        multiplier: 1,
        offset: 10
      },
      "rule.derived",
      engine,
      accumulator
    );

    expect(engine.featIds).toContain("feat.test");
    expect(engine.inventoryIds).toContain("equipment.test");
    expect(engine.resources.get("resource.focus")).toBe(2);
    expect(engine.traditions).toContain("arcane");
    expect(engine.spellIds).toContain("spell.extra");
    expect(accumulator.movementRules).toHaveLength(1);
    expect(accumulator.actionGrants).toHaveLength(1);
    expect(accumulator.attackRules).toHaveLength(1);
    expect(accumulator.spellcastingRules).toHaveLength(1);
    expect(accumulator.derivedRules).toHaveLength(1);
  });

  it("evaluates conditional effects through the shared predicate language", () => {
    const engine = context();
    const accumulator = createAccumulator();
    applyEffect(
      {
        kind: "conditional",
        when: { characterLevel: { gte: 3, lte: 5 } },
        effects: [
          {
            kind: "value",
            target: "attribute-score",
            selector: "wisdom",
            operation: "add",
            value: 2
          }
        ]
      },
      "rule.conditional",
      engine,
      accumulator
    );

    expect(engine.attributes.wisdom).toBe(12);
  });
});
