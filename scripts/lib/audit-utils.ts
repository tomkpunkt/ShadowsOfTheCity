import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CatalogSchema, type Catalog, type ContentEntity } from "@sotc/shared";

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const generatedDirectory = path.join(repositoryRoot, "generated");
export const reviewDirectory = path.join(repositoryRoot, "docs", "review");

export interface AuditAllowlistEntry {
  id: string;
  reason: string;
}

export interface AuditAllowlist {
  version: number;
  entries: AuditAllowlistEntry[];
}

export const loadCatalog = async (): Promise<Catalog> =>
  CatalogSchema.parse(
    JSON.parse(await readFile(path.join(generatedDirectory, "catalog.json"), "utf8")) as unknown
  );

export const loadAllowlist = async (): Promise<AuditAllowlist> =>
  JSON.parse(
    await readFile(path.join(repositoryRoot, "scripts", "audit-allowlist.json"), "utf8")
  ) as AuditAllowlist;

export const writeJson = async (target: string, value: unknown): Promise<void> => {
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

export const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, " ").trim();

export const markdownToText = (value: string): string =>
  normalizeWhitespace(
    value
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, "$2 $1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      .replace(/[`*_>#|~-]/g, " ")
  );

export const entityLevel = (entity: ContentEntity): number | undefined =>
  "level" in entity && typeof entity.level === "number"
    ? entity.level
    : entity.type === "spell"
      ? entity.rank
      : undefined;

export const entityMatchesChoice = (
  entity: ContentEntity,
  choiceEntity: Extract<ContentEntity, { type: "choice" }>
): boolean => {
  const { filter, excludes } = choiceEntity.choice;
  if (entity.id === choiceEntity.id || excludes.includes(entity.id)) {
    return false;
  }
  if (filter.entityTypes !== undefined && !filter.entityTypes.includes(entity.type)) {
    return false;
  }
  if (
    filter.traitsAll !== undefined &&
    !filter.traitsAll.every((trait) => entity.traits.includes(trait))
  ) {
    return false;
  }
  if (
    filter.traitsAny !== undefined &&
    !filter.traitsAny.some((trait) => entity.traits.includes(trait))
  ) {
    return false;
  }
  const level = entityLevel(entity);
  if (
    (filter.minLevel !== undefined && (level === undefined || level < filter.minLevel)) ||
    (filter.maxLevel !== undefined && (level === undefined || level > filter.maxLevel))
  ) {
    return false;
  }
  if (
    filter.classId !== undefined &&
    (!("classId" in entity) || entity.classId !== filter.classId)
  ) {
    return false;
  }
  if (
    filter.ancestryId !== undefined &&
    (!("ancestryId" in entity) || entity.ancestryId !== filter.ancestryId)
  ) {
    return false;
  }
  if (
    filter.category !== undefined &&
    (!("category" in entity) || entity.category !== filter.category)
  ) {
    return false;
  }
  if (
    filter.traditions !== undefined &&
    (!("traditions" in entity) ||
      !filter.traditions.some((tradition) => entity.traditions.includes(tradition)))
  ) {
    return false;
  }
  return true;
};

const referenceKey = /(?:^|_)(?:id|ids|references)$/i;

const collectReferenceValues = (
  value: unknown,
  knownIds: Set<string>,
  references: Set<string>,
  key = ""
): void => {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectReferenceValues(item, knownIds, references, key);
    }
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const [nestedKey, nestedValue] of Object.entries(value)) {
      collectReferenceValues(nestedValue, knownIds, references, nestedKey);
    }
    return;
  }
  if (typeof value === "string" && (referenceKey.test(key) || knownIds.has(value))) {
    if (knownIds.has(value)) {
      references.add(value);
    }
  }
};

export const collectEntityReferences = (entity: ContentEntity, knownIds: Set<string>): string[] => {
  const references = new Set<string>();
  collectReferenceValues(entity, knownIds, references);
  for (const match of entity.description.matchAll(/\[\[([a-z][a-z0-9.-]+)(?:\|[^\]]+)?\]\]/g)) {
    const id = match[1];
    if (id !== undefined) {
      references.add(id);
    }
  }
  references.delete(entity.id);
  return [...references].sort();
};

export const hasMachineRule = (entity: ContentEntity): boolean => {
  const effects =
    "effects" in entity && Array.isArray(entity.effects)
      ? entity.effects
      : entity.type === "effect"
        ? [entity.effect]
        : [];
  return effects.some(
    (effect) =>
      effect !== null && typeof effect === "object" && "kind" in effect && effect.kind !== "text"
  );
};

export const hasTextRule = (entity: ContentEntity): boolean => {
  const effects =
    "effects" in entity && Array.isArray(entity.effects)
      ? entity.effects
      : entity.type === "effect"
        ? [entity.effect]
        : [];
  return effects.some(
    (effect) =>
      effect !== null && typeof effect === "object" && "kind" in effect && effect.kind === "text"
  );
};

export const contentPath = (entity: ContentEntity): string =>
  `content/${entity.type}/${entity.id}.md`;

export const countBy = <T>(values: T[], key: (value: T) => string): Record<string, number> =>
  Object.fromEntries(
    [...new Set(values.map(key))]
      .sort()
      .map((candidate) => [candidate, values.filter((value) => key(value) === candidate).length])
  );

export const markdownTable = (headers: string[], rows: string[][]): string =>
  [
    `| ${headers.join(" | ")} |`,
    `|${headers.map(() => ":--").join("|")}|`,
    ...rows.map((row) => `| ${row.map((cell) => cell.replaceAll("|", "\\|")).join(" | ")} |`)
  ].join("\n");
