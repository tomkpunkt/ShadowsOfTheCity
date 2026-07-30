import type { ContentEntity } from "@sotc/shared";

import { formatEntityReference, formatEntityType, formatTradition } from "./i18n/de.js";

export const entityLevel = (entity: ContentEntity): number | undefined =>
  "level" in entity && typeof entity.level === "number"
    ? entity.level
    : entity.type === "spell"
      ? entity.rank
      : undefined;

export const entityMeta = (entity: ContentEntity): string[] => {
  const meta = [formatEntityType(entity.type)];
  const level = entityLevel(entity);
  if (level !== undefined) {
    meta.push(entity.type === "spell" ? `Rang ${String(level)}` : `Stufe ${String(level)}`);
  }
  if ("traditions" in entity) {
    meta.push(...entity.traditions.map(formatTradition));
  }
  return meta;
};

export const searchableEntityText = (
  entity: ContentEntity,
  resolveName: (id: string) => string | undefined
): string =>
  [
    entity.name,
    entity.summary,
    entity.description,
    formatEntityType(entity.type),
    entity.source,
    ...entity.traits.map((id) => formatEntityReference(id, resolveName))
  ]
    .join(" ")
    .toLocaleLowerCase("de");

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

export const entityMatchesChoice = (
  entity: ContentEntity,
  choiceEntity: Extract<ContentEntity, { type: "choice" }>
): boolean => {
  const { filter, excludes } = choiceEntity.choice;
  const level = entityLevel(entity);
  return (
    entity.id !== choiceEntity.id &&
    !excludes.includes(entity.id) &&
    (filter.entityTypes === undefined || filter.entityTypes.includes(entity.type)) &&
    (filter.traitsAll === undefined ||
      filter.traitsAll.every((trait) => entity.traits.includes(trait))) &&
    (filter.traitsAny === undefined ||
      filter.traitsAny.some((trait) => entity.traits.includes(trait))) &&
    (filter.minLevel === undefined || (level !== undefined && level >= filter.minLevel)) &&
    (filter.maxLevel === undefined || (level !== undefined && level <= filter.maxLevel)) &&
    (filter.classId === undefined || ("classId" in entity && entity.classId === filter.classId)) &&
    (filter.ancestryId === undefined ||
      ("ancestryId" in entity && entity.ancestryId === filter.ancestryId)) &&
    (filter.category === undefined ||
      ("category" in entity && entity.category === filter.category)) &&
    (filter.traditions === undefined ||
      ("traditions" in entity &&
        filter.traditions.some((tradition) => entity.traditions.includes(tradition))))
  );
};
