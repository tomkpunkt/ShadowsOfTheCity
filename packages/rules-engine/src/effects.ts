import { EffectSchema } from "@sotc/shared";

import { evaluatePredicate } from "./predicate.js";
import type {
  AttributeId,
  BonusType,
  BreakdownEntry,
  EffectNode,
  EngineContext,
  ProficiencyRank,
  SaveId
} from "./types.js";

export interface AppliedModifier {
  sourceId: string;
  label: string;
  target: string;
  selector?: string;
  bonusType: BonusType;
  value: number;
}

export interface EffectAccumulator {
  attributeChanges: Array<{ sourceId: string; attribute: AttributeId; value: number }>;
  modifiers: AppliedModifier[];
  hpPerLevel: Array<{ sourceId: string; value: number }>;
  speedChanges: Array<{ sourceId: string; value: number }>;
  resourceChanges: Array<{ sourceId: string; resourceId: string; value: number }>;
  ignoredTextEffects: Array<{ sourceId: string; text: string }>;
  grantedFeatIds: Set<string>;
  grantedFeatureIds: Set<string>;
  unlockedChoiceIds: Set<string>;
}

const rankOrder: Record<ProficiencyRank, number> = {
  untrained: 0,
  trained: 1,
  expert: 2,
  master: 3,
  legendary: 4
};

export const higherRank = (
  left: ProficiencyRank | undefined,
  right: ProficiencyRank
): ProficiencyRank => (left === undefined || rankOrder[right] > rankOrder[left] ? right : left);

export const createAccumulator = (): EffectAccumulator => ({
  attributeChanges: [],
  modifiers: [],
  hpPerLevel: [],
  speedChanges: [],
  resourceChanges: [],
  ignoredTextEffects: [],
  grantedFeatIds: new Set(),
  grantedFeatureIds: new Set(),
  unlockedChoiceIds: new Set()
});

const addModifier = (
  accumulator: EffectAccumulator,
  sourceId: string,
  target: string,
  bonusType: BonusType,
  value: number,
  selector?: string,
  label?: string
): void => {
  accumulator.modifiers.push({
    sourceId,
    label: label ?? sourceId,
    target,
    bonusType,
    value,
    ...(selector === undefined ? {} : { selector })
  });
};

export const applyEffect = (
  input: unknown,
  sourceId: string,
  context: EngineContext,
  accumulator: EffectAccumulator
): void => {
  const effect = EffectSchema.parse(input) as EffectNode;
  switch (effect.kind) {
    case "attribute":
      context.attributes[effect.attribute] += effect.value;
      accumulator.attributeChanges.push({
        sourceId,
        attribute: effect.attribute,
        value: effect.value
      });
      return;
    case "modifier":
      addModifier(
        accumulator,
        sourceId,
        effect.target,
        effect.bonusType,
        effect.value,
        effect.selector,
        effect.label
      );
      return;
    case "proficiency":
      context.proficiencyRanks.set(
        effect.proficiencyId,
        higherRank(context.proficiencyRanks.get(effect.proficiencyId), effect.rank)
      );
      return;
    case "hit-points":
      accumulator.hpPerLevel.push({ sourceId, value: effect.perLevel });
      return;
    case "speed":
      accumulator.speedChanges.push({ sourceId, value: effect.value });
      return;
    case "perception":
      if (effect.rank !== undefined) {
        context.proficiencyRanks.set(
          "proficiency.perception",
          higherRank(context.proficiencyRanks.get("proficiency.perception"), effect.rank)
        );
      }
      if (effect.bonus !== undefined) {
        addModifier(accumulator, sourceId, "perception", "untyped", effect.bonus);
      }
      return;
    case "save":
      if (effect.rank !== undefined) {
        const proficiencyId = `proficiency.save.${effect.save}`;
        context.proficiencyRanks.set(
          proficiencyId,
          higherRank(context.proficiencyRanks.get(proficiencyId), effect.rank)
        );
      }
      if (effect.bonus !== undefined) {
        addModifier(accumulator, sourceId, "save", "untyped", effect.bonus, effect.save);
      }
      return;
    case "skill-training":
      context.proficiencyRanks.set(
        effect.skillId,
        higherRank(context.proficiencyRanks.get(effect.skillId), effect.rank)
      );
      return;
    case "weapon-proficiency":
      context.proficiencyRanks.set(
        effect.categoryId,
        higherRank(context.proficiencyRanks.get(effect.categoryId), effect.rank)
      );
      return;
    case "armor-proficiency":
      context.proficiencyRanks.set(
        effect.categoryId,
        higherRank(context.proficiencyRanks.get(effect.categoryId), effect.rank)
      );
      return;
    case "grant-feat":
      accumulator.grantedFeatIds.add(effect.featId);
      context.featIds.add(effect.featId);
      return;
    case "grant-feature":
      accumulator.grantedFeatureIds.add(effect.featureId);
      context.featureIds.add(effect.featureId);
      return;
    case "spell-access":
      context.traditions.add(effect.tradition);
      for (const spellId of effect.spellIds) {
        context.spellIds.add(spellId);
      }
      return;
    case "resource":
      context.resources.set(
        effect.resourceId,
        (context.resources.get(effect.resourceId) ?? 0) + effect.delta
      );
      accumulator.resourceChanges.push({
        sourceId,
        resourceId: effect.resourceId,
        value: effect.delta
      });
      return;
    case "unlock-choice":
      accumulator.unlockedChoiceIds.add(effect.choiceId);
      return;
    case "conditional":
      if (evaluatePredicate(effect.when, context).met) {
        for (const nested of effect.effects) {
          applyEffect(nested, sourceId, context, accumulator);
        }
      }
      return;
    case "text":
      accumulator.ignoredTextEffects.push({ sourceId, text: effect.text });
  }
};

const modifierKind = (bonusType: BonusType): BreakdownEntry["kind"] =>
  bonusType === "item" ? "item" : bonusType;

export const stackedModifierBreakdown = (
  modifiers: AppliedModifier[],
  target: string,
  selector?: string
): BreakdownEntry[] => {
  const matching = modifiers.filter(
    (modifier) =>
      modifier.target === target &&
      (modifier.selector === undefined || modifier.selector === selector)
  );
  const untyped = matching.filter((modifier) => modifier.bonusType === "untyped");
  const typed = (["status", "circumstance", "item"] as const).flatMap((bonusType) => {
    const candidates = matching.filter((modifier) => modifier.bonusType === bonusType);
    const bestBonus = candidates
      .filter((modifier) => modifier.value > 0)
      .sort((left, right) => right.value - left.value)[0];
    const worstPenalty = candidates
      .filter((modifier) => modifier.value < 0)
      .sort((left, right) => left.value - right.value)[0];
    return [bestBonus, worstPenalty].filter(
      (modifier): modifier is AppliedModifier => modifier !== undefined
    );
  });
  return [...untyped, ...typed].map((modifier) => ({
    sourceId: modifier.sourceId,
    label: modifier.label,
    value: modifier.value,
    kind: modifierKind(modifier.bonusType)
  }));
};

export const proficiencyBonus = (rank: ProficiencyRank, level: number): number =>
  rank === "untrained" ? 0 : level + rankOrder[rank] * 2;

export const attributeModifier = (score: number): number => Math.floor((score - 10) / 2);

export const saveAttribute: Record<SaveId, AttributeId> = {
  fortitude: "constitution",
  reflex: "dexterity",
  will: "wisdom"
};
