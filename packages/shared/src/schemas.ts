import { z } from "zod";

export const SCHEMA_VERSION = 1 as const;

export const EntityIdSchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
    "IDs must use lowercase ASCII segments separated by dots or hyphens"
  );

export const EntityTypeSchema = z.enum([
  "class",
  "class-feature",
  "ancestry",
  "heritage",
  "background",
  "skill",
  "feat",
  "spell",
  "spellcasting-progression",
  "weapon",
  "armor",
  "equipment",
  "trait",
  "language",
  "proficiency",
  "choice",
  "effect",
  "rule",
  "condition",
  "resource",
  "cyberware",
  "creature",
  "character-build"
]);

export const ContentStatusSchema = z.enum(["draft", "playtest", "canonical", "legacy"]);
export const AttributeIdSchema = z.enum([
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma"
]);
export const ProficiencyRankSchema = z.enum([
  "untrained",
  "trained",
  "expert",
  "master",
  "legendary"
]);
export const SaveIdSchema = z.enum(["fortitude", "reflex", "will"]);
export const BonusTypeSchema = z.enum(["status", "circumstance", "item", "untyped"]);
export const SpellTraditionSchema = z.enum(["arcane", "divine", "occult", "primal"]);

export const PredicateSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.object({ all: z.array(PredicateSchema).min(1) }).strict(),
    z.object({ any: z.array(PredicateSchema).min(1) }).strict(),
    z.object({ not: PredicateSchema }).strict(),
    z
      .object({
        characterLevel: z.object({ gte: z.number().int().min(1).max(20) }).strict()
      })
      .strict(),
    z
      .object({
        attribute: z
          .object({
            id: AttributeIdSchema,
            gte: z.number().int().min(1).max(30)
          })
          .strict()
      })
      .strict(),
    z
      .object({
        proficiency: z
          .object({
            id: EntityIdSchema,
            rankAtLeast: ProficiencyRankSchema
          })
          .strict()
      })
      .strict(),
    z.object({ class: z.object({ id: EntityIdSchema }).strict() }).strict(),
    z.object({ ancestry: z.object({ id: EntityIdSchema }).strict() }).strict(),
    z.object({ background: z.object({ id: EntityIdSchema }).strict() }).strict(),
    z.object({ hasTrait: z.object({ id: EntityIdSchema }).strict() }).strict(),
    z.object({ hasFeat: z.object({ id: EntityIdSchema }).strict() }).strict(),
    z.object({ hasFeature: z.object({ id: EntityIdSchema }).strict() }).strict(),
    z
      .object({
        spellTradition: z.object({ id: SpellTraditionSchema }).strict()
      })
      .strict(),
    z.object({ knowsSpell: z.object({ id: EntityIdSchema }).strict() }).strict(),
    z.object({ hasItem: z.object({ id: EntityIdSchema }).strict() }).strict(),
    z
      .object({
        resource: z
          .object({
            id: EntityIdSchema,
            gte: z.number()
          })
          .strict()
      })
      .strict()
  ])
);

const ModifierTargetSchema = z.enum([
  "armor-class",
  "class-dc",
  "spell-dc",
  "spell-attack",
  "perception",
  "initiative",
  "speed",
  "hit-points",
  "skill",
  "save",
  "weapon-attack",
  "weapon-damage"
]);

export const EffectSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z
      .object({
        kind: z.literal("attribute"),
        attribute: AttributeIdSchema,
        value: z.number().int()
      })
      .strict(),
    z
      .object({
        kind: z.literal("modifier"),
        target: ModifierTargetSchema,
        selector: EntityIdSchema.optional(),
        bonusType: BonusTypeSchema,
        value: z.number(),
        label: z.string().min(1).optional()
      })
      .strict(),
    z
      .object({
        kind: z.literal("proficiency"),
        proficiencyId: EntityIdSchema,
        rank: ProficiencyRankSchema
      })
      .strict(),
    z.object({ kind: z.literal("hit-points"), perLevel: z.number().int() }).strict(),
    z.object({ kind: z.literal("speed"), value: z.number().int() }).strict(),
    z
      .object({
        kind: z.literal("perception"),
        rank: ProficiencyRankSchema.optional(),
        bonus: z.number().optional()
      })
      .strict(),
    z
      .object({
        kind: z.literal("save"),
        save: SaveIdSchema,
        rank: ProficiencyRankSchema.optional(),
        bonus: z.number().optional()
      })
      .strict(),
    z
      .object({
        kind: z.literal("skill-training"),
        skillId: EntityIdSchema,
        rank: ProficiencyRankSchema.default("trained")
      })
      .strict(),
    z
      .object({
        kind: z.literal("weapon-proficiency"),
        categoryId: EntityIdSchema,
        rank: ProficiencyRankSchema
      })
      .strict(),
    z
      .object({
        kind: z.literal("armor-proficiency"),
        categoryId: EntityIdSchema,
        rank: ProficiencyRankSchema
      })
      .strict(),
    z.object({ kind: z.literal("grant-feat"), featId: EntityIdSchema }).strict(),
    z.object({ kind: z.literal("grant-feature"), featureId: EntityIdSchema }).strict(),
    z
      .object({
        kind: z.literal("spell-access"),
        tradition: SpellTraditionSchema,
        spellIds: z.array(EntityIdSchema).default([])
      })
      .strict(),
    z
      .object({
        kind: z.literal("resource"),
        resourceId: EntityIdSchema,
        delta: z.number()
      })
      .strict(),
    z.object({ kind: z.literal("unlock-choice"), choiceId: EntityIdSchema }).strict(),
    z
      .object({
        kind: z.literal("conditional"),
        when: PredicateSchema,
        effects: z.array(EffectSchema).min(1)
      })
      .strict(),
    z
      .object({
        kind: z.literal("text"),
        text: z.string().min(1),
        machineReadable: z.literal(false)
      })
      .strict()
  ])
);

export const ChoiceKindSchema = z.enum([
  "attribute-boost",
  "skill",
  "feat",
  "spell",
  "language",
  "specialization",
  "class-option",
  "background-option",
  "equipment",
  "generic"
]);

export const ChoiceSchema = z
  .object({
    id: EntityIdSchema,
    level: z.number().int().min(1).max(20),
    kind: ChoiceKindSchema,
    min: z.number().int().min(0),
    max: z.number().int().min(0),
    filter: z
      .object({
        entityTypes: z.array(EntityTypeSchema).optional(),
        traitsAll: z.array(EntityIdSchema).optional(),
        traitsAny: z.array(EntityIdSchema).optional(),
        classId: EntityIdSchema.optional(),
        ancestryId: EntityIdSchema.optional(),
        category: z.string().optional(),
        traditions: z.array(SpellTraditionSchema).optional(),
        minLevel: z.number().int().min(0).max(20).optional(),
        maxLevel: z.number().int().min(0).max(20).optional()
      })
      .strict()
      .default({}),
    prerequisites: z.array(PredicateSchema).default([]),
    effects: z.array(EffectSchema).default([]),
    excludes: z.array(EntityIdSchema).default([]),
    repeatable: z.boolean().default(false)
  })
  .strict()
  .superRefine((choice, context) => {
    if (choice.min > choice.max) {
      context.addIssue({
        code: "custom",
        message: "Choice min cannot exceed max"
      });
    }
  });

export const ActionCostSchema = z.union([
  z.object({ kind: z.literal("fixed"), value: z.number().int().min(1).max(3) }).strict(),
  z
    .object({
      kind: z.literal("variable"),
      min: z.number().int().min(1).max(3),
      max: z.number().int().min(1).max(3)
    })
    .strict(),
  z.object({ kind: z.enum(["reaction", "free", "passive", "exploration", "downtime"]) }).strict()
]);

const BaseEntityShape = {
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: EntityIdSchema,
  type: EntityTypeSchema,
  name: z.string().min(1),
  source: EntityIdSchema,
  status: ContentStatusSchema,
  description: z.string(),
  traits: z.array(EntityIdSchema).default([]),
  references: z.array(EntityIdSchema).default([]),
  legacy: z
    .object({
      paths: z.array(z.string()).min(1),
      notes: z.array(z.string()).default([])
    })
    .strict()
    .optional()
};

const BaseEntitySchema = z.object(BaseEntityShape);

const InitialProficienciesSchema = z
  .object({
    perception: ProficiencyRankSchema,
    saves: z.record(SaveIdSchema, ProficiencyRankSchema),
    skills: z.record(EntityIdSchema, ProficiencyRankSchema).default({}),
    weapons: z.record(EntityIdSchema, ProficiencyRankSchema).default({}),
    armor: z.record(EntityIdSchema, ProficiencyRankSchema).default({})
  })
  .strict();

const ClassSchema = BaseEntitySchema.extend({
  type: z.literal("class"),
  keyAttributes: z.array(AttributeIdSchema).min(1),
  hpPerLevel: z.number().int().min(1),
  trainedSkillChoices: z.number().int().min(0),
  initialProficiencies: InitialProficienciesSchema,
  featureIds: z.array(EntityIdSchema).default([]),
  choiceIds: z.array(EntityIdSchema).default([]),
  spellcastingProgressionId: EntityIdSchema.optional()
}).strict();

const ClassFeatureSchema = BaseEntitySchema.extend({
  type: z.literal("class-feature"),
  classId: EntityIdSchema,
  level: z.number().int().min(1).max(20),
  actionCost: ActionCostSchema.optional(),
  prerequisites: z.array(PredicateSchema).default([]),
  effects: z.array(EffectSchema).default([]),
  choiceIds: z.array(EntityIdSchema).default([])
}).strict();

const AncestrySchema = BaseEntitySchema.extend({
  type: z.literal("ancestry"),
  hp: z.number().int().min(1),
  size: z.enum(["tiny", "small", "medium", "large"]),
  speed: z.number().int().min(0),
  boosts: z.array(AttributeIdSchema),
  flaws: z.array(AttributeIdSchema).default([]),
  freeBoosts: z.number().int().min(0),
  languageIds: z.array(EntityIdSchema),
  additionalLanguagesFromIntelligence: z.boolean().default(true),
  featureIds: z.array(EntityIdSchema).default([]),
  heritageIds: z.array(EntityIdSchema).default([]),
  featIds: z.array(EntityIdSchema).default([])
}).strict();

const HeritageSchema = BaseEntitySchema.extend({
  type: z.literal("heritage"),
  ancestryId: EntityIdSchema,
  prerequisites: z.array(PredicateSchema).default([]),
  effects: z.array(EffectSchema).default([])
}).strict();

const BackgroundSchema = BaseEntitySchema.extend({
  type: z.literal("background"),
  boosts: z.array(AttributeIdSchema).default([]),
  freeBoosts: z.number().int().min(0).default(1),
  trainedSkillIds: z.array(EntityIdSchema).default([]),
  grantedFeatIds: z.array(EntityIdSchema).default([]),
  choiceIds: z.array(EntityIdSchema).default([]),
  effects: z.array(EffectSchema).default([])
}).strict();

const SkillSchema = BaseEntitySchema.extend({
  type: z.literal("skill"),
  attribute: AttributeIdSchema
}).strict();

const FeatSchema = BaseEntitySchema.extend({
  type: z.literal("feat"),
  category: z.enum(["general", "skill", "class", "ancestry", "archetype", "profession"]),
  level: z.number().int().min(1).max(20),
  classId: EntityIdSchema.optional(),
  ancestryId: EntityIdSchema.optional(),
  actionCost: ActionCostSchema.optional(),
  prerequisites: z.array(PredicateSchema).default([]),
  effects: z.array(EffectSchema).default([])
}).strict();

const RangeSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("self") }).strict(),
  z.object({ kind: z.literal("touch") }).strict(),
  z
    .object({
      kind: z.literal("distance"),
      value: z.number().positive(),
      unit: z.enum(["feet", "miles"])
    })
    .strict()
]);

const SpellSchema = BaseEntitySchema.extend({
  type: z.literal("spell"),
  rank: z.number().int().min(0).max(10),
  traditions: z.array(SpellTraditionSchema).min(1),
  actions: ActionCostSchema,
  range: RangeSchema,
  target: z
    .object({
      kind: z.enum(["self", "creature", "object", "effect", "area", "mixed"]),
      count: z.number().int().positive().optional(),
      text: z.string().optional(),
      area: z
        .object({
          shape: z.enum(["burst", "cone", "emanation", "line"]),
          size: z.number().positive(),
          unit: z.literal("feet")
        })
        .strict()
        .optional()
    })
    .strict(),
  duration: z.string().min(1),
  defense: z
    .object({
      kind: z.enum(["none", "armor-class", "save"]),
      save: SaveIdSchema.optional(),
      basic: z.boolean().optional()
    })
    .strict(),
  effects: z.array(EffectSchema).default([]),
  heightened: z
    .array(z.object({ rank: z.number().int().min(1).max(10), text: z.string() }).strict())
    .default([])
}).strict();

const SpellcastingProgressionSchema = BaseEntitySchema.extend({
  type: z.literal("spellcasting-progression"),
  classId: EntityIdSchema,
  tradition: SpellTraditionSchema,
  mode: z.enum(["prepared", "spontaneous"]),
  castingAttribute: AttributeIdSchema,
  proficiencyByLevel: z.record(z.string(), ProficiencyRankSchema),
  slotsByLevel: z.record(z.string(), z.array(z.number().int().min(0))),
  repertoireByLevel: z.record(z.string(), z.array(z.number().int().min(0))).optional()
}).strict();

const ItemFields = {
  level: z.number().int().min(0).max(30),
  priceGp: z.number().nonnegative(),
  bulk: z.number().nonnegative(),
  hands: z.number().int().min(0).max(2)
};

const WeaponSchema = BaseEntitySchema.extend({
  type: z.literal("weapon"),
  ...ItemFields,
  categoryId: EntityIdSchema,
  groupId: EntityIdSchema,
  damage: z
    .object({
      dice: z.number().int().positive(),
      die: z.enum(["d4", "d6", "d8", "d10", "d12"]),
      type: EntityIdSchema,
      modifier: AttributeIdSchema.optional(),
      flat: z.number().int().default(0)
    })
    .strict(),
  range: z
    .object({
      increment: z.number().int().positive(),
      maximum: z.number().int().positive()
    })
    .strict()
    .optional(),
  capacity: z.number().int().positive().optional()
}).strict();

const ArmorSchema = BaseEntitySchema.extend({
  type: z.literal("armor"),
  ...ItemFields,
  categoryId: EntityIdSchema,
  itemBonus: z.number().int().min(0),
  dexterityCap: z.number().int().min(0)
}).strict();

const EquipmentSchema = BaseEntitySchema.extend({
  type: z.literal("equipment"),
  ...ItemFields,
  categoryId: EntityIdSchema,
  effects: z.array(EffectSchema).default([])
}).strict();

const TraitSchema = BaseEntitySchema.extend({
  type: z.literal("trait"),
  appliesTo: z.array(EntityTypeSchema).default([])
}).strict();

const LanguageSchema = BaseEntitySchema.extend({
  type: z.literal("language"),
  rarity: z.enum(["common", "uncommon", "rare"])
}).strict();

const ProficiencySchema = BaseEntitySchema.extend({
  type: z.literal("proficiency"),
  category: z.enum(["perception", "save", "skill", "weapon", "armor", "class-dc", "spellcasting"]),
  attribute: AttributeIdSchema.optional()
}).strict();

const ChoiceEntitySchema = BaseEntitySchema.extend({
  type: z.literal("choice"),
  choice: ChoiceSchema
}).strict();

const EffectEntitySchema = BaseEntitySchema.extend({
  type: z.literal("effect"),
  effect: EffectSchema
}).strict();

const RuleSchema = BaseEntitySchema.extend({
  type: z.literal("rule"),
  key: EntityIdSchema,
  value: z.union([z.string(), z.number(), z.boolean(), z.record(z.string(), z.unknown())])
}).strict();

const ConditionSchema = BaseEntitySchema.extend({
  type: z.literal("condition"),
  valued: z.boolean().default(false),
  effects: z.array(EffectSchema).default([])
}).strict();

const ResourceSchema = BaseEntitySchema.extend({
  type: z.literal("resource"),
  minimum: z.number(),
  maximum: z.number().optional(),
  refresh: z.enum(["never", "encounter", "hour", "day", "week"]).default("never")
}).strict();

const CyberwareSchema = BaseEntitySchema.extend({
  type: z.literal("cyberware"),
  ...ItemFields,
  slot: z.enum(["head", "eyes", "torso", "arms", "hands", "legs", "skin", "neural"]),
  strain: z.number().nonnegative(),
  effects: z.array(EffectSchema).default([])
}).strict();

const CreatureSchema = BaseEntitySchema.extend({
  type: z.literal("creature"),
  level: z.number().int().min(-1).max(30),
  hp: z.number().int().positive(),
  armorClass: z.number().int().positive(),
  speed: z.number().int().nonnegative(),
  legacySystem: z.enum(["sotc", "dnd5e"]).default("sotc"),
  effects: z.array(EffectSchema).default([])
}).strict();

const CharacterBuildSchema = BaseEntitySchema.extend({
  type: z.literal("character-build"),
  formatVersion: z.literal(1),
  catalogHash: z.string().min(1),
  character: z
    .object({
      name: z.string(),
      level: z.number().int().min(1).max(20),
      ancestryId: EntityIdSchema.optional(),
      heritageId: EntityIdSchema.optional(),
      backgroundId: EntityIdSchema.optional(),
      classId: EntityIdSchema.optional(),
      choices: z.record(EntityIdSchema, z.array(EntityIdSchema)),
      notes: z.string().optional()
    })
    .strict()
}).strict();

export const ContentEntitySchema = z.discriminatedUnion("type", [
  ClassSchema,
  ClassFeatureSchema,
  AncestrySchema,
  HeritageSchema,
  BackgroundSchema,
  SkillSchema,
  FeatSchema,
  SpellSchema,
  SpellcastingProgressionSchema,
  WeaponSchema,
  ArmorSchema,
  EquipmentSchema,
  TraitSchema,
  LanguageSchema,
  ProficiencySchema,
  ChoiceEntitySchema,
  EffectEntitySchema,
  RuleSchema,
  ConditionSchema,
  ResourceSchema,
  CyberwareSchema,
  CreatureSchema,
  CharacterBuildSchema
]);

export const CatalogSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    contentHash: z.string().regex(/^[a-f0-9]{64}$/),
    entities: z.array(ContentEntitySchema)
  })
  .strict();
