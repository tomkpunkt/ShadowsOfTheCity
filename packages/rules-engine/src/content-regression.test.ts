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

describe("v0.1.2 equipment catalog", () => {
  it("contains the complete reviewed content expansion", () => {
    const additions = catalog.entities.filter((entity) => entity.id.includes(".v012-"));

    expect(additions).toHaveLength(174);
    expect(additions.every((entity) => entity.status === "canonical")).toBe(true);
    expect(additions.every((entity) => entity.editorialStatus === "reviewed")).toBe(true);
    expect(additions.every((entity) => "technologyLevel" in entity)).toBe(true);
    expect(entities.get("weapon.v012-gassenklinge")?.type).toBe("weapon");
    expect(entities.get("armor.v012-kuriermantel-mit-faserlage")?.type).toBe("armor");
    expect(entities.get("equipment.v012-stadtwaffenlizenz")?.type).toBe("equipment");
  });

  it("maps every weapon and armor category to an existing proficiency", () => {
    const missing = catalog.entities
      .filter((entity) => entity.type === "weapon" || entity.type === "armor")
      .map((entity) => ({
        id: entity.id,
        proficiencyId: entity.categoryId.replace("trait.item.", "proficiency.")
      }))
      .filter(({ proficiencyId }) => entities.get(proficiencyId)?.type !== "proficiency");

    expect(missing).toEqual([]);
  });

  it("differentiates starting proficiencies per class", () => {
    const start = (classId: string) => {
      const entity = entities.get(classId);
      if (entity?.type !== "class") throw new Error(`Missing class ${classId}`);
      return entity.initialProficiencies;
    };

    const soldner = start("class.soldner");
    expect(soldner.saves).toEqual({ fortitude: "expert", reflex: "trained", will: "trained" });
    expect(soldner.armor["proficiency.armor.heavy"]).toBe("trained");
    expect(soldner.weapons["proficiency.weapon.martial"]).toBe("trained");

    const waechter = start("class.wachter");
    expect(waechter.saves).toEqual({ fortitude: "expert", reflex: "trained", will: "expert" });
    expect(waechter.armor["proficiency.armor.medium"]).toBe("trained");

    expect(start("class.agent").perception).toBe("expert");
    expect(start("class.agent").saves.reflex).toBe("expert");
    expect(start("class.ingenieur").saves.reflex).toBe("expert");

    for (const classId of ["class.magier", "class.okkultist"]) {
      expect(start(classId).armor).toEqual({ "proficiency.armor.unarmored": "trained" });
      expect(start(classId).saves.will).toBe("expert");
    }
    for (const classId of ["class.mediziner", "class.schamane"]) {
      expect(start(classId).saves.will).toBe("expert");
    }
    expect(start("class.raufbold").saves.fortitude).toBe("expert");

    const classes = catalog.entities.filter((entity) => entity.type === "class");
    const distinct = new Set(classes.map((entity) => JSON.stringify(entity.initialProficiencies)));
    expect(distinct.size).toBeGreaterThan(4);
  });

  it("lets a starting Söldner attack trained with a firearm", () => {
    const { character } = completeLevelOneCharacter(
      "ancestry.mensch",
      "background.worker",
      "class.soldner"
    );
    const result = calculateCharacter(catalog, {
      formatVersion: 3,
      contentSchemaVersion: 1,
      catalogHash: catalog.contentHash,
      createdWithVersion: "0.1.2",
      lastSavedWithVersion: "0.1.2",
      build: { ...character, inventoryIds: ["weapon.pistole"] },
      session: {
        ...emptySessionState(),
        itemStates: {
          "weapon.pistole": {
            quantity: 1,
            equipped: true,
            active: false,
            consumed: 0,
            location: "equipped"
          }
        }
      },
      migrations: [],
      legacyValues: {}
    });

    expect(result.proficiencies["proficiency.weapon.ranged"]).toBe("trained");
    expect(result.weaponAttacks["weapon.pistole"]?.attack.breakdown[1]?.value).toBe(3);
  });

  it("raises proficiencies with level from the class progression", () => {
    const rankOf = (classId: string, level: number, proficiencyId: string) => {
      const { character } = completeLevelOneCharacter(
        "ancestry.mensch",
        "background.worker",
        classId
      );
      const result = calculateCharacter(catalog, {
        formatVersion: 3,
        contentSchemaVersion: 1,
        catalogHash: catalog.contentHash,
        createdWithVersion: "0.1.2",
        lastSavedWithVersion: "0.1.2",
        build: { ...character, level },
        session: emptySessionState(),
        migrations: [],
        legacyValues: {}
      });
      return result.proficiencies[proficiencyId];
    };

    expect(rankOf("class.soldner", 1, "proficiency.weapon.simple")).toBe("trained");
    expect(rankOf("class.soldner", 5, "proficiency.weapon.simple")).toBe("expert");
    expect(rankOf("class.soldner", 13, "proficiency.weapon.simple")).toBe("master");
    expect(rankOf("class.soldner", 8, "proficiency.save.fortitude")).toBe("expert");
    expect(rankOf("class.soldner", 9, "proficiency.save.fortitude")).toBe("master");
    expect(rankOf("class.soldner", 4, "proficiency.save.reflex")).toBe("trained");
    expect(rankOf("class.soldner", 5, "proficiency.save.reflex")).toBe("expert");
    expect(rankOf("class.magier", 10, "proficiency.weapon.simple")).toBe("trained");
    expect(rankOf("class.magier", 11, "proficiency.weapon.simple")).toBe("expert");
    expect(rankOf("class.magier", 17, "proficiency.class-dc")).toBe("master");
  });

  it("applies and validates attribute boosts at levels 5, 10, 15 and 20", () => {
    const { character } = completeLevelOneCharacter(
      "ancestry.mensch",
      "background.worker",
      "class.soldner"
    );
    const evaluate = (level: number, levelBoosts?: Record<string, AttributeId[]>) =>
      calculateCharacter(catalog, {
        formatVersion: 3,
        contentSchemaVersion: 1,
        catalogHash: catalog.contentHash,
        createdWithVersion: "0.1.2",
        lastSavedWithVersion: "0.1.2",
        build: { ...character, level, ...(levelBoosts === undefined ? {} : { levelBoosts }) },
        session: emptySessionState(),
        migrations: [],
        legacyValues: {}
      });

    const base = evaluate(4);
    expect(base.issues.some((issue) => issue.code.includes("LEVEL_ATTRIBUTE"))).toBe(false);

    const missing = evaluate(5);
    expect(missing.issues.map((issue) => issue.code)).toContain("MISSING_LEVEL_ATTRIBUTE_BOOSTS");
    expect(missing.attributes.strength.value).toBe(base.attributes.strength.value);

    const chosen: AttributeId[] = ["strength", "dexterity", "constitution", "wisdom"];
    const boosted = evaluate(5, { "5": chosen });
    expect(boosted.issues.map((issue) => issue.code)).not.toContain(
      "MISSING_LEVEL_ATTRIBUTE_BOOSTS"
    );
    for (const attribute of chosen) {
      const gain = base.attributes[attribute].value >= 18 ? 1 : 2;
      expect(boosted.attributes[attribute].value).toBe(base.attributes[attribute].value + gain);
    }
    expect(boosted.attributes.charisma.value).toBe(base.attributes.charisma.value);

    const duplicate = evaluate(5, { "5": ["strength", "strength", "wisdom", "charisma"] });
    expect(duplicate.issues.map((issue) => issue.code)).toContain(
      "DUPLICATE_LEVEL_ATTRIBUTE_BOOSTS"
    );

    const stale = evaluate(4, { "5": chosen });
    expect(stale.attributes.strength.value).toBe(base.attributes.strength.value);
  });
});
