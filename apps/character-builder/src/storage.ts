import type { Catalog } from "@sotc/shared";
import { z } from "zod";

import type { AttributeId, CharacterState } from "@sotc/rules-engine";

const storageKey = "shadows-of-the-city.characters.v1";

const CharacterStateSchema = z
  .object({
    formatVersion: z.literal(1),
    catalogHash: z.string().min(1),
    name: z.string(),
    level: z.number().int().min(1).max(20),
    ancestryId: z.string().optional(),
    heritageId: z.string().optional(),
    backgroundId: z.string().optional(),
    classId: z.string().optional(),
    choices: z.record(z.string(), z.array(z.string())),
    attributeBoosts: z.array(
      z.enum(["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"])
    ),
    inventoryIds: z.array(z.string()),
    notes: z.string().optional(),
    migrations: z
      .array(
        z
          .object({
            fromCatalogHash: z.string(),
            toCatalogHash: z.string(),
            migratedAt: z.string(),
            conflicts: z.array(z.string())
          })
          .strict()
      )
      .optional()
  })
  .strict();

interface StoredCollection {
  formatVersion: 1;
  active: CharacterState;
  savedAt: string;
}

export interface ImportResult {
  character: CharacterState;
  conflicts: string[];
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const emptyCharacter = (catalogHash: string): CharacterState => ({
  formatVersion: 1,
  catalogHash,
  name: "Neuer Charakter",
  level: 1,
  choices: {},
  attributeBoosts: [],
  inventoryIds: []
});

export const saveCharacter = (
  character: CharacterState,
  storage: StorageLike = window.localStorage
): void => {
  const collection: StoredCollection = {
    formatVersion: 1,
    active: character,
    savedAt: new Date().toISOString()
  };
  storage.setItem(storageKey, JSON.stringify(collection));
};

export const loadCharacter = (
  catalogHash: string,
  storage: StorageLike = window.localStorage
): CharacterState => {
  const stored = storage.getItem(storageKey);
  if (stored === null) {
    return emptyCharacter(catalogHash);
  }
  try {
    const input = JSON.parse(stored) as unknown;
    if (
      input === null ||
      typeof input !== "object" ||
      !("formatVersion" in input) ||
      input.formatVersion !== 1 ||
      !("active" in input)
    ) {
      return emptyCharacter(catalogHash);
    }
    return CharacterStateSchema.parse(input.active);
  } catch {
    return emptyCharacter(catalogHash);
  }
};

export const serializeCharacter = (character: CharacterState): string =>
  `${JSON.stringify(character, null, 2)}\n`;

export const importCharacter = (source: string, catalog: Catalog): ImportResult => {
  const input = CharacterStateSchema.parse(JSON.parse(source));
  const knownIds = new Set(catalog.entities.map((entity) => entity.id));
  const referencedIds = new Set([
    ...(input.ancestryId === undefined ? [] : [input.ancestryId]),
    ...(input.heritageId === undefined ? [] : [input.heritageId]),
    ...(input.backgroundId === undefined ? [] : [input.backgroundId]),
    ...(input.classId === undefined ? [] : [input.classId]),
    ...Object.keys(input.choices),
    ...Object.values(input.choices).flat(),
    ...input.inventoryIds
  ]);
  const conflicts = [...referencedIds]
    .filter((id) => !knownIds.has(id))
    .map(
      (_, index) =>
        `Gespeicherte Auswahl ${String(index + 1)} konnte im aktuellen Katalog nicht zugeordnet werden.`
    );
  if (input.catalogHash !== catalog.contentHash) {
    const migrationMessage =
      conflicts.length === 0
        ? "Der Charakter wurde auf den aktuellen Katalogstand migriert."
        : "Der importierte Charakter verwendet einen abweichenden Katalogstand.";
    conflicts.unshift(migrationMessage);
    return {
      character: {
        ...input,
        ...(conflicts.length === 1 ? { catalogHash: catalog.contentHash } : {}),
        migrations: [
          ...(input.migrations ?? []),
          {
            fromCatalogHash: input.catalogHash,
            toCatalogHash: catalog.contentHash,
            migratedAt: new Date().toISOString(),
            conflicts
          }
        ]
      },
      conflicts
    };
  }
  return { character: input, conflicts };
};

export const downloadCharacter = (character: CharacterState): void => {
  const blob = new Blob([serializeCharacter(character)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${
    character.name
      .trim()
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase() || "character"
  }.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const toggleAttributeBoost = (
  boosts: AttributeId[],
  attribute: AttributeId,
  maximum: number
): AttributeId[] => {
  const index = boosts.indexOf(attribute);
  if (index >= 0) {
    return boosts.filter((_, candidateIndex) => candidateIndex !== index);
  }
  return boosts.length >= maximum ? boosts : [...boosts, attribute];
};
