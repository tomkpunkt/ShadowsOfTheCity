import { describe, expect, it } from "vitest";

import { calculateCharacter, emptySessionState } from "@sotc/rules-engine";
import type { CharacterDocument } from "@sotc/shared";

import { catalog } from "../catalog.js";
import { buildSheetModel } from "./model.js";
import { buildCharacterPrintModel } from "./print-model.js";

const document: CharacterDocument = {
  formatVersion: 3,
  contentSchemaVersion: 1,
  catalogHash: catalog.contentHash,
  createdWithVersion: "0.1.0",
  lastSavedWithVersion: "0.1.0",
  build: {
    name: "Nyx",
    level: 1,
    ancestryId: "ancestry.elf",
    backgroundId: "background.academic",
    classId: "class.magier",
    choices: {},
    attributeBoosts: [],
    inventoryIds: ["weapon.schwert"],
    options: {},
    biography: {
      description: "Eine Ermittlerin im Neonregen.",
      appearance: "",
      personality: "",
      motivation: "",
      relationships: "",
      organizations: "",
      contacts: "",
      goals: "",
      backgroundNotes: ""
    }
  },
  session: {
    ...emptySessionState(),
    currentHp: 4,
    temporaryHp: 2,
    itemStates: {
      "weapon.schwert": {
        quantity: 2,
        equipped: true,
        active: true,
        consumed: 0,
        location: "equipped"
      }
    }
  },
  migrations: [],
  legacyValues: {}
};

describe("character print model", () => {
  it("uses the evaluated character and includes session state", () => {
    const result = calculateCharacter(catalog, document);
    const model = buildSheetModel(catalog, document, result);
    const printable = buildCharacterPrintModel(document, result, model);

    expect(printable.coreValues).toContainEqual(
      expect.objectContaining({
        label: "Trefferpunkte",
        value: `4 / ${String(result.hitPoints.value)}`
      })
    );
    expect(printable.inventory[0]).toMatchObject({
      id: "weapon.schwert",
      quantity: 2,
      equipped: true
    });
    expect(printable.statblock).toContain("Nyx · Stufe 1");
    expect(printable.statblock).toContain("Gegenstände Schwert (2)");
  });

  it("suppresses the spell page for characters without spell data", () => {
    const mundaneDocument: CharacterDocument = {
      ...document,
      build: {
        ...document.build,
        classId: undefined,
        choices: {}
      }
    };
    const result = calculateCharacter(catalog, mundaneDocument);
    const model = buildSheetModel(catalog, mundaneDocument, result);

    expect(buildCharacterPrintModel(mundaneDocument, result, model).hasSpells).toBe(false);
  });
});
