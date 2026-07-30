import { PredicateSchema } from "@sotc/shared";

import type {
  EngineContext,
  PredicateNode,
  PredicateResult,
  ProficiencyRank,
  RequirementFailure
} from "./types.js";

const rankValue: Record<ProficiencyRank, number> = {
  untrained: 0,
  trained: 1,
  expert: 2,
  master: 3,
  legendary: 4
};

const failure = (
  predicate: PredicateNode,
  code: string,
  message: string,
  expected?: string | number,
  actual?: string | number
): PredicateResult => ({
  met: false,
  failures: [{ predicate, code, message, expected, actual }]
});

const success = (): PredicateResult => ({ met: true, failures: [] });

const idName = (context: EngineContext, id: string): string => context.entities.get(id)?.name ?? id;

const boundedResult = (
  predicate: PredicateNode,
  actual: number,
  bounds: { gte?: number; lte?: number },
  lowerCode: string,
  upperCode: string,
  label: string
): PredicateResult => {
  if (bounds.gte !== undefined && actual < bounds.gte) {
    return failure(
      predicate,
      lowerCode,
      `Benötigt ${label} mindestens ${String(bounds.gte)}; aktuell: ${String(actual)}.`,
      bounds.gte,
      actual
    );
  }
  if (bounds.lte !== undefined && actual > bounds.lte) {
    return failure(
      predicate,
      upperCode,
      `Benötigt ${label} höchstens ${String(bounds.lte)}; aktuell: ${String(actual)}.`,
      bounds.lte,
      actual
    );
  }
  return success();
};

export const evaluatePredicate = (input: unknown, context: EngineContext): PredicateResult => {
  const predicate = PredicateSchema.parse(input) as PredicateNode;
  if ("all" in predicate) {
    const results = predicate.all.map((nested) => evaluatePredicate(nested, context));
    return {
      met: results.every((result) => result.met),
      failures: results.flatMap((result) => result.failures)
    };
  }
  if ("any" in predicate) {
    const results = predicate.any.map((nested) => evaluatePredicate(nested, context));
    if (results.some((result) => result.met)) {
      return success();
    }
    return {
      met: false,
      failures: [
        {
          predicate,
          code: "ANY_UNMET",
          message: "Keine der alternativen Voraussetzungen ist erfüllt."
        },
        ...results.flatMap((result) => result.failures)
      ]
    };
  }
  if ("not" in predicate) {
    const result = evaluatePredicate(predicate.not, context);
    return result.met
      ? failure(predicate, "NOT_UNMET", "Die ausgeschlossene Voraussetzung ist erfüllt.")
      : success();
  }
  if ("characterLevel" in predicate) {
    return boundedResult(
      predicate,
      context.character.level,
      predicate.characterLevel,
      "LEVEL_TOO_LOW",
      "LEVEL_TOO_HIGH",
      "Stufe"
    );
  }
  if ("attribute" in predicate) {
    const actual = context.attributes[predicate.attribute.id];
    return boundedResult(
      predicate,
      actual,
      predicate.attribute,
      "ATTRIBUTE_TOO_LOW",
      "ATTRIBUTE_TOO_HIGH",
      predicate.attribute.id
    );
  }
  if ("proficiency" in predicate) {
    const actual = context.proficiencyRanks.get(predicate.proficiency.id) ?? "untrained";
    return rankValue[actual] >= rankValue[predicate.proficiency.rankAtLeast]
      ? success()
      : failure(
          predicate,
          "PROFICIENCY_TOO_LOW",
          `Benötigt ${idName(context, predicate.proficiency.id)} auf ${predicate.proficiency.rankAtLeast}; aktuell: ${actual}.`,
          predicate.proficiency.rankAtLeast,
          actual
        );
  }
  if ("class" in predicate) {
    return context.character.classId === predicate.class.id
      ? success()
      : failure(
          predicate,
          "WRONG_CLASS",
          `Benötigt Klasse ${idName(context, predicate.class.id)}.`,
          predicate.class.id,
          context.character.classId ?? "none"
        );
  }
  if ("ancestry" in predicate) {
    return context.character.ancestryId === predicate.ancestry.id
      ? success()
      : failure(
          predicate,
          "WRONG_ANCESTRY",
          `Benötigt Abstammung ${idName(context, predicate.ancestry.id)}.`,
          predicate.ancestry.id,
          context.character.ancestryId ?? "none"
        );
  }
  if ("heritage" in predicate) {
    return context.character.heritageId === predicate.heritage.id
      ? success()
      : failure(
          predicate,
          "WRONG_HERITAGE",
          `Benötigt Herkunft ${idName(context, predicate.heritage.id)}.`,
          predicate.heritage.id,
          context.character.heritageId ?? "none"
        );
  }
  if ("background" in predicate) {
    return context.character.backgroundId === predicate.background.id
      ? success()
      : failure(
          predicate,
          "WRONG_BACKGROUND",
          `Benötigt Background ${idName(context, predicate.background.id)}.`,
          predicate.background.id,
          context.character.backgroundId ?? "none"
        );
  }
  if ("hasTrait" in predicate) {
    return context.traitIds.has(predicate.hasTrait.id)
      ? success()
      : failure(
          predicate,
          "MISSING_TRAIT",
          `Benötigt Trait ${idName(context, predicate.hasTrait.id)}.`
        );
  }
  if ("hasFeat" in predicate) {
    return context.featIds.has(predicate.hasFeat.id)
      ? success()
      : failure(
          predicate,
          "MISSING_FEAT",
          `Benötigt Feat ${idName(context, predicate.hasFeat.id)}.`
        );
  }
  if ("hasFeature" in predicate) {
    return context.featureIds.has(predicate.hasFeature.id)
      ? success()
      : failure(
          predicate,
          "MISSING_FEATURE",
          `Benötigt Feature ${idName(context, predicate.hasFeature.id)}.`
        );
  }
  if ("spellTradition" in predicate) {
    return context.traditions.has(predicate.spellTradition.id)
      ? success()
      : failure(
          predicate,
          "MISSING_TRADITION",
          `Benötigt Zaubertradition ${predicate.spellTradition.id}.`
        );
  }
  if ("knowsSpell" in predicate) {
    return context.spellIds.has(predicate.knowsSpell.id)
      ? success()
      : failure(
          predicate,
          "MISSING_SPELL",
          `Benötigt Zauber ${idName(context, predicate.knowsSpell.id)}.`
        );
  }
  if ("hasItem" in predicate) {
    return context.inventoryIds.has(predicate.hasItem.id)
      ? success()
      : failure(
          predicate,
          "MISSING_ITEM",
          `Benötigt Gegenstand ${idName(context, predicate.hasItem.id)}.`
        );
  }
  if ("equippedItem" in predicate) {
    return context.equippedItemIds.has(predicate.equippedItem.id)
      ? success()
      : failure(
          predicate,
          "ITEM_NOT_EQUIPPED",
          `Benötigt ausgerüsteten Gegenstand ${idName(context, predicate.equippedItem.id)}.`
        );
  }
  if ("itemTrait" in predicate) {
    const met = [...context.inventoryIds].some((itemId) =>
      context.entities.get(itemId)?.traits.includes(predicate.itemTrait.id)
    );
    return met
      ? success()
      : failure(
          predicate,
          "MISSING_ITEM_TRAIT",
          `Benötigt einen Gegenstand mit Merkmal ${idName(context, predicate.itemTrait.id)}.`
        );
  }
  if ("weaponCategory" in predicate) {
    const met = [...context.equippedItemIds].some((itemId) => {
      const entity = context.entities.get(itemId);
      return entity?.type === "weapon" && entity.categoryId === predicate.weaponCategory.id;
    });
    return met
      ? success()
      : failure(
          predicate,
          "WRONG_WEAPON_CATEGORY",
          `Benötigt eine ausgerüstete Waffe der Kategorie ${idName(
            context,
            predicate.weaponCategory.id
          )}.`
        );
  }
  if ("armorCategory" in predicate) {
    const met = [...context.equippedItemIds].some((itemId) => {
      const entity = context.entities.get(itemId);
      return entity?.type === "armor" && entity.categoryId === predicate.armorCategory.id;
    });
    return met
      ? success()
      : failure(
          predicate,
          "WRONG_ARMOR_CATEGORY",
          `Benötigt eine ausgerüstete Rüstung der Kategorie ${idName(
            context,
            predicate.armorCategory.id
          )}.`
        );
  }
  if ("previousChoice" in predicate) {
    const selected = context.character.choices[predicate.previousChoice.choiceId] ?? [];
    const met =
      predicate.previousChoice.optionId === undefined
        ? selected.length > 0
        : selected.includes(predicate.previousChoice.optionId);
    return met
      ? success()
      : failure(
          predicate,
          "MISSING_PREVIOUS_CHOICE",
          `Benötigt eine frühere Auswahl in ${idName(
            context,
            predicate.previousChoice.choiceId
          )}.`,
          predicate.previousChoice.optionId
        );
  }
  if ("characterOption" in predicate) {
    const actual = context.characterOptions.get(predicate.characterOption.key);
    return actual === predicate.characterOption.value
      ? success()
      : failure(
          predicate,
          "WRONG_CHARACTER_OPTION",
          `Benötigt Charakteroption ${predicate.characterOption.key} = ${String(
            predicate.characterOption.value
          )}; aktuell: ${String(actual ?? "nicht gesetzt")}.`,
          String(predicate.characterOption.value),
          actual === undefined ? "nicht gesetzt" : String(actual)
        );
  }
  const actual = context.resources.get(predicate.resource.id) ?? 0;
  return actual >= predicate.resource.gte
    ? success()
    : failure(
        predicate,
        "RESOURCE_TOO_LOW",
        `Benötigt ${idName(context, predicate.resource.id)} ${String(
          predicate.resource.gte
        )}; aktuell: ${String(actual)}.`,
        predicate.resource.gte,
        actual
      );
};

export const evaluatePredicates = (
  predicates: unknown[],
  context: EngineContext
): RequirementFailure[] =>
  predicates.flatMap((predicate) => evaluatePredicate(predicate, context).failures);
