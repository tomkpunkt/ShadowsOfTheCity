import {
  CatalogSchema,
  CharacterDocumentSchema,
  CharacterSessionStateSchema,
  type CharacterSessionState,
  type CharacterDocument,
  type ContentEntity
} from "@sotc/shared";

import {
  applyValueOperation,
  applyEffect,
  attributeModifier,
  createAccumulator,
  higherRank,
  proficiencyBonus,
  saveAttribute,
  stackedModifierBreakdown,
  type EffectAccumulator
} from "./effects.js";
import { evaluatePredicates } from "./predicate.js";
import type {
  AttributeId,
  BreakdownEntry,
  BuildIssue,
  CalculatedCharacter,
  CharacterState,
  ChoiceOption,
  EngineContext,
  EngineOptions,
  ExplainedValue,
  ProficiencyRank,
  RequirementFailure,
  ResolvedChoice,
  SaveId,
  SectionState,
  ValidationState,
  ValueTarget
} from "./types.js";

const attributes: AttributeId[] = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma"
];

const saves: SaveId[] = ["fortitude", "reflex", "will"];

const sumBreakdown = (breakdown: BreakdownEntry[]): ExplainedValue => ({
  value: breakdown.reduce((total, entry) => total + entry.value, 0),
  breakdown
});

const valueRuleOrder = {
  set: 0,
  replace: 0,
  add: 1,
  minimum: 2,
  maximum: 3
} as const;

const applyStructuredValueRules = (
  value: ExplainedValue,
  accumulator: EffectAccumulator,
  target: ValueTarget,
  level: number,
  selector?: string
): ExplainedValue => {
  const breakdown = [...value.breakdown];
  let current = value.value;
  const rules = accumulator.valueRules
    .filter(
      (rule) =>
        rule.target === target && (rule.selector === undefined || rule.selector === selector)
    )
    .sort(
      (left, right) =>
        valueRuleOrder[left.operation] - valueRuleOrder[right.operation] ||
        left.sourceId.localeCompare(right.sourceId)
    );
  for (const rule of rules) {
    const operand = rule.scale === "per-level" ? rule.value * level : rule.value;
    const next = applyValueOperation(current, rule.operation, operand);
    breakdown.push({
      sourceId: rule.sourceId,
      label: rule.label,
      value: next - current,
      kind: "rule"
    });
    current = next;
  }
  return { value: current, breakdown };
};

const calculatedValueKey = (target: ValueTarget, selector?: string): string =>
  `${target}:${selector ?? ""}`;

const rankAtLevel = (
  progression: Record<string, ProficiencyRank>,
  level: number
): ProficiencyRank => {
  const applicable = Object.entries(progression)
    .filter(([threshold]) => Number(threshold) <= level)
    .sort(([left], [right]) => Number(right) - Number(left))[0];
  return applicable?.[1] ?? "untrained";
};

const slotsAtLevel = (progression: Record<string, number[]>, level: number): number[] => {
  const applicable = Object.entries(progression)
    .filter(([threshold]) => Number(threshold) <= level)
    .sort(([left], [right]) => Number(right) - Number(left))[0];
  return applicable?.[1] ?? [];
};

const entityEffects = (entity: ContentEntity): unknown[] => {
  if ("effects" in entity && Array.isArray(entity.effects)) {
    return entity.effects;
  }
  return [];
};

const entityPrerequisites = (entity: ContentEntity): unknown[] => {
  if ("prerequisites" in entity && Array.isArray(entity.prerequisites)) {
    return entity.prerequisites;
  }
  return [];
};

const rulesDecisionFailures = (entity: ContentEntity): RequirementFailure[] => {
  if (entity.status !== "draft" && entity.editorialStatus !== "needs-rules-decision") {
    return [];
  }
  const decisionId = entityEffects(entity)
    .map((effect) =>
      effect !== null &&
      typeof effect === "object" &&
      "kind" in effect &&
      effect.kind === "text" &&
      "decisionId" in effect &&
      typeof effect.decisionId === "string"
        ? effect.decisionId
        : undefined
    )
    .find((value): value is string => value !== undefined);
  const key = decisionId ?? `rules-decision.${entity.id}`;
  return [
    {
      code: "RULES_DECISION_REQUIRED",
      message: `${entity.name} benötigt die fachliche Entscheidung ${key}.`,
      expected: true,
      actual: false,
      predicate: { characterOption: { key, value: true } }
    }
  ];
};

const entityLevel = (entity: ContentEntity): number | undefined =>
  "level" in entity && typeof entity.level === "number"
    ? entity.level
    : entity.type === "spell"
      ? entity.rank
      : undefined;

const entityMatchesChoice = (
  entity: ContentEntity,
  choice: Extract<ContentEntity, { type: "choice" }>
): boolean => {
  const filter = choice.choice.filter;
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
  return entity.id !== choice.id && !choice.choice.excludes.includes(entity.id);
};

const predicateOwnerId = (value: unknown, owner: "class" | "ancestry"): string | undefined => {
  if (Array.isArray(value)) {
    for (const item of value) {
      const id = predicateOwnerId(item, owner);
      if (id !== undefined) {
        return id;
      }
    }
    return undefined;
  }
  if (value === null || typeof value !== "object") {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  const ownerValue = record[owner];
  if (
    ownerValue !== null &&
    typeof ownerValue === "object" &&
    "id" in ownerValue &&
    typeof ownerValue.id === "string"
  ) {
    return ownerValue.id;
  }
  for (const nested of Object.values(record)) {
    const id = predicateOwnerId(nested, owner);
    if (id !== undefined) {
      return id;
    }
  }
  return undefined;
};

const isRelevantChoice = (
  choice: Extract<ContentEntity, { type: "choice" }>,
  character: CharacterState
): boolean => {
  if (Object.prototype.hasOwnProperty.call(character.choices, choice.id)) {
    return true;
  }
  const requiredClass = predicateOwnerId(choice.choice.prerequisites, "class");
  const requiredAncestry = predicateOwnerId(choice.choice.prerequisites, "ancestry");
  if (requiredClass !== undefined && requiredClass !== character.classId) {
    return false;
  }
  if (requiredAncestry !== undefined && requiredAncestry !== character.ancestryId) {
    return false;
  }
  const filter = choice.choice.filter;
  if (filter.classId !== undefined && filter.classId !== character.classId) {
    return false;
  }
  if (filter.ancestryId !== undefined && filter.ancestryId !== character.ancestryId) {
    return false;
  }
  return (
    choice.choice.level <= character.level ||
    Object.prototype.hasOwnProperty.call(character.choices, choice.id)
  );
};

const resolveChoice = (
  choice: Extract<ContentEntity, { type: "choice" }>,
  context: EngineContext
): ResolvedChoice => {
  const selectedIds =
    context.character.choices[choice.id] ??
    (choice.choice.filter.entityTypes?.includes("heritage") === true &&
    context.character.heritageId !== undefined
      ? [context.character.heritageId]
      : []);
  const choiceFailures = evaluatePredicates(choice.choice.prerequisites, context);
  const options: ChoiceOption[] = [...context.entities.values()]
    .filter((entity) => entityMatchesChoice(entity, choice))
    .map((entity): ChoiceOption => {
      const decisionFailures = rulesDecisionFailures(entity);
      const failures = [
        ...decisionFailures,
        ...evaluatePredicates(entityPrerequisites(entity), context)
      ];
      const selected = selectedIds.includes(entity.id);
      return {
        entity,
        status:
          decisionFailures.length > 0
            ? "blocked"
            : selected
              ? failures.length === 0
                ? "selected"
                : "invalid"
              : failures.length === 0
                ? "available"
                : "locked",
        failures
      };
    })
    .sort((left, right) => left.entity.name.localeCompare(right.entity.name));

  let state: ValidationState = "valid";
  if (choiceFailures.length > 0) {
    state = "blocked";
  } else if (selectedIds.length < choice.choice.min) {
    state = "incomplete";
  } else if (
    selectedIds.some((id) =>
      options.some((option) => option.entity.id === id && option.status === "blocked")
    )
  ) {
    state = "blocked";
  } else if (
    selectedIds.length > choice.choice.max ||
    selectedIds.some((id) => !options.some((option) => option.entity.id === id)) ||
    options.some((option) => option.status === "invalid")
  ) {
    state = "invalid";
  }
  return {
    choiceId: choice.id,
    name: choice.name,
    level: choice.choice.level,
    min: choice.choice.min,
    max: choice.choice.max,
    selectedIds,
    options,
    state
  };
};

const issueState = (issues: BuildIssue[]): ValidationState => {
  if (issues.some((issue) => issue.state === "invalid")) {
    return "invalid";
  }
  if (issues.some((issue) => issue.state === "blocked")) {
    return "blocked";
  }
  if (issues.some((issue) => issue.state === "incomplete")) {
    return "incomplete";
  }
  return "valid";
};

const aggregateSectionState = (states: Array<ValidationState | "not-relevant">): SectionState => {
  const relevant = states.filter((state): state is ValidationState => state !== "not-relevant");
  if (relevant.length === 0) {
    return "not-relevant";
  }
  if (relevant.includes("invalid")) {
    return "invalid";
  }
  if (relevant.includes("blocked")) {
    return "blocked";
  }
  if (relevant.includes("incomplete")) {
    return "incomplete";
  }
  return "valid";
};

const addCoreSelectionIssue = (
  issues: BuildIssue[],
  value: string | undefined,
  id: string,
  label: string
): void => {
  if (value === undefined) {
    issues.push({
      code: `MISSING_${id.toUpperCase()}`,
      state: "incomplete",
      message: `${label} wurde noch nicht gewählt.`
    });
  }
};

const selectedEntityIds = (character: CharacterState): Set<string> =>
  new Set([
    ...(character.ancestryId === undefined ? [] : [character.ancestryId]),
    ...(character.backgroundId === undefined ? [] : [character.backgroundId]),
    ...(character.classId === undefined ? [] : [character.classId]),
    ...Object.values(character.choices).flat(),
    ...character.inventoryIds,
    ...(character.heritageId === undefined ? [] : [character.heritageId])
  ]);

const validateSelectionReferences = (
  character: CharacterState,
  entities: Map<string, ContentEntity>,
  issues: BuildIssue[]
): void => {
  for (const id of selectedEntityIds(character)) {
    if (!entities.has(id)) {
      issues.push({
        code: "UNKNOWN_SELECTION",
        state: "invalid",
        entityId: id,
        message: `Die gespeicherte Auswahl ${id} existiert im Katalog nicht.`
      });
    }
  }
};

export const calculateCharacter = (
  catalogInput: unknown,
  documentInput: CharacterDocument,
  options: EngineOptions = {}
): CalculatedCharacter => {
  const catalog = CatalogSchema.parse(catalogInput);
  const document = CharacterDocumentSchema.parse(documentInput);
  const character = document.build;
  const session = CharacterSessionStateSchema.parse(document.session);
  const entities = new Map(catalog.entities.map((entity) => [entity.id, entity]));
  const issues: BuildIssue[] = [];
  addCoreSelectionIssue(issues, character.ancestryId, "ancestry", "Abstammung");
  addCoreSelectionIssue(issues, character.backgroundId, "background", "Hintergrund");
  addCoreSelectionIssue(issues, character.classId, "class", "Klasse");
  validateSelectionReferences(character, entities, issues);
  for (const id of selectedEntityIds(character)) {
    const entity = entities.get(id);
    if (entity?.status === "draft" || entity?.editorialStatus === "needs-rules-decision") {
      issues.push({
        code: "RULES_DECISION_REQUIRED",
        state: "blocked",
        entityId: id,
        message: `${entity.name} ist bis zu einer fachlichen Regelentscheidung blockiert.`
      });
    }
  }
  if (document.catalogHash !== catalog.contentHash) {
    issues.push({
      code: "CATALOG_HASH_MISMATCH",
      state: "invalid",
      message: `Build-Katalog ${document.catalogHash} stimmt nicht mit ${catalog.contentHash} überein.`
    });
  }

  const ancestry = entities.get(character.ancestryId ?? "");
  const background = entities.get(character.backgroundId ?? "");
  const characterClass = entities.get(character.classId ?? "");
  const heritage = entities.get(character.heritageId ?? "");
  if (ancestry !== undefined && ancestry.type !== "ancestry") {
    issues.push({
      code: "WRONG_ANCESTRY_TYPE",
      state: "invalid",
      entityId: ancestry.id,
      message: `${ancestry.id} ist keine Abstammung.`
    });
  }
  if (background !== undefined && background.type !== "background") {
    issues.push({
      code: "WRONG_BACKGROUND_TYPE",
      state: "invalid",
      entityId: background.id,
      message: `${background.id} ist kein Background.`
    });
  }
  if (characterClass !== undefined && characterClass.type !== "class") {
    issues.push({
      code: "WRONG_CLASS_TYPE",
      state: "invalid",
      entityId: characterClass.id,
      message: `${characterClass.id} ist keine Klasse.`
    });
  }
  if (
    heritage !== undefined &&
    (heritage.type !== "heritage" || heritage.ancestryId !== character.ancestryId)
  ) {
    issues.push({
      code: "INVALID_HERITAGE",
      state: "invalid",
      entityId: heritage.id,
      message: `${heritage.name} gehört nicht zur gewählten Abstammung.`
    });
  }

  const attributeBreakdowns = Object.fromEntries(
    attributes.map((attribute) => [
      attribute,
      [
        {
          sourceId: "base",
          label: "Basiswert",
          value: 10,
          kind: "base" as const
        }
      ]
    ])
  ) as Record<AttributeId, BreakdownEntry[]>;
  const attributeValues = Object.fromEntries(
    attributes.map((attribute) => [attribute, 10])
  ) as Record<AttributeId, number>;
  const applyBoost = (attribute: AttributeId, sourceId: string, label: string): void => {
    attributeValues[attribute] += 2;
    attributeBreakdowns[attribute].push({
      sourceId,
      label,
      value: 2,
      kind: "rule"
    });
  };

  if (ancestry?.type === "ancestry") {
    for (const boost of ancestry.boosts) {
      applyBoost(boost, ancestry.id, `${ancestry.name}: Attributsverbesserung`);
    }
    for (const flaw of ancestry.flaws) {
      attributeValues[flaw] -= 2;
      attributeBreakdowns[flaw].push({
        sourceId: ancestry.id,
        label: `${ancestry.name}: Attributsfehler`,
        value: -2,
        kind: "rule"
      });
    }
  }
  if (background?.type === "background") {
    for (const boost of background.boosts) {
      applyBoost(boost, background.id, `${background.name}: Attributsverbesserung`);
    }
  }
  for (const boost of character.attributeBoosts) {
    applyBoost(boost, "character.attribute-boosts", "Freie Attributsverbesserung");
  }
  const expectedFreeBoosts =
    (ancestry?.type === "ancestry" ? ancestry.freeBoosts : 0) +
    (background?.type === "background" ? background.freeBoosts : 0);
  if (character.attributeBoosts.length < expectedFreeBoosts) {
    issues.push({
      code: "MISSING_ATTRIBUTE_BOOSTS",
      state: "incomplete",
      message: `${String(
        expectedFreeBoosts - character.attributeBoosts.length
      )} freie Attributsverbesserung(en) fehlen.`
    });
  } else if (character.attributeBoosts.length > expectedFreeBoosts) {
    issues.push({
      code: "TOO_MANY_ATTRIBUTE_BOOSTS",
      state: "invalid",
      message: `Erlaubt sind ${String(expectedFreeBoosts)} freie Attributsverbesserungen.`
    });
  }

  const proficiencyRanks = new Map<string, ProficiencyRank>();
  if (characterClass?.type === "class") {
    proficiencyRanks.set("proficiency.perception", characterClass.initialProficiencies.perception);
    for (const save of saves) {
      proficiencyRanks.set(
        `proficiency.save.${save}`,
        characterClass.initialProficiencies.saves[save]
      );
    }
    for (const [id, rank] of Object.entries(characterClass.initialProficiencies.skills)) {
      proficiencyRanks.set(id, rank);
    }
    for (const [id, rank] of Object.entries(characterClass.initialProficiencies.weapons)) {
      proficiencyRanks.set(id, rank);
    }
    for (const [id, rank] of Object.entries(characterClass.initialProficiencies.armor)) {
      proficiencyRanks.set(id, rank);
    }
    proficiencyRanks.set("proficiency.class-dc", "trained");
  }
  if (background?.type === "background") {
    for (const skillId of background.trainedSkillIds) {
      proficiencyRanks.set(skillId, higherRank(proficiencyRanks.get(skillId), "trained"));
    }
  }
  for (const [choiceId, optionIds] of Object.entries(character.choices)) {
    const choice = entities.get(choiceId);
    if (choice?.type === "choice" && choice.choice.kind === "skill") {
      for (const skillId of optionIds) {
        if (entities.get(skillId)?.type === "skill") {
          proficiencyRanks.set(skillId, higherRank(proficiencyRanks.get(skillId), "trained"));
        }
      }
    }
  }

  const selectedIds = selectedEntityIds(character);
  const featIds = new Set([...selectedIds].filter((id) => entities.get(id)?.type === "feat"));
  const featureIds = new Set(
    [...selectedIds].filter((id) => entities.get(id)?.type === "class-feature")
  );
  const spellIds = new Set([...selectedIds].filter((id) => entities.get(id)?.type === "spell"));
  const traitIds = new Set<string>();
  const traditions = new Set<string>();
  const inventoryIds = new Set(character.inventoryIds);
  const equippedItemIds = new Set(
    character.inventoryIds.filter((id) => {
      const state = session.itemStates[id];
      return (
        state !== undefined && state.quantity > state.consumed && (state.equipped || state.active)
      );
    })
  );
  const selectedOptionIds = new Set(Object.values(character.choices).flat());
  const characterOptions = new Map(Object.entries(character.options));
  const resources = new Map<string, number>();

  if (ancestry?.type === "ancestry") {
    for (const id of ancestry.featureIds) {
      featIds.add(id);
    }
    for (const trait of ancestry.traits) {
      traitIds.add(trait);
    }
  }
  if (characterClass?.type === "class") {
    for (const id of characterClass.featureIds) {
      const feature = entities.get(id);
      if (
        feature?.type === "class-feature" &&
        feature.level <= character.level &&
        !feature.traits.some((trait) => trait.startsWith("trait.class-option."))
      ) {
        featureIds.add(id);
      }
    }
  }
  for (const entityId of [...featIds, ...featureIds, ...spellIds, ...inventoryIds]) {
    const entity = entities.get(entityId);
    for (const trait of entity?.traits ?? []) {
      traitIds.add(trait);
    }
  }

  let spellSlots: Array<{ rank: number; slots: ExplainedValue }> = [];
  if (characterClass?.type === "class" && characterClass.spellcastingProgressionId !== undefined) {
    const progression = entities.get(characterClass.spellcastingProgressionId);
    if (progression?.type === "spellcasting-progression") {
      traditions.add(progression.tradition);
      const rank = rankAtLevel(progression.proficiencyByLevel, character.level);
      proficiencyRanks.set(`proficiency.spell.${progression.tradition}`, rank);
      spellSlots = slotsAtLevel(progression.slotsByLevel, character.level).map((slots, index) => ({
        rank: index + 1,
        slots: sumBreakdown([
          {
            sourceId: progression.id,
            label: `${progression.name}: Rang ${String(index + 1)}`,
            value: slots,
            kind: "rule"
          }
        ])
      }));
    }
  }

  const context: EngineContext = {
    catalog,
    entities,
    character,
    attributes: attributeValues,
    proficiencyRanks,
    featIds,
    featureIds,
    traitIds,
    spellIds,
    traditions,
    inventoryIds,
    equippedItemIds,
    selectedOptionIds,
    characterOptions,
    resources
  };
  const accumulator = createAccumulator();
  for (const modifier of session.manualModifiers.filter((entry) => entry.active)) {
    accumulator.modifiers.push({
      sourceId: `session.${modifier.id}`,
      label: modifier.source,
      target: modifier.target,
      ...(modifier.selector === undefined ? {} : { selector: modifier.selector }),
      bonusType: modifier.bonusType,
      value: modifier.value
    });
  }
  const activeConditionIds = session.conditions
    .filter((condition) => condition.active && condition.conditionId !== undefined)
    .map((condition) => condition.conditionId as string)
    .filter((id) => entities.get(id)?.type === "condition");
  const sourceQueue = [
    ...(background?.type === "background" ? [background.id] : []),
    ...(heritage?.type === "heritage" ? [heritage.id] : []),
    ...featIds,
    ...featureIds,
    ...equippedItemIds,
    ...activeConditionIds
  ].sort();
  const processedSources = new Set<string>();
  while (sourceQueue.length > 0) {
    const sourceId = sourceQueue.shift();
    if (sourceId === undefined || processedSources.has(sourceId)) {
      continue;
    }
    processedSources.add(sourceId);
    const entity = entities.get(sourceId);
    if (entity === undefined) {
      continue;
    }
    for (const effect of entityEffects(entity)) {
      applyEffect(effect, sourceId, context, accumulator);
    }
    for (const grantedId of [...accumulator.grantedFeatIds, ...accumulator.grantedFeatureIds]) {
      if (!processedSources.has(grantedId)) {
        sourceQueue.push(grantedId);
      }
    }
    sourceQueue.sort();
  }

  for (const change of accumulator.attributeChanges) {
    attributeBreakdowns[change.attribute].push({
      sourceId: change.sourceId,
      label: entities.get(change.sourceId)?.name ?? change.sourceId,
      value: change.value,
      kind: "rule"
    });
  }
  const explainedAttributes = Object.fromEntries(
    attributes.map((attribute) => [attribute, sumBreakdown(attributeBreakdowns[attribute])])
  ) as Record<AttributeId, ExplainedValue>;
  const calculatedAttributeModifiers = Object.fromEntries(
    attributes.map((attribute) => [
      attribute,
      attributeModifier(explainedAttributes[attribute].value)
    ])
  ) as Record<AttributeId, number>;

  spellSlots = spellSlots.map((slot) => ({
    ...slot,
    slots: applyStructuredValueRules(
      slot.slots,
      accumulator,
      "spell-slot",
      character.level,
      `spell-rank.${String(slot.rank)}`
    )
  }));
  for (const rule of accumulator.spellcastingRules) {
    if (rule.operation !== "slots" || rule.rank === undefined || rule.value === undefined) {
      continue;
    }
    const existing = spellSlots.find((slot) => slot.rank === rule.rank);
    const entry: BreakdownEntry = {
      sourceId: rule.sourceId,
      label: entities.get(rule.sourceId)?.name ?? rule.sourceId,
      value: rule.value,
      kind: "rule"
    };
    if (existing === undefined) {
      spellSlots.push({ rank: rule.rank, slots: sumBreakdown([entry]) });
    } else {
      existing.slots = sumBreakdown([...existing.slots.breakdown, entry]);
    }
  }
  spellSlots.sort((left, right) => left.rank - right.rank);

  const resolvedChoices = [...entities.values()]
    .filter(
      (entity): entity is Extract<ContentEntity, { type: "choice" }> =>
        entity.type === "choice" &&
        (isRelevantChoice(entity, character) || accumulator.unlockedChoiceIds.has(entity.id))
    )
    .map((choice) => resolveChoice(choice, context))
    .sort((left, right) => left.level - right.level || left.name.localeCompare(right.name));
  for (const choice of resolvedChoices) {
    if (choice.state !== "valid") {
      const invalidOption = choice.options.find((option) => option.status === "invalid");
      issues.push({
        code:
          choice.state === "incomplete"
            ? "CHOICE_INCOMPLETE"
            : choice.state === "blocked"
              ? "CHOICE_BLOCKED"
              : "CHOICE_INVALID",
        state: choice.state,
        choiceId: choice.choiceId,
        message:
          choice.state === "incomplete"
            ? `${choice.name}: ${String(choice.min - choice.selectedIds.length)} Auswahl(en) fehlen.`
            : choice.state === "blocked"
              ? `${choice.name} ist durch eine frühere Entscheidung blockiert.`
              : `${choice.name} enthält eine ungültige Auswahl.`,
        failures: invalidOption?.failures
      });
    }
  }

  for (const entityId of [...featIds, ...featureIds]) {
    const entity = entities.get(entityId);
    if (entity === undefined) {
      continue;
    }
    const failures = evaluatePredicates(entityPrerequisites(entity), context);
    if (failures.length > 0) {
      issues.push({
        code: "UNMET_PREREQUISITE",
        state: "invalid",
        entityId,
        message: `${entity.name} erfüllt seine Voraussetzungen nicht.`,
        failures
      });
    }
  }

  const ancestryHp = ancestry?.type === "ancestry" ? ancestry.hp : 0;
  const classHp = characterClass?.type === "class" ? characterClass.hpPerLevel : 0;
  const constitutionPerLevel = attributeModifier(attributeValues.constitution);
  const hitPointBreakdown: BreakdownEntry[] = [
    {
      sourceId: ancestry?.id ?? "missing.ancestry",
      label: "Abstammungs-TP",
      value: ancestryHp,
      kind: "base"
    },
    {
      sourceId: characterClass?.id ?? "missing.class",
      label: "Klassen-TP pro Stufe",
      value: classHp * character.level,
      kind: "level"
    },
    {
      sourceId: "attribute.constitution",
      label: "Konstitutionsmodifikator pro Stufe",
      value: constitutionPerLevel * character.level,
      kind: "attribute"
    },
    ...accumulator.hpPerLevel.map((entry): BreakdownEntry => ({
      sourceId: entry.sourceId,
      label: `${entities.get(entry.sourceId)?.name ?? entry.sourceId} pro Stufe`,
      value: entry.value * character.level,
      kind: "rule"
    })),
    ...stackedModifierBreakdown(accumulator.modifiers, "hit-points")
  ];
  const hitPoints = applyStructuredValueRules(
    sumBreakdown(hitPointBreakdown),
    accumulator,
    "hit-points",
    character.level
  );
  const temporaryHitPoints = applyStructuredValueRules(
    sumBreakdown([]),
    accumulator,
    "temporary-hit-points",
    character.level
  );

  const armor = [...equippedItemIds]
    .map((id) => entities.get(id))
    .find(
      (entity): entity is Extract<ContentEntity, { type: "armor" }> => entity?.type === "armor"
    );
  const armorProficiencyId =
    armor === undefined
      ? "proficiency.armor.unarmored"
      : armor.categoryId.replace("trait.item.", "proficiency.");
  const armorRank = proficiencyRanks.get(armorProficiencyId) ?? "untrained";
  const dexterityModifier = attributeModifier(attributeValues.dexterity);
  const dexterityContribution =
    armor === undefined ? dexterityModifier : Math.min(dexterityModifier, armor.dexterityCap);
  const armorClass = applyStructuredValueRules(
    sumBreakdown([
      { sourceId: "base", label: "Basis-RK", value: 10, kind: "base" },
      {
        sourceId: "attribute.dexterity",
        label: "Geschicklichkeitsmodifikator",
        value: dexterityContribution,
        kind: "attribute"
      },
      {
        sourceId: armorProficiencyId,
        label: `Rüstungs-Proficiency (${armorRank})`,
        value: proficiencyBonus(armorRank, character.level),
        kind: "proficiency"
      },
      ...(armor === undefined
        ? []
        : [
            {
              sourceId: armor.id,
              label: armor.name,
              value: armor.itemBonus,
              kind: "item" as const
            }
          ]),
      ...stackedModifierBreakdown(accumulator.modifiers, "armor-class")
    ]),
    accumulator,
    "armor-class",
    character.level
  );

  const perceptionRank = proficiencyRanks.get("proficiency.perception") ?? "untrained";
  const perception = applyStructuredValueRules(
    sumBreakdown([
      {
        sourceId: "attribute.wisdom",
        label: "Weisheitsmodifikator",
        value: attributeModifier(attributeValues.wisdom),
        kind: "attribute"
      },
      {
        sourceId: "proficiency.perception",
        label: `Wahrnehmungs-Proficiency (${perceptionRank})`,
        value: proficiencyBonus(perceptionRank, character.level),
        kind: "proficiency"
      },
      ...stackedModifierBreakdown(accumulator.modifiers, "perception")
    ]),
    accumulator,
    "perception",
    character.level
  );

  const calculatedSaves = Object.fromEntries(
    saves.map((save) => {
      const rank = proficiencyRanks.get(`proficiency.save.${save}`) ?? "untrained";
      const attribute = saveAttribute[save];
      return [
        save,
        applyStructuredValueRules(
          sumBreakdown([
            {
              sourceId: `attribute.${attribute}`,
              label: `${attribute}-Modifikator`,
              value: attributeModifier(attributeValues[attribute]),
              kind: "attribute"
            },
            {
              sourceId: `proficiency.save.${save}`,
              label: `${save}-Proficiency (${rank})`,
              value: proficiencyBonus(rank, character.level),
              kind: "proficiency"
            },
            ...stackedModifierBreakdown(accumulator.modifiers, "save", save)
          ]),
          accumulator,
          "save",
          character.level,
          save
        )
      ];
    })
  ) as Record<SaveId, ExplainedValue>;

  const calculatedSkills = Object.fromEntries(
    [...entities.values()]
      .filter(
        (entity): entity is Extract<ContentEntity, { type: "skill" }> => entity.type === "skill"
      )
      .map((skill) => {
        const rank = proficiencyRanks.get(skill.id) ?? "untrained";
        return [
          skill.id,
          applyStructuredValueRules(
            sumBreakdown([
              {
                sourceId: `attribute.${skill.attribute}`,
                label: `${skill.attribute}-Modifikator`,
                value: attributeModifier(attributeValues[skill.attribute]),
                kind: "attribute"
              },
              {
                sourceId: skill.id,
                label: `${skill.name}-Proficiency (${rank})`,
                value: proficiencyBonus(rank, character.level),
                kind: "proficiency"
              },
              ...stackedModifierBreakdown(accumulator.modifiers, "skill", skill.id)
            ]),
            accumulator,
            "skill",
            character.level,
            skill.id
          )
        ];
      })
  );

  const keyAttribute =
    characterClass?.type === "class" ? characterClass.keyAttributes[0] : undefined;
  const classRank = proficiencyRanks.get("proficiency.class-dc") ?? "untrained";
  const classDc =
    keyAttribute === undefined
      ? undefined
      : applyStructuredValueRules(
          sumBreakdown([
            { sourceId: "base", label: "Basis-SG", value: 10, kind: "base" },
            {
              sourceId: `attribute.${keyAttribute}`,
              label: `${keyAttribute}-Modifikator`,
              value: attributeModifier(attributeValues[keyAttribute]),
              kind: "attribute"
            },
            {
              sourceId: "proficiency.class-dc",
              label: `Klassen-Proficiency (${classRank})`,
              value: proficiencyBonus(classRank, character.level),
              kind: "proficiency"
            },
            ...stackedModifierBreakdown(accumulator.modifiers, "class-dc")
          ]),
          accumulator,
          "class-dc",
          character.level
        );

  const progression =
    characterClass?.type === "class" && characterClass.spellcastingProgressionId !== undefined
      ? entities.get(characterClass.spellcastingProgressionId)
      : undefined;
  let spellDc: ExplainedValue | undefined;
  let spellAttack: ExplainedValue | undefined;
  if (progression?.type === "spellcasting-progression") {
    const rank = proficiencyRanks.get(`proficiency.spell.${progression.tradition}`) ?? "untrained";
    const commonSpellBreakdown: BreakdownEntry[] = [
      {
        sourceId: `attribute.${progression.castingAttribute}`,
        label: `${progression.castingAttribute}-Modifikator`,
        value: attributeModifier(attributeValues[progression.castingAttribute]),
        kind: "attribute"
      },
      {
        sourceId: `proficiency.spell.${progression.tradition}`,
        label: `Zauber-Proficiency (${rank})`,
        value: proficiencyBonus(rank, character.level),
        kind: "proficiency"
      }
    ];
    spellAttack = applyStructuredValueRules(
      sumBreakdown([
        ...commonSpellBreakdown,
        ...stackedModifierBreakdown(accumulator.modifiers, "spell-attack")
      ]),
      accumulator,
      "spell-attack",
      character.level
    );
    spellDc = applyStructuredValueRules(
      sumBreakdown([
        { sourceId: "base", label: "Basis-SG", value: 10, kind: "base" },
        ...commonSpellBreakdown,
        ...stackedModifierBreakdown(accumulator.modifiers, "spell-dc")
      ]),
      accumulator,
      "spell-dc",
      character.level
    );
  }

  const baseSpeed = applyStructuredValueRules(
    sumBreakdown([
      {
        sourceId: ancestry?.id ?? "missing.ancestry",
        label: "Abstammungsbewegung",
        value: ancestry?.type === "ancestry" ? ancestry.speed : 0,
        kind: "base"
      },
      ...accumulator.speedChanges.map((entry): BreakdownEntry => ({
        sourceId: entry.sourceId,
        label: entities.get(entry.sourceId)?.name ?? entry.sourceId,
        value: entry.value,
        kind: "rule"
      })),
      ...stackedModifierBreakdown(accumulator.modifiers, "speed")
    ]),
    accumulator,
    "speed",
    character.level
  );
  const movement = Object.fromEntries(
    ["land", "climb", "swim", "fly", "other"].map((movementType) => {
      let current = movementType === "land" ? baseSpeed : sumBreakdown([]);
      for (const rule of accumulator.movementRules
        .filter((candidate) => candidate.movementType === movementType)
        .sort(
          (left, right) =>
            valueRuleOrder[left.operation] - valueRuleOrder[right.operation] ||
            left.sourceId.localeCompare(right.sourceId)
        )) {
        const next = applyValueOperation(current.value, rule.operation, rule.value);
        current = {
          value: next,
          breakdown: [
            ...current.breakdown,
            {
              sourceId: rule.sourceId,
              label: rule.label,
              value: next - current.value,
              kind: "rule"
            }
          ]
        };
      }
      return [movementType, current];
    })
  );
  const speed = movement["land"] ?? baseSpeed;
  const initiative = applyStructuredValueRules(
    sumBreakdown([
      ...perception.breakdown,
      ...stackedModifierBreakdown(accumulator.modifiers, "initiative")
    ]),
    accumulator,
    "initiative",
    character.level
  );

  const weapons = [...equippedItemIds]
    .map((id) => entities.get(id))
    .filter(
      (entity): entity is Extract<ContentEntity, { type: "weapon" }> => entity?.type === "weapon"
    );
  const weaponAttacks = Object.fromEntries(
    weapons.map((weapon) => {
      const proficiencyId = weapon.categoryId.replace("trait.item.", "proficiency.");
      const rank = proficiencyRanks.get(proficiencyId) ?? "untrained";
      const attackAttribute = weapon.range === undefined ? "strength" : "dexterity";
      const damageAttribute = weapon.damage.modifier;
      return [
        weapon.id,
        {
          attack: applyStructuredValueRules(
            sumBreakdown([
              {
                sourceId: `attribute.${attackAttribute}`,
                label: `${attackAttribute}-Modifikator`,
                value: attributeModifier(attributeValues[attackAttribute]),
                kind: "attribute"
              },
              {
                sourceId: proficiencyId,
                label: `Waffen-Proficiency (${rank})`,
                value: proficiencyBonus(rank, character.level),
                kind: "proficiency"
              },
              ...stackedModifierBreakdown(accumulator.modifiers, "weapon-attack", weapon.id),
              ...accumulator.attackRules
                .filter(
                  (rule) =>
                    (rule.selector === undefined || rule.selector === weapon.id) &&
                    rule.attackModifier !== undefined
                )
                .map((rule) => ({
                  sourceId: rule.sourceId,
                  label: entities.get(rule.sourceId)?.name ?? rule.sourceId,
                  value: rule.attackModifier ?? 0,
                  kind: "rule" as const
                }))
            ]),
            accumulator,
            "weapon-attack",
            character.level,
            weapon.id
          ),
          damage: {
            dice:
              accumulator.attackRules.find(
                (rule) =>
                  (rule.selector === undefined || rule.selector === weapon.id) &&
                  rule.damageDice !== undefined
              )?.damageDice ?? `${String(weapon.damage.dice)}${weapon.damage.die}`,
            flat: applyStructuredValueRules(
              sumBreakdown([
                {
                  sourceId: weapon.id,
                  label: "Fester Waffenschaden",
                  value: weapon.damage.flat,
                  kind: "item"
                },
                ...(damageAttribute === undefined
                  ? []
                  : [
                      {
                        sourceId: `attribute.${damageAttribute}`,
                        label: `${damageAttribute}-Modifikator`,
                        value: attributeModifier(attributeValues[damageAttribute]),
                        kind: "attribute" as const
                      }
                    ]),
                ...stackedModifierBreakdown(accumulator.modifiers, "weapon-damage", weapon.id),
                ...accumulator.attackRules
                  .filter(
                    (rule) =>
                      (rule.selector === undefined || rule.selector === weapon.id) &&
                      rule.damageModifier !== undefined
                  )
                  .map((rule) => ({
                    sourceId: rule.sourceId,
                    label: entities.get(rule.sourceId)?.name ?? rule.sourceId,
                    value: rule.damageModifier ?? 0,
                    kind: "rule" as const
                  }))
              ]),
              accumulator,
              "weapon-damage",
              character.level,
              weapon.id
            ),
            type:
              accumulator.attackRules.find(
                (rule) =>
                  (rule.selector === undefined || rule.selector === weapon.id) &&
                  rule.damageType !== undefined
              )?.damageType ?? weapon.damage.type
          },
          ...(() => {
            const matchingRules = accumulator.attackRules
              .filter((rule) => rule.selector === undefined || rule.selector === weapon.id)
              .sort((left, right) => left.sourceId.localeCompare(right.sourceId));
            const reversedRules = [...matchingRules].reverse();
            const range = reversedRules.find((rule) => rule.range !== undefined)?.range;
            const capacity = reversedRules.find((rule) => rule.capacity !== undefined)?.capacity;
            const reload = reversedRules.find((rule) => rule.reload !== undefined)?.reload;
            return {
              ...(range === undefined && weapon.range === undefined
                ? {}
                : { range: range ?? weapon.range }),
              ...(capacity === undefined && weapon.capacity === undefined
                ? {}
                : { capacity: capacity ?? weapon.capacity }),
              ...(reload === undefined ? {} : { reload })
            };
          })(),
          traits: [
            ...new Set([
              ...weapon.traits,
              ...accumulator.attackRules
                .filter(
                  (rule) =>
                    (rule.selector === undefined || rule.selector === weapon.id) &&
                    rule.weaponTraitId !== undefined
                )
                .map((rule) => rule.weaponTraitId as string)
            ])
          ].sort()
        }
      ];
    })
  );

  const bulk = applyStructuredValueRules(
    sumBreakdown(
      character.inventoryIds
        .map((id) => entities.get(id))
        .filter(
          (
            entity
          ): entity is Extract<
            ContentEntity,
            { type: "weapon" | "armor" | "equipment" | "cyberware" }
          > =>
            entity?.type === "weapon" ||
            entity?.type === "armor" ||
            entity?.type === "equipment" ||
            entity?.type === "cyberware"
        )
        .map((entity) => ({
          sourceId: entity.id,
          label: entity.name,
          value: entity.bulk,
          kind: "item" as const
        }))
    ),
    accumulator,
    "bulk",
    character.level
  );

  if (options.includeLegacyTextWarnings === true) {
    for (const effect of accumulator.ignoredTextEffects) {
      issues.push({
        code: "NON_MACHINE_READABLE_EFFECT",
        state: "blocked",
        entityId: effect.sourceId,
        message: `${entities.get(effect.sourceId)?.name ?? effect.sourceId} enthält eine nicht automatisierte Legacy-Regel.`
      });
    }
  }

  const calculatedResources = Object.fromEntries(
    [...resources.keys()]
      .sort((left, right) => left.localeCompare(right))
      .map((resourceId) => [
        resourceId,
        sumBreakdown(
          accumulator.resourceChanges
            .filter((change) => change.resourceId === resourceId)
            .map((change) => ({
              sourceId: change.sourceId,
              label: entities.get(change.sourceId)?.name ?? change.sourceId,
              value: change.value,
              kind: "rule" as const
            }))
        )
      ])
  );

  const calculatedValues = new Map<string, ExplainedValue>();
  for (const [attribute, value] of Object.entries(explainedAttributes)) {
    calculatedValues.set(calculatedValueKey("attribute-score", attribute), value);
  }
  calculatedValues.set(calculatedValueKey("hit-points"), hitPoints);
  calculatedValues.set(calculatedValueKey("temporary-hit-points"), temporaryHitPoints);
  calculatedValues.set(calculatedValueKey("armor-class"), armorClass);
  calculatedValues.set(calculatedValueKey("perception"), perception);
  calculatedValues.set(calculatedValueKey("initiative"), initiative);
  calculatedValues.set(calculatedValueKey("speed"), speed);
  calculatedValues.set(calculatedValueKey("bulk"), bulk);
  for (const [save, value] of Object.entries(calculatedSaves)) {
    calculatedValues.set(calculatedValueKey("save", save), value);
  }
  for (const [skillId, value] of Object.entries(calculatedSkills)) {
    calculatedValues.set(calculatedValueKey("skill", skillId), value);
  }
  if (classDc !== undefined) {
    calculatedValues.set(calculatedValueKey("class-dc"), classDc);
  }
  if (spellDc !== undefined) {
    calculatedValues.set(calculatedValueKey("spell-dc"), spellDc);
  }
  if (spellAttack !== undefined) {
    calculatedValues.set(calculatedValueKey("spell-attack"), spellAttack);
  }
  for (const slot of spellSlots) {
    calculatedValues.set(
      calculatedValueKey("spell-slot", `spell-rank.${String(slot.rank)}`),
      slot.slots
    );
  }
  for (const [weaponId, attack] of Object.entries(weaponAttacks)) {
    calculatedValues.set(calculatedValueKey("weapon-attack", weaponId), attack.attack);
    calculatedValues.set(calculatedValueKey("weapon-damage", weaponId), attack.damage.flat);
  }
  for (const [resourceId, value] of Object.entries(calculatedResources)) {
    calculatedValues.set(calculatedValueKey("resource", resourceId), value);
  }

  for (const rule of accumulator.derivedRules.sort((left, right) =>
    left.sourceId.localeCompare(right.sourceId)
  )) {
    const targetKey = calculatedValueKey(rule.target, rule.selector);
    const sourceKey = calculatedValueKey(rule.from, rule.fromSelector);
    const target = calculatedValues.get(targetKey);
    const source = calculatedValues.get(sourceKey);
    if (target === undefined || source === undefined || targetKey === sourceKey) {
      issues.push({
        code: targetKey === sourceKey ? "DERIVED_VALUE_CYCLE" : "DERIVED_VALUE_UNRESOLVED",
        state: "blocked",
        entityId: rule.sourceId,
        message: `${rule.label} kann ${sourceKey} nicht eindeutig nach ${targetKey} ableiten.`
      });
      continue;
    }
    const next = source.value * rule.multiplier + rule.offset;
    target.breakdown.push({
      sourceId: rule.sourceId,
      label: rule.label,
      value: next - target.value,
      kind: "rule"
    });
    target.value = next;
  }

  const state = issueState(issues);
  const coreSectionState = (ids: Array<string | undefined>): ValidationState => {
    const relevantIssues = issues.filter(
      (issue) =>
        issue.entityId !== undefined &&
        ids.includes(issue.entityId) &&
        (issue.state === "invalid" || issue.state === "blocked")
    );
    if (relevantIssues.length > 0) {
      return issueState(relevantIssues);
    }
    return ids[0] === undefined ? "incomplete" : "valid";
  };
  const choiceSectionState = (kinds: string[]): SectionState => {
    const states = resolvedChoices
      .filter((choice) => {
        const entity = entities.get(choice.choiceId);
        return entity?.type === "choice" && kinds.includes(entity.choice.kind);
      })
      .map((choice) => choice.state);
    return states.length === 0 ? "not-relevant" : aggregateSectionState(states);
  };
  const attributeState: ValidationState =
    character.attributeBoosts.length === expectedFreeBoosts
      ? "valid"
      : character.attributeBoosts.length < expectedFreeBoosts
        ? "incomplete"
        : "invalid";
  const sectionStatuses: Record<string, SectionState> = {
    overview: state,
    ancestry: aggregateSectionState([
      coreSectionState([character.ancestryId, character.heritageId]),
      choiceSectionState(["heritage"])
    ]),
    background: coreSectionState([character.backgroundId]),
    class: aggregateSectionState([
      coreSectionState([character.classId]),
      choiceSectionState(["class-option"])
    ]),
    attributes: attributeState,
    skills: choiceSectionState(["skill"]),
    feats: choiceSectionState(["feat"]),
    spells:
      progression?.type === "spellcasting-progression"
        ? aggregateSectionState([choiceSectionState(["spell"])])
        : "not-relevant",
    equipment: character.inventoryIds.some((id) => !entities.has(id)) ? "invalid" : "valid",
    compendium: "not-relevant",
    review: state,
    sheet: state
  };
  const allFeatIds = [...new Set([...featIds, ...accumulator.grantedFeatIds])].sort();
  const allFeatureIds = [...new Set([...featureIds, ...accumulator.grantedFeatureIds])].sort();
  const allSpellIds = [...new Set([...spellIds, ...accumulator.grantedSpellIds])].sort();
  const allInventoryIds = [...new Set([...inventoryIds, ...accumulator.grantedItemIds])].sort();
  const explanations = [
    ...Object.entries(explainedAttributes).map(([key, value]) => ({
      key: `attribute.${key}`,
      value
    })),
    { key: "hit-points", value: hitPoints },
    { key: "temporary-hit-points", value: temporaryHitPoints },
    { key: "armor-class", value: armorClass },
    { key: "perception", value: perception },
    { key: "initiative", value: initiative },
    ...Object.entries(calculatedSaves).map(([key, value]) => ({ key: `save.${key}`, value })),
    ...Object.entries(calculatedSkills).map(([key, value]) => ({ key, value })),
    ...(classDc === undefined ? [] : [{ key: "class-dc", value: classDc }]),
    ...(spellDc === undefined ? [] : [{ key: "spell-dc", value: spellDc }]),
    ...(spellAttack === undefined ? [] : [{ key: "spell-attack", value: spellAttack }]),
    { key: "speed", value: speed },
    { key: "bulk", value: bulk }
  ].sort((left, right) => left.key.localeCompare(right.key));
  const recoveryFor = (
    resourceId: string
  ): CharacterSessionState["resources"][string]["recovery"] => {
    const resource = entities.get(resourceId);
    if (resource?.type !== "resource") {
      return "manual";
    }
    return {
      never: "never",
      encounter: "encounter",
      hour: "short-rest",
      day: "daily",
      week: "daily"
    }[resource.refresh] as CharacterSessionState["resources"][string]["recovery"];
  };
  const resourceIds = new Set([
    ...Object.keys(calculatedResources),
    ...Object.keys(session.resources)
  ]);
  const evaluatedResources = Object.fromEntries(
    [...resourceIds].sort().map((resourceId) => {
      const configured = session.resources[resourceId];
      const calculated = calculatedResources[resourceId];
      const maximum = calculated?.value ?? configured?.maximum ?? 0;
      return [
        resourceId,
        {
          current: Math.max(0, Math.min(configured?.current ?? maximum, maximum)),
          maximum,
          recovery: configured?.recovery ?? recoveryFor(resourceId),
          ...(configured?.sourceId === undefined ? {} : { sourceId: configured.sourceId }),
          orphaned: calculated === undefined
        }
      ];
    })
  );
  const calculatedActionIds = new Set([
    ...accumulator.actionGrants.map((action) => action.actionId),
    ...accumulator.grantedActionIds
  ]);
  const slotRanks = new Set(spellSlots.map((slot) => String(slot.rank)));
  const orphanedEntries: CalculatedCharacter["session"]["orphanedEntries"] = [
    ...session.conditions
      .filter(
        (condition) =>
          condition.conditionId !== undefined && entities.get(condition.conditionId) === undefined
      )
      .map((condition) => ({
        kind: "condition" as const,
        id: condition.id,
        reason: `Die Zustandsquelle ${condition.conditionId ?? condition.name} existiert nicht mehr.`
      })),
    ...Object.keys(session.resources)
      .filter((id) => calculatedResources[id] === undefined)
      .map((id) => ({
        kind: "resource" as const,
        id,
        reason: "Die Ressource wird vom aktuellen Build nicht mehr bereitgestellt."
      })),
    ...Object.keys(session.spellSlotUsage)
      .filter((rank) => !slotRanks.has(rank))
      .map((rank) => ({
        kind: "spell-slot" as const,
        id: rank,
        reason: "Dieser Zauberrang ist im aktuellen Build nicht verfügbar."
      })),
    ...Object.keys(session.actionUses)
      .filter((id) => !calculatedActionIds.has(id))
      .map((id) => ({
        kind: "action" as const,
        id,
        reason: "Die verwendete Aktion wird vom aktuellen Build nicht mehr bereitgestellt."
      })),
    ...Object.keys(session.itemStates)
      .filter((id) => !allInventoryIds.includes(id))
      .map((id) => ({
        kind: "item" as const,
        id,
        reason: "Der Gegenstand befindet sich nicht mehr im aktuellen Inventar."
      })),
    ...session.manualModifiers
      .filter(
        (modifier) =>
          modifier.selector !== undefined &&
          ["skill", "weapon-attack", "weapon-damage"].includes(modifier.target) &&
          !entities.has(modifier.selector)
      )
      .map((modifier) => ({
        kind: "modifier" as const,
        id: modifier.id,
        reason: `Das Ziel ${modifier.selector ?? modifier.target} existiert nicht mehr.`
      }))
  ];

  return {
    state,
    status: state,
    catalogHash: catalog.contentHash,
    name: character.name,
    level: character.level,
    identity: {
      name: character.name,
      level: character.level,
      ...(character.ancestryId === undefined ? {} : { ancestryId: character.ancestryId }),
      ...(character.heritageId === undefined ? {} : { heritageId: character.heritageId }),
      ...(character.backgroundId === undefined ? {} : { backgroundId: character.backgroundId }),
      ...(character.classId === undefined ? {} : { classId: character.classId })
    },
    expectedAttributeBoosts: expectedFreeBoosts,
    sectionStatuses,
    attributes: explainedAttributes,
    attributeModifiers: calculatedAttributeModifiers,
    hitPoints,
    temporaryHitPoints,
    armorClass,
    perception,
    initiative,
    saves: calculatedSaves,
    skills: calculatedSkills,
    ...(classDc === undefined ? {} : { classDc }),
    ...(spellDc === undefined ? {} : { spellDc }),
    ...(spellAttack === undefined ? {} : { spellAttack }),
    spellSlots,
    weaponAttacks,
    speed,
    movement,
    bulk,
    languages: [
      ...new Set([
        ...(ancestry?.type === "ancestry" ? ancestry.languageIds : []),
        ...accumulator.grantedLanguageIds
      ])
    ].sort(),
    traits: [...traitIds].sort(),
    featIds: allFeatIds,
    featureIds: allFeatureIds,
    spellIds: allSpellIds,
    inventoryIds: allInventoryIds,
    inventory: allInventoryIds.map((id) => ({
      id,
      equipped: equippedItemIds.has(id),
      known: entities.has(id)
    })),
    proficiencies: Object.fromEntries(
      [...proficiencyRanks.entries()].sort(([left], [right]) => left.localeCompare(right))
    ),
    grants: {
      featIds: [...accumulator.grantedFeatIds].sort(),
      featureIds: [...accumulator.grantedFeatureIds].sort(),
      spellIds: [...accumulator.grantedSpellIds].sort(),
      itemIds: [...accumulator.grantedItemIds].sort(),
      languageIds: [...accumulator.grantedLanguageIds].sort(),
      actionIds: [...accumulator.grantedActionIds].sort(),
      choiceIds: [...accumulator.unlockedChoiceIds].sort()
    },
    actions: accumulator.actionGrants
      .map((action) => ({
        id: action.actionId,
        sourceId: action.sourceId,
        type: action.actionType,
        ...(action.actions === undefined ? {} : { actions: action.actions }),
        parameters: action.parameters
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
    spells: {
      traditions: [...traditions].sort(),
      knownIds: allSpellIds,
      slots: spellSlots,
      rules: accumulator.spellcastingRules
        .map((rule) => ({
          sourceId: rule.sourceId,
          tradition: rule.tradition,
          operation: rule.operation,
          ...(rule.rank === undefined ? {} : { rank: rule.rank }),
          ...(rule.value === undefined ? {} : { value: rule.value })
        }))
        .sort((left, right) => left.sourceId.localeCompare(right.sourceId))
    },
    explanations,
    resources: calculatedResources,
    session: {
      currentHp: Math.max(0, Math.min(session.currentHp ?? hitPoints.value, hitPoints.value)),
      temporaryHp: session.temporaryHp,
      conditions: session.conditions,
      resources: evaluatedResources,
      spellSlotUsage: Object.fromEntries(
        Object.entries(session.spellSlotUsage).map(([rank, used]) => [
          rank,
          Math.min(used, spellSlots.find((slot) => String(slot.rank) === rank)?.slots.value ?? used)
        ])
      ),
      itemStates: session.itemStates,
      actionUses: session.actionUses,
      manualModifiers: session.manualModifiers,
      orphanedEntries
    },
    choices: resolvedChoices,
    issues,
    ignoredTextEffects: accumulator.ignoredTextEffects
  };
};
