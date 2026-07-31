import { z } from "zod";

export const SCHEMA_VERSION = 1 as const;
export const CHARACTER_FORMAT_VERSION = 3 as const;
export const SESSION_STATE_VERSION = 1 as const;
export const APP_VERSION = "0.1.0" as const;

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

const boundedNumberPredicate = <T extends z.ZodRawShape>(shape: T) =>
  z
    .object(shape)
    .strict()
    .superRefine((value, context) => {
      if (!("gte" in value) && !("lte" in value)) {
        context.addIssue({
          code: "custom",
          message: "At least one of gte or lte is required"
        });
      }
      if (
        "gte" in value &&
        "lte" in value &&
        typeof value.gte === "number" &&
        typeof value.lte === "number" &&
        value.gte > value.lte
      ) {
        context.addIssue({
          code: "custom",
          message: "gte cannot exceed lte"
        });
      }
    });

export const PredicateSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.object({ all: z.array(PredicateSchema).min(1) }).strict(),
    z.object({ any: z.array(PredicateSchema).min(1) }).strict(),
    z.object({ not: PredicateSchema }).strict(),
    z
      .object({
        characterLevel: boundedNumberPredicate({
          gte: z.number().int().min(1).max(20).optional(),
          lte: z.number().int().min(1).max(20).optional()
        })
      })
      .strict(),
    z
      .object({
        attribute: boundedNumberPredicate({
          id: AttributeIdSchema,
          gte: z.number().int().min(1).max(30).optional(),
          lte: z.number().int().min(1).max(30).optional()
        })
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
    z.object({ heritage: z.object({ id: EntityIdSchema }).strict() }).strict(),
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
    z.object({ equippedItem: z.object({ id: EntityIdSchema }).strict() }).strict(),
    z.object({ itemTrait: z.object({ id: EntityIdSchema }).strict() }).strict(),
    z.object({ weaponCategory: z.object({ id: EntityIdSchema }).strict() }).strict(),
    z.object({ armorCategory: z.object({ id: EntityIdSchema }).strict() }).strict(),
    z
      .object({
        previousChoice: z
          .object({
            choiceId: EntityIdSchema,
            optionId: EntityIdSchema.optional()
          })
          .strict()
      })
      .strict(),
    z
      .object({
        characterOption: z
          .object({
            key: EntityIdSchema,
            value: z.union([z.string(), z.number(), z.boolean()])
          })
          .strict()
      })
      .strict(),
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

export const RuleAutomationSchema = z.enum([
  "fully-structured",
  "partially-structured",
  "display-only",
  "requires-rules-decision",
  "obsolete",
  "duplicate"
]);

export const ValueOperationSchema = z.enum(["set", "add", "minimum", "maximum", "replace"]);

const ValueTargetSchema = z.enum([
  ...ModifierTargetSchema.options,
  "attribute-score",
  "temporary-hit-points",
  "bulk",
  "resource",
  "spell-slot"
]);

const StructuredValueEffectSchema = z
  .object({
    kind: z.literal("value"),
    target: ValueTargetSchema,
    selector: EntityIdSchema.optional(),
    operation: ValueOperationSchema,
    value: z.number(),
    scale: z.enum(["flat", "per-level"]).default("flat"),
    bonusType: BonusTypeSchema.optional(),
    label: z.string().min(1).optional()
  })
  .strict();

const DerivedValueEffectSchema = z
  .object({
    kind: z.literal("derived"),
    target: ValueTargetSchema,
    selector: EntityIdSchema.optional(),
    from: ValueTargetSchema,
    fromSelector: EntityIdSchema.optional(),
    multiplier: z.number().default(1),
    offset: z.number().default(0),
    label: z.string().min(1).optional()
  })
  .strict();

const StructuredProficiencyEffectSchema = z
  .object({
    kind: z.literal("proficiency-rule"),
    proficiencyId: EntityIdSchema,
    operation: z.enum(["set", "at-least", "increase"]),
    rank: ProficiencyRankSchema.optional(),
    steps: z.number().int().min(1).max(4).optional()
  })
  .strict()
  .superRefine((effect, context) => {
    if (effect.operation === "increase" && effect.steps === undefined) {
      context.addIssue({
        code: "custom",
        path: ["steps"],
        message: "increase requires steps"
      });
    }
    if (effect.operation !== "increase" && effect.rank === undefined) {
      context.addIssue({
        code: "custom",
        path: ["rank"],
        message: `${effect.operation} requires rank`
      });
    }
  });

const GrantEffectSchema = z
  .object({
    kind: z.literal("grant"),
    grantType: z.enum(["feat", "feature", "spell", "item", "language", "choice", "action"]),
    id: EntityIdSchema,
    quantity: z.number().int().positive().default(1)
  })
  .strict();

const ResourceRuleEffectSchema = z
  .object({
    kind: z.literal("resource-rule"),
    resourceId: EntityIdSchema,
    operation: z.enum(["set", "add", "minimum", "maximum"]),
    value: z.number(),
    capacity: z.number().nonnegative().optional(),
    refresh: z.enum(["never", "encounter", "hour", "day", "week"]).optional()
  })
  .strict();

const MovementEffectSchema = z
  .object({
    kind: z.literal("movement"),
    movementType: z.enum(["land", "climb", "swim", "fly", "other"]),
    operation: ValueOperationSchema,
    value: z.number().nonnegative(),
    label: z.string().min(1).optional()
  })
  .strict();

const ActionGrantEffectSchema = z
  .object({
    kind: z.literal("action"),
    actionId: EntityIdSchema,
    actionType: z.enum(["action", "reaction", "free-action", "activity"]),
    actions: z.number().int().min(1).max(3).optional(),
    parameters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({})
  })
  .strict()
  .superRefine((effect, context) => {
    if (effect.actionType === "activity" && effect.actions === undefined) {
      context.addIssue({
        code: "custom",
        path: ["actions"],
        message: "activity requires an action count"
      });
    }
  });

const AttackRuleEffectSchema = z
  .object({
    kind: z.literal("attack-rule"),
    selector: EntityIdSchema.optional(),
    attackModifier: z.number().optional(),
    damageModifier: z.number().optional(),
    damageDice: z
      .string()
      .regex(/^\d+d(?:4|6|8|10|12)$/)
      .optional(),
    damageType: EntityIdSchema.optional(),
    weaponTraitId: EntityIdSchema.optional(),
    range: z.number().positive().optional(),
    capacity: z.number().int().positive().optional(),
    reload: z.number().int().min(0).optional(),
    criticalText: z.string().min(1).optional()
  })
  .strict();

const SpellcastingRuleEffectSchema = z
  .object({
    kind: z.literal("spellcasting-rule"),
    tradition: SpellTraditionSchema,
    castingAttribute: AttributeIdSchema.optional(),
    operation: z.enum(["grant-access", "known-spells", "prepared-spells", "repertoire", "slots"]),
    spellIds: z.array(EntityIdSchema).default([]),
    value: z.number().int().min(0).optional(),
    rank: z.number().int().min(0).max(10).optional()
  })
  .strict();

export const EffectSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    StructuredValueEffectSchema,
    DerivedValueEffectSchema,
    StructuredProficiencyEffectSchema,
    GrantEffectSchema,
    ResourceRuleEffectSchema,
    MovementEffectSchema,
    ActionGrantEffectSchema,
    AttackRuleEffectSchema,
    SpellcastingRuleEffectSchema,
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
        machineReadable: z.literal(false),
        classification: RuleAutomationSchema.default("display-only"),
        decisionId: EntityIdSchema.optional()
      })
      .strict()
      .superRefine((effect, context) => {
        if (
          effect.classification === "requires-rules-decision" &&
          effect.decisionId === undefined
        ) {
          context.addIssue({
            code: "custom",
            path: ["decisionId"],
            message: "requires-rules-decision requires a decisionId"
          });
        }
      })
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

const CharacterMigrationSchema = z
  .object({
    migrationId: EntityIdSchema,
    fromFormatVersion: z.number().int().min(0),
    toFormatVersion: z.number().int().min(1),
    fromCatalogHash: z.string().optional(),
    toCatalogHash: z.string().optional(),
    conflicts: z.array(z.string()).default([]),
    preservedValues: z.record(z.string(), z.unknown()).default({})
  })
  .strict();

const IsoDateSchema = z.string().datetime({ offset: true });

const SessionEntryIdSchema = z
  .string()
  .regex(/^[a-z0-9][a-z0-9.-]*(?::[a-z0-9-]+)?$/, "Session IDs must use lowercase ASCII segments");

export const CharacterBuildSchema = z
  .object({
    name: z.string(),
    level: z.number().int().min(1).max(20),
    ancestryId: EntityIdSchema.optional(),
    heritageId: EntityIdSchema.optional(),
    backgroundId: EntityIdSchema.optional(),
    classId: EntityIdSchema.optional(),
    choices: z.record(EntityIdSchema, z.array(EntityIdSchema)),
    attributeBoosts: z.array(AttributeIdSchema),
    inventoryIds: z.array(EntityIdSchema),
    options: z.record(EntityIdSchema, z.union([z.string(), z.number(), z.boolean()])).default({}),
    notes: z.string().optional(),
    biography: z
      .object({
        description: z.string().default(""),
        appearance: z.string().default(""),
        personality: z.string().default(""),
        motivation: z.string().default(""),
        relationships: z.string().default(""),
        organizations: z.string().default(""),
        contacts: z.string().default(""),
        goals: z.string().default(""),
        backgroundNotes: z.string().default("")
      })
      .strict()
      .default({
        description: "",
        appearance: "",
        personality: "",
        motivation: "",
        relationships: "",
        organizations: "",
        contacts: "",
        goals: "",
        backgroundNotes: ""
      })
  })
  .strict();

const SessionConditionSchema = z
  .object({
    id: SessionEntryIdSchema,
    conditionId: EntityIdSchema.optional(),
    name: z.string().min(1),
    value: z.number().finite().optional(),
    source: z.string().min(1),
    duration: z.string().optional(),
    startedAt: z.string().optional(),
    note: z.string().optional(),
    active: z.boolean().default(true)
  })
  .strict();

const SessionResourceSchema = z
  .object({
    current: z.number().finite(),
    maximum: z.number().finite().optional(),
    recovery: z.enum(["never", "encounter", "short-rest", "daily", "manual"]).default("manual"),
    sourceId: EntityIdSchema.optional(),
    group: z.string().optional()
  })
  .strict();

const SessionItemStateSchema = z
  .object({
    quantity: z.number().int().min(0).default(1),
    equipped: z.boolean().default(false),
    active: z.boolean().default(false),
    consumed: z.number().int().min(0).default(0),
    ammunition: z.number().int().min(0).optional(),
    location: z.enum(["equipped", "carried", "stowed"]).default("carried"),
    notes: z.string().optional()
  })
  .strict();

const ManualModifierSchema = z
  .object({
    id: SessionEntryIdSchema,
    target: z.enum([
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
      "weapon-damage",
      "attribute-score"
    ]),
    selector: EntityIdSchema.optional(),
    value: z.number().finite(),
    bonusType: z.enum(["status", "circumstance", "item", "untyped"]),
    source: z.string().min(1),
    condition: z.string().optional(),
    duration: z.string().optional(),
    note: z.string().optional(),
    active: z.boolean().default(true)
  })
  .strict();

const SessionNoteSchema = z
  .object({
    id: SessionEntryIdSchema,
    title: z.string().min(1),
    body: z.string(),
    category: z.string().optional(),
    createdAt: IsoDateSchema,
    updatedAt: IsoDateSchema
  })
  .strict();

const HpHistoryEntrySchema = z
  .object({
    id: SessionEntryIdSchema,
    kind: z.enum(["damage", "healing", "temporary-hp", "rest", "undo"]),
    amount: z.number().finite().nonnegative(),
    previousHp: z.number().finite().nonnegative(),
    nextHp: z.number().finite().nonnegative(),
    previousTemporaryHp: z.number().finite().nonnegative(),
    nextTemporaryHp: z.number().finite().nonnegative(),
    source: z.string().optional(),
    createdAt: IsoDateSchema
  })
  .strict();

const SessionLogEntrySchema = z
  .object({
    id: SessionEntryIdSchema,
    kind: z.enum(["resource", "spell-slot", "action-use", "item", "condition", "rest", "note"]),
    label: z.string().min(1),
    detail: z.string().optional(),
    createdAt: IsoDateSchema
  })
  .strict();

const DiceResultSchema = z
  .object({
    id: SessionEntryIdSchema,
    formula: z.string().min(1),
    rolls: z.array(z.number().int()),
    modifier: z.number().finite(),
    total: z.number().finite(),
    source: z.string().optional(),
    createdAt: IsoDateSchema
  })
  .strict();

export const CharacterSessionStateSchema = z
  .object({
    version: z.literal(SESSION_STATE_VERSION),
    currentHp: z.number().finite().nonnegative().nullable().default(null),
    temporaryHp: z.number().finite().nonnegative().default(0),
    conditions: z.array(SessionConditionSchema).default([]),
    resources: z.record(EntityIdSchema, SessionResourceSchema).default({}),
    spellSlotUsage: z
      .record(z.string().regex(/^[1-9][0-9]*$/), z.number().int().min(0))
      .default({}),
    actionUses: z.record(EntityIdSchema, z.number().int().min(0)).default({}),
    itemStates: z.record(EntityIdSchema, SessionItemStateSchema).default({}),
    manualModifiers: z.array(ManualModifierSchema).default([]),
    notes: z.array(SessionNoteSchema).default([]),
    hpHistory: z.array(HpHistoryEntrySchema).max(100).default([]),
    log: z.array(SessionLogEntrySchema).max(250).default([]),
    diceHistory: z.array(DiceResultSchema).max(100).default([]),
    activeView: z
      .enum([
        "overview",
        "combat",
        "actions",
        "skills",
        "features",
        "spells",
        "inventory",
        "resources",
        "biography",
        "export"
      ])
      .default("overview")
  })
  .strict();

export const CharacterDocumentSchema = z
  .object({
    formatVersion: z.literal(CHARACTER_FORMAT_VERSION),
    contentSchemaVersion: z.literal(SCHEMA_VERSION),
    catalogHash: z.string().regex(/^[a-f0-9]{64}$/),
    createdWithVersion: z.string().regex(/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/),
    lastSavedWithVersion: z.string().regex(/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/),
    build: CharacterBuildSchema,
    session: CharacterSessionStateSchema,
    migrations: z.array(CharacterMigrationSchema).default([]),
    legacyValues: z.record(z.string(), z.unknown()).default({})
  })
  .strict();

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

export const EditorialStatusSchema = z.enum([
  "migrated",
  "reviewed",
  "rewritten",
  "needs-rules-decision"
]);

export const TechnologyLevelSchema = z.enum([
  "archaic",
  "conventional",
  "low-tech",
  "high-tech",
  "experimental",
  "biotech",
  "arcane",
  "magitech"
]);

export const ItemAvailabilitySchema = z.enum([
  "common",
  "registered",
  "licensed",
  "restricted",
  "military",
  "illegal",
  "black-market",
  "unique"
]);

export const ItemQualitySchema = z.enum([
  "improvised",
  "poor",
  "standard",
  "professional",
  "premium",
  "military",
  "prototype",
  "masterwork"
]);

export const ItemOriginSchema = z.enum([
  "civilian",
  "industrial",
  "medical",
  "corporate",
  "governmental",
  "military",
  "criminal",
  "street",
  "occult",
  "otherworldly"
]);

const BaseEntityShape = {
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: EntityIdSchema,
  type: EntityTypeSchema,
  name: z.string().min(1),
  source: EntityIdSchema,
  status: ContentStatusSchema,
  summary: z.string().min(20).default("Inhalt aus dem bestehenden Regelwerk."),
  flavorText: z.string().min(20).optional(),
  rulesText: z.string().min(20).default("Regeltext aus dem bestehenden Regelwerk."),
  usageNotes: z.string().min(20).optional(),
  limitations: z.string().min(20).optional(),
  examples: z.array(z.string().min(20)).default([]),
  editorialStatus: EditorialStatusSchema.default("migrated"),
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
  hands: z.number().int().min(0).max(2),
  technologyLevel: TechnologyLevelSchema,
  availability: ItemAvailabilitySchema,
  quality: ItemQualitySchema.optional(),
  origins: z.array(ItemOriginSchema).min(1)
};

const WeaponSchema = BaseEntitySchema.extend({
  type: z.literal("weapon"),
  ...ItemFields,
  category: z.literal("weapon"),
  subcategory: z.enum([
    "melee-weapon",
    "ranged-weapon",
    "firearm",
    "energy-weapon",
    "thrown-weapon",
    "magical-weapon"
  ]),
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
  category: z.enum(["armor", "protective-clothing"]),
  subcategory: z.enum([
    "light-armor",
    "medium-armor",
    "heavy-armor",
    "camouflage-clothing",
    "environmental-suit",
    "magical-protection"
  ]),
  categoryId: EntityIdSchema,
  itemBonus: z.number().int().min(0),
  dexterityCap: z.number().int().min(0)
}).strict();

const EquipmentSchema = BaseEntitySchema.extend({
  type: z.literal("equipment"),
  ...ItemFields,
  category: z.enum([
    "protective-clothing",
    "medical",
    "tool",
    "electronics",
    "communication",
    "surveillance",
    "magical-item",
    "vehicle",
    "everyday",
    "service"
  ]),
  subcategory: z.enum([
    "clothing",
    "medical-supply",
    "crafting-material",
    "computer",
    "sensor",
    "communication-device",
    "surveillance-device",
    "ritual-tool",
    "arcane-focus",
    "vehicle",
    "transit-service",
    "protective-suit"
  ]),
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
  category: z.literal("cyberware"),
  subcategory: z.enum(["implant", "neural-interface", "prosthetic", "bioware"]),
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

const CharacterBuildEntitySchema = BaseEntitySchema.extend({
  type: z.literal("character-build"),
  character: CharacterDocumentSchema
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
  CharacterBuildEntitySchema
]);

export const CatalogSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    contentHash: z.string().regex(/^[a-f0-9]{64}$/),
    aliases: z.record(EntityIdSchema, EntityIdSchema).default({}),
    entities: z.array(ContentEntitySchema)
  })
  .strict();
