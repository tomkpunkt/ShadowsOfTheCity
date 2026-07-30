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
    return context.character.level >= predicate.characterLevel.gte
      ? success()
      : failure(
          predicate,
          "LEVEL_TOO_LOW",
          `Benötigt Stufe ${String(predicate.characterLevel.gte)}; aktuell: ${String(
            context.character.level
          )}.`,
          predicate.characterLevel.gte,
          context.character.level
        );
  }
  if ("attribute" in predicate) {
    const actual = context.attributes[predicate.attribute.id];
    return actual >= predicate.attribute.gte
      ? success()
      : failure(
          predicate,
          "ATTRIBUTE_TOO_LOW",
          `Benötigt ${predicate.attribute.id} ${String(
            predicate.attribute.gte
          )}; aktuell: ${String(actual)}.`,
          predicate.attribute.gte,
          actual
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
