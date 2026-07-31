import type { Catalog, CharacterBuild, CharacterSessionState, ContentEntity } from "@sotc/shared";

export type AttributeId =
  "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";

export type SaveId = "fortitude" | "reflex" | "will";
export type ProficiencyRank = "untrained" | "trained" | "expert" | "master" | "legendary";
export type BonusType = "status" | "circumstance" | "item" | "untyped";
export type ValidationState = "valid" | "incomplete" | "invalid" | "blocked";
export type SectionState = ValidationState | "not-relevant";
export type ValueOperation = "set" | "add" | "minimum" | "maximum" | "replace";
export type ValueTarget =
  | "armor-class"
  | "class-dc"
  | "spell-dc"
  | "spell-attack"
  | "perception"
  | "initiative"
  | "speed"
  | "hit-points"
  | "skill"
  | "save"
  | "weapon-attack"
  | "weapon-damage"
  | "attribute-score"
  | "temporary-hit-points"
  | "bulk"
  | "resource"
  | "spell-slot";

export type PredicateNode =
  | { all: PredicateNode[] }
  | { any: PredicateNode[] }
  | { not: PredicateNode }
  | { characterLevel: { gte?: number; lte?: number } }
  | { attribute: { id: AttributeId; gte?: number; lte?: number } }
  | { proficiency: { id: string; rankAtLeast: ProficiencyRank } }
  | { class: { id: string } }
  | { ancestry: { id: string } }
  | { heritage: { id: string } }
  | { background: { id: string } }
  | { hasTrait: { id: string } }
  | { hasFeat: { id: string } }
  | { hasFeature: { id: string } }
  | { spellTradition: { id: "arcane" | "divine" | "occult" | "primal" } }
  | { knowsSpell: { id: string } }
  | { hasItem: { id: string } }
  | { equippedItem: { id: string } }
  | { itemTrait: { id: string } }
  | { weaponCategory: { id: string } }
  | { armorCategory: { id: string } }
  | { previousChoice: { choiceId: string; optionId?: string } }
  | { characterOption: { key: string; value: string | number | boolean } }
  | { resource: { id: string; gte: number } };

export type EffectNode =
  | {
      kind: "value";
      target: ValueTarget;
      selector?: string;
      operation: ValueOperation;
      value: number;
      scale: "flat" | "per-level";
      bonusType?: BonusType;
      label?: string;
    }
  | {
      kind: "derived";
      target: ValueTarget;
      selector?: string;
      from: ValueTarget;
      fromSelector?: string;
      multiplier: number;
      offset: number;
      label?: string;
    }
  | {
      kind: "proficiency-rule";
      proficiencyId: string;
      operation: "set" | "at-least" | "increase";
      rank?: ProficiencyRank;
      steps?: number;
    }
  | {
      kind: "grant";
      grantType: "feat" | "feature" | "spell" | "item" | "language" | "choice" | "action";
      id: string;
      quantity: number;
    }
  | {
      kind: "resource-rule";
      resourceId: string;
      operation: "set" | "add" | "minimum" | "maximum";
      value: number;
      capacity?: number;
      refresh?: "never" | "encounter" | "hour" | "day" | "week";
    }
  | {
      kind: "movement";
      movementType: "land" | "climb" | "swim" | "fly" | "other";
      operation: ValueOperation;
      value: number;
      label?: string;
    }
  | {
      kind: "action";
      actionId: string;
      actionType: "action" | "reaction" | "free-action" | "activity";
      actions?: number;
      parameters: Record<string, string | number | boolean>;
    }
  | {
      kind: "attack-rule";
      selector?: string;
      attackModifier?: number;
      damageModifier?: number;
      damageDice?: string;
      damageType?: string;
      weaponTraitId?: string;
      range?: number;
      capacity?: number;
      reload?: number;
      criticalText?: string;
    }
  | {
      kind: "spellcasting-rule";
      tradition: "arcane" | "divine" | "occult" | "primal";
      castingAttribute?: AttributeId;
      operation: "grant-access" | "known-spells" | "prepared-spells" | "repertoire" | "slots";
      spellIds: string[];
      value?: number;
      rank?: number;
    }
  | { kind: "attribute"; attribute: AttributeId; value: number }
  | {
      kind: "modifier";
      target:
        | "armor-class"
        | "class-dc"
        | "spell-dc"
        | "spell-attack"
        | "perception"
        | "initiative"
        | "speed"
        | "hit-points"
        | "skill"
        | "save"
        | "weapon-attack"
        | "weapon-damage";
      selector?: string;
      bonusType: BonusType;
      value: number;
      label?: string;
    }
  | { kind: "proficiency"; proficiencyId: string; rank: ProficiencyRank }
  | { kind: "hit-points"; perLevel: number }
  | { kind: "speed"; value: number }
  | { kind: "perception"; rank?: ProficiencyRank; bonus?: number }
  | { kind: "save"; save: SaveId; rank?: ProficiencyRank; bonus?: number }
  | { kind: "skill-training"; skillId: string; rank: ProficiencyRank }
  | { kind: "weapon-proficiency"; categoryId: string; rank: ProficiencyRank }
  | { kind: "armor-proficiency"; categoryId: string; rank: ProficiencyRank }
  | { kind: "grant-feat"; featId: string }
  | { kind: "grant-feature"; featureId: string }
  | {
      kind: "spell-access";
      tradition: "arcane" | "divine" | "occult" | "primal";
      spellIds: string[];
    }
  | { kind: "resource"; resourceId: string; delta: number }
  | { kind: "unlock-choice"; choiceId: string }
  | { kind: "conditional"; when: PredicateNode; effects: EffectNode[] }
  | {
      kind: "text";
      text: string;
      machineReadable: false;
      classification:
        | "fully-structured"
        | "partially-structured"
        | "display-only"
        | "requires-rules-decision"
        | "obsolete"
        | "duplicate";
      decisionId?: string;
    };

export type CharacterState = CharacterBuild;

export interface BreakdownEntry {
  sourceId: string;
  label: string;
  value: number;
  kind:
    | "base"
    | "attribute"
    | "level"
    | "proficiency"
    | "item"
    | "status"
    | "circumstance"
    | "untyped"
    | "rule";
}

export interface ExplainedValue {
  value: number;
  breakdown: BreakdownEntry[];
}

export interface RequirementFailure {
  code: string;
  message: string;
  expected?: string | number | boolean;
  actual?: string | number | boolean;
  predicate: PredicateNode;
}

export interface PredicateResult {
  met: boolean;
  failures: RequirementFailure[];
}

export interface BuildIssue {
  code: string;
  state: Exclude<ValidationState, "valid">;
  message: string;
  entityId?: string;
  choiceId?: string;
  failures?: RequirementFailure[];
}

export interface ChoiceOption {
  entity: ContentEntity;
  status: "available" | "selected" | "locked" | "invalid" | "blocked";
  failures: RequirementFailure[];
}

export interface ResolvedChoice {
  choiceId: string;
  name: string;
  level: number;
  min: number;
  max: number;
  selectedIds: string[];
  options: ChoiceOption[];
  state: ValidationState;
}

export interface EngineContext {
  catalog: Catalog;
  entities: Map<string, ContentEntity>;
  character: CharacterState;
  attributes: Record<AttributeId, number>;
  proficiencyRanks: Map<string, ProficiencyRank>;
  featIds: Set<string>;
  featureIds: Set<string>;
  traitIds: Set<string>;
  spellIds: Set<string>;
  traditions: Set<string>;
  inventoryIds: Set<string>;
  equippedItemIds: Set<string>;
  selectedOptionIds: Set<string>;
  characterOptions: Map<string, string | number | boolean>;
  resources: Map<string, number>;
}

export interface CalculatedCharacter {
  state: ValidationState;
  status: ValidationState;
  catalogHash: string;
  name: string;
  level: number;
  identity: {
    name: string;
    level: number;
    ancestryId?: string;
    heritageId?: string;
    backgroundId?: string;
    classId?: string;
  };
  expectedAttributeBoosts: number;
  sectionStatuses: Record<string, SectionState>;
  attributes: Record<AttributeId, ExplainedValue>;
  hitPoints: ExplainedValue;
  armorClass: ExplainedValue;
  perception: ExplainedValue;
  initiative: ExplainedValue;
  saves: Record<SaveId, ExplainedValue>;
  skills: Record<string, ExplainedValue>;
  classDc?: ExplainedValue;
  spellDc?: ExplainedValue;
  spellAttack?: ExplainedValue;
  spellSlots: Array<{ rank: number; slots: ExplainedValue }>;
  weaponAttacks: Record<
    string,
    {
      attack: ExplainedValue;
      damage: { dice: string; flat: ExplainedValue; type: string };
      range?: { increment: number; maximum: number } | number;
      capacity?: number;
      reload?: number;
      traits: string[];
    }
  >;
  speed: ExplainedValue;
  movement: Record<string, ExplainedValue>;
  temporaryHitPoints: ExplainedValue;
  bulk: ExplainedValue;
  languages: string[];
  traits: string[];
  featIds: string[];
  featureIds: string[];
  spellIds: string[];
  inventoryIds: string[];
  inventory: Array<{ id: string; equipped: boolean; known: boolean }>;
  proficiencies: Record<string, ProficiencyRank>;
  grants: {
    featIds: string[];
    featureIds: string[];
    spellIds: string[];
    itemIds: string[];
    languageIds: string[];
    actionIds: string[];
    choiceIds: string[];
  };
  actions: Array<{
    id: string;
    sourceId: string;
    type: "action" | "reaction" | "free-action" | "activity";
    actions?: number;
    parameters: Record<string, string | number | boolean>;
  }>;
  spells: {
    traditions: string[];
    knownIds: string[];
    slots: Array<{ rank: number; slots: ExplainedValue }>;
    rules: Array<{
      sourceId: string;
      tradition: string;
      operation: string;
      rank?: number;
      value?: number;
    }>;
  };
  explanations: Array<{ key: string; value: ExplainedValue }>;
  resources: Record<string, ExplainedValue>;
  session: {
    currentHp: number;
    temporaryHp: number;
    conditions: CharacterSessionState["conditions"];
    resources: Record<
      string,
      {
        current: number;
        maximum: number;
        recovery: CharacterSessionState["resources"][string]["recovery"];
        sourceId?: string;
        orphaned: boolean;
      }
    >;
    spellSlotUsage: Record<string, number>;
    itemStates: CharacterSessionState["itemStates"];
    actionUses: Record<string, number>;
    manualModifiers: CharacterSessionState["manualModifiers"];
    orphanedEntries: Array<{
      kind: "condition" | "resource" | "spell-slot" | "action" | "item" | "modifier";
      id: string;
      reason: string;
    }>;
  };
  choices: ResolvedChoice[];
  issues: BuildIssue[];
  ignoredTextEffects: Array<{ sourceId: string; text: string }>;
}

export interface EngineOptions {
  includeLegacyTextWarnings?: boolean;
}
