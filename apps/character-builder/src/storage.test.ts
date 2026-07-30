import { describe, expect, it } from "vitest";

import type { Catalog } from "@sotc/shared";

import {
  emptyCharacter,
  importCharacter,
  loadCharacter,
  saveCharacter,
  serializeCharacter,
  type StorageLike
} from "./storage.js";

const hash = "a".repeat(64);

const memoryStorage = (): StorageLike => {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
};

const catalog: Catalog = {
  schemaVersion: 1,
  contentHash: hash,
  entities: []
};

describe("character storage", () => {
  it("round-trips a versioned character", () => {
    const storage = memoryStorage();
    const character = {
      ...emptyCharacter(hash),
      name: "Nyx",
      attributeBoosts: ["dexterity" as const]
    };

    saveCharacter(character, storage);

    expect(loadCharacter(hash, storage)).toEqual(character);
  });

  it("falls back safely when local data is malformed", () => {
    const storage: StorageLike = {
      getItem: () => "{broken",
      setItem: () => undefined
    };

    expect(loadCharacter(hash, storage)).toEqual(emptyCharacter(hash));
  });

  it("preserves unknown IDs during import and reports every conflict", () => {
    const character = {
      ...emptyCharacter("b".repeat(64)),
      ancestryId: "ancestry.unknown",
      choices: {
        "choice.unknown": ["feat.unknown"]
      }
    };

    const imported = importCharacter(serializeCharacter(character), catalog);

    expect(imported.character).toMatchObject(character);
    expect(imported.character.migrations).toEqual([
      expect.objectContaining({
        fromCatalogHash: "b".repeat(64),
        toCatalogHash: hash,
        conflicts: expect.arrayContaining([
          "Gespeicherte Auswahl 1 konnte im aktuellen Katalog nicht zugeordnet werden."
        ])
      })
    ]);
    expect(imported.conflicts).toEqual(
      expect.arrayContaining([
        "Der importierte Charakter verwendet einen abweichenden Katalogstand.",
        "Gespeicherte Auswahl 1 konnte im aktuellen Katalog nicht zugeordnet werden.",
        "Gespeicherte Auswahl 2 konnte im aktuellen Katalog nicht zugeordnet werden.",
        "Gespeicherte Auswahl 3 konnte im aktuellen Katalog nicht zugeordnet werden."
      ])
    );
  });

  it("migrates the catalog hash when every referenced ID remains valid", () => {
    const character = {
      ...emptyCharacter("b".repeat(64)),
      name: "Mira"
    };

    const imported = importCharacter(serializeCharacter(character), catalog);

    expect(imported.character.catalogHash).toBe(hash);
    expect(imported.conflicts).toEqual([
      "Der Charakter wurde auf den aktuellen Katalogstand migriert."
    ]);
    expect(imported.character.migrations).toHaveLength(1);
  });
});
