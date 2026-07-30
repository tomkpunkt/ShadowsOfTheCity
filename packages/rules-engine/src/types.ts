import type { Catalog, ContentEntity } from "@sotc/shared";

export type AttributeId =
  "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";

export type SaveId = "fortitude" | "reflex" | "will";
export type ProficiencyRank = "untrained" | "trained" | "expert" | "master" | "legendary";
export type BonusType = "status" | "circumstance" | "item" | "untyped";
export type ValidationState = "valid" | "incomplete" | "invalid" | "blocked";

export type PredicateNode =
  | { all: PredicateNode[] }
  | { any: PredicateNode[] }
  | { not: PredicateNode }
  | { characterLevel: { gte: number } }
  | { attribute: { id: AttributeId; gte: number } }
  | { proficiency: { id: string; rankAtLeast: ProficiencyRank } }
  | { class: { id: string } }
  | { ancestry: { id: string } }
  | { background: { id: string } }
  | { hasTrait: { id: string } }
  | { hasFeat: { id: string } }
  | { hasFeature: { id: string } }
  | { spellTradition: { id: "arcane" | "divine" | "occult" | "primal" } }
  | { knowsSpell: { id: string } }
  | { hasItem: { id: string } }
  | { resource: { id: string; gte: number } };

export type EffectNode =
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
  | { kind: "text"; text: string; machineReadable: false };

export interface CharacterState {
  formatVersion: 1;
  catalogHash: string;
  name: string;
  level: number;
  ancestryId?: string;
  heritageId?: string;
  backgroundId?: string;
  classId?: string;
  choices: Record<string, string[]>;
  attributeBoosts: AttributeId[];
  inventoryIds: string[];
  notes?: string;
  migrations?: Array<{
    fromCatalogHash: string;
    toCatalogHash: string;
    migratedAt: string;
    conflicts: string[];
  }>;
}

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
  expected?: string | number;
  actual?: string | number;
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
  status: "available" | "selected" | "locked" | "invalid";
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
  resources: Map<string, number>;
}

export interface CalculatedCharacter {
  state: ValidationState;
  catalogHash: string;
  name: string;
  level: number;
  attributes: Record<AttributeId, ExplainedValue>;
  hitPoints: ExplainedValue;
  armorClass: ExplainedValue;
  perception: ExplainedValue;
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
      damage: { dice: string; flat: ExplainedValue };
    }
  >;
  speed: ExplainedValue;
  bulk: ExplainedValue;
  languages: string[];
  traits: string[];
  featIds: string[];
  featureIds: string[];
  spellIds: string[];
  inventoryIds: string[];
  resources: Record<string, ExplainedValue>;
  choices: ResolvedChoice[];
  issues: BuildIssue[];
  ignoredTextEffects: Array<{ sourceId: string; text: string }>;
}

export interface EngineOptions {
  includeLegacyTextWarnings?: boolean;
}
