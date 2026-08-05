import type {
  AttributeId,
  BuildIssue,
  EffectNode,
  PredicateNode,
  ProficiencyRank,
  RequirementFailure,
  SaveId,
  ValidationState
} from "@sotc/rules-engine";
import type { ContentEntity } from "@sotc/shared";

type EntityType = ContentEntity["type"];
type ContentStatus = ContentEntity["status"];
type ActionCost = Extract<ContentEntity, { type: "spell" }>["actions"];
type Range = Extract<ContentEntity, { type: "spell" }>["range"];
type ChoiceKind = Extract<ContentEntity, { type: "choice" }>["choice"]["kind"];
type ItemEntity = Extract<ContentEntity, { type: "weapon" | "armor" | "equipment" | "cyberware" }>;
type ItemCategory = ItemEntity["category"];
type ItemSubcategory = ItemEntity["subcategory"];
type TechnologyLevel = ItemEntity["technologyLevel"];
type ItemAvailability = ItemEntity["availability"];
type ItemQuality = NonNullable<ItemEntity["quality"]>;
type ItemOrigin = ItemEntity["origins"][number];

const exhaustiveLabel = <T extends string>(
  labels: Record<T, string>,
  value: T,
  category: string
): string => {
  const label = labels[value];
  if (label !== undefined) {
    return label;
  }
  const message = `Fehlendes deutsches Label für ${category}: ${String(value)}`;
  if (import.meta.env.DEV) {
    console.error(message);
  }
  return "Nicht lokalisierter Wert";
};

export const entityTypeLabels: Record<EntityType, string> = {
  class: "Klasse",
  "class-feature": "Klassenmerkmal",
  ancestry: "Abstammung",
  heritage: "Herkunft",
  background: "Hintergrund",
  skill: "Fertigkeit",
  feat: "Talent",
  spell: "Zauber",
  "spellcasting-progression": "Zauberprogression",
  weapon: "Waffe",
  armor: "Rüstung",
  equipment: "Ausrüstung",
  trait: "Merkmal",
  language: "Sprache",
  proficiency: "Kompetenz",
  choice: "Auswahl",
  effect: "Effekt",
  rule: "Regel",
  condition: "Zustand",
  resource: "Ressource",
  cyberware: "Cyberware",
  creature: "Kreatur",
  "character-build": "Charakter"
};

export const contentStatusLabels: Record<ContentStatus, string> = {
  canonical: "Kanonisch",
  playtest: "Testinhalt",
  legacy: "Aus dem Altbestand",
  draft: "Entwurf"
};

export const attributeLabels: Record<AttributeId, string> = {
  strength: "Stärke",
  dexterity: "Geschicklichkeit",
  constitution: "Konstitution",
  intelligence: "Intelligenz",
  wisdom: "Weisheit",
  charisma: "Charisma"
};

export const proficiencyRankLabels: Record<ProficiencyRank, string> = {
  untrained: "Ungeübt",
  trained: "Geübt",
  expert: "Experte",
  master: "Meister",
  legendary: "Legendär"
};

export const saveLabels: Record<SaveId, string> = {
  fortitude: "Zähigkeit",
  reflex: "Reflex",
  will: "Willen"
};

export const validationStateLabels: Record<ValidationState, string> = {
  valid: "Gültig",
  incomplete: "Offen",
  invalid: "Ungültig",
  blocked: "Blockiert"
};

export const traditionLabels = {
  arcane: "Arkan",
  divine: "Göttlich",
  occult: "Okkult",
  primal: "Naturmagisch"
} as const;

export const itemCategoryLabels: Record<ItemCategory, string> = {
  weapon: "Waffe",
  armor: "Rüstung",
  "protective-clothing": "Schutzkleidung",
  medical: "Medizin",
  tool: "Werkzeug",
  electronics: "Elektronik",
  communication: "Kommunikation",
  surveillance: "Überwachung",
  "magical-item": "Magischer Gegenstand",
  vehicle: "Fahrzeug",
  everyday: "Alltagsgegenstand",
  service: "Dienstleistung",
  cyberware: "Cyberware"
};

export const itemSubcategoryLabels: Record<ItemSubcategory, string> = {
  "melee-weapon": "Nahkampfwaffe",
  "ranged-weapon": "Fernkampfwaffe",
  firearm: "Schusswaffe",
  "energy-weapon": "Energiewaffe",
  "thrown-weapon": "Wurfwaffe",
  "magical-weapon": "Magische Waffe",
  "light-armor": "Leichte Rüstung",
  "medium-armor": "Mittelschwere Rüstung",
  "heavy-armor": "Schwere Rüstung",
  "camouflage-clothing": "Tarnkleidung",
  "environmental-suit": "Umweltanzug",
  "magical-protection": "Magischer Schutz",
  clothing: "Kleidung",
  "medical-supply": "Medizinischer Bedarf",
  "crafting-material": "Handwerksmaterial",
  computer: "Computer",
  sensor: "Sensor",
  "communication-device": "Kommunikationsgerät",
  "surveillance-device": "Überwachungsgerät",
  "ritual-tool": "Ritualwerkzeug",
  "arcane-focus": "Arkaner Fokus",
  vehicle: "Fahrzeug",
  "transit-service": "Verkehrsdienst",
  "protective-suit": "Schutzanzug",
  implant: "Implantat",
  "neural-interface": "Neuralschnittstelle",
  prosthetic: "Prothese",
  bioware: "Bioware"
};

export const technologyLevelLabels: Record<TechnologyLevel, string> = {
  archaic: "Archaisch",
  conventional: "Konventionell",
  "low-tech": "Low-Tech",
  "high-tech": "High-Tech",
  experimental: "Experimentell",
  biotech: "Biotechnologisch",
  arcane: "Arkan",
  magitech: "Arkanotechnisch"
};

export const itemAvailabilityLabels: Record<ItemAvailability, string> = {
  common: "Frei verfügbar",
  registered: "Registrierungspflichtig",
  licensed: "Lizenzpflichtig",
  restricted: "Eingeschränkt",
  military: "Militärisch kontrolliert",
  illegal: "Illegal",
  "black-market": "Schwarzmarkt",
  unique: "Einzigartig"
};

export const itemQualityLabels: Record<ItemQuality, string> = {
  improvised: "Improvisiert",
  poor: "Minderwertig",
  standard: "Standard",
  professional: "Professionell",
  premium: "Premium",
  military: "Militärqualität",
  prototype: "Prototyp",
  masterwork: "Meisterarbeit"
};

export const itemOriginLabels: Record<ItemOrigin, string> = {
  civilian: "Zivil",
  industrial: "Industrie",
  medical: "Medizin",
  corporate: "Konzern",
  governmental: "Behörde",
  military: "Militär",
  criminal: "Kriminell",
  street: "Straße",
  occult: "Okkult",
  otherworldly: "Andersweltlich"
};

const damageTypeLabels: Record<string, string> = {
  "damage.bludgeoning": "Wuchtschaden",
  "damage.piercing": "Stichschaden"
};

export const formatEntityType = (type: EntityType): string =>
  exhaustiveLabel(entityTypeLabels, type, "Entitätstyp");

export const formatContentStatus = (status: ContentStatus): string =>
  exhaustiveLabel(contentStatusLabels, status, "Inhaltsstatus");

export const formatAttribute = (attribute: AttributeId): string =>
  exhaustiveLabel(attributeLabels, attribute, "Attribut");

export const formatProficiencyRank = (rank: ProficiencyRank): string =>
  exhaustiveLabel(proficiencyRankLabels, rank, "Kompetenzrang");

export const formatSave = (save: SaveId): string =>
  exhaustiveLabel(saveLabels, save, "Rettungswurf");

export const formatTradition = (tradition: keyof typeof traditionLabels): string =>
  exhaustiveLabel(traditionLabels, tradition, "Zaubertradition");

export const formatItemCategory = (value: ItemCategory): string =>
  exhaustiveLabel(itemCategoryLabels, value, "Gegenstandskategorie");

export const formatItemSubcategory = (value: ItemSubcategory): string =>
  exhaustiveLabel(itemSubcategoryLabels, value, "Gegenstandsunterkategorie");

export const formatTechnologyLevel = (value: TechnologyLevel): string =>
  exhaustiveLabel(technologyLevelLabels, value, "Technologieniveau");

export const formatItemAvailability = (value: ItemAvailability): string =>
  exhaustiveLabel(itemAvailabilityLabels, value, "Verfügbarkeit");

export const formatItemQuality = (value: ItemQuality): string =>
  exhaustiveLabel(itemQualityLabels, value, "Qualität");

export const formatItemOrigin = (value: ItemOrigin): string =>
  exhaustiveLabel(itemOriginLabels, value, "Herkunft");

export const formatDamageType = (value: string): string =>
  damageTypeLabels[value] ?? "Nicht lokalisierte Schadensart";

export const formatActionCost = (actions: ActionCost): string => {
  if (actions.kind === "fixed") {
    return actions.value === 1 ? "1 Aktion" : `${String(actions.value)} Aktionen`;
  }
  if (actions.kind === "variable") {
    return `${String(actions.min)} bis ${String(actions.max)} Aktionen`;
  }
  return exhaustiveLabel(
    {
      reaction: "Reaktion",
      free: "Freie Aktion",
      passive: "Passiv",
      exploration: "Erkundungsaktivität",
      downtime: "Auszeitaktivität"
    },
    actions.kind,
    "Aktionsart"
  );
};

export const formatRange = (range: Range): string => {
  if (range.kind === "self") {
    return "Selbst";
  }
  if (range.kind === "touch") {
    return "Berührung";
  }
  return `${String(range.value)} ${range.unit === "feet" ? "Fuß" : "Meilen"}`;
};

export const formatChoiceType = (kind: ChoiceKind): string =>
  exhaustiveLabel(
    {
      "attribute-boost": "Attributsverbesserung",
      skill: "Fertigkeitsauswahl",
      feat: "Talentauswahl",
      spell: "Zauberauswahl",
      language: "Sprachauswahl",
      specialization: "Spezialisierung",
      "class-option": "Klassenoption",
      "background-option": "Hintergrundoption",
      equipment: "Ausrüstungsauswahl",
      generic: "Allgemeine Auswahl"
    },
    kind,
    "Auswahlart"
  );

export const formatEntityReference = (
  id: string,
  resolveName: (id: string) => string | undefined
): string => {
  const name = resolveName(id);
  if (name !== undefined) {
    return name;
  }
  if (import.meta.env.DEV) {
    console.error(`Unbekannte Entitätsreferenz: ${id}`);
  }
  return "Unbekannter Katalogeintrag";
};

export const formatPrerequisite = (
  prerequisite: PredicateNode,
  resolveName: (id: string) => string | undefined
): string => {
  if ("all" in prerequisite) {
    return prerequisite.all.map((entry) => formatPrerequisite(entry, resolveName)).join(" und ");
  }
  if ("any" in prerequisite) {
    return prerequisite.any.map((entry) => formatPrerequisite(entry, resolveName)).join(" oder ");
  }
  if ("not" in prerequisite) {
    return `Nicht: ${formatPrerequisite(prerequisite.not, resolveName)}`;
  }
  if ("characterLevel" in prerequisite) {
    const bounds = [
      prerequisite.characterLevel.gte === undefined
        ? undefined
        : `mindestens Stufe ${String(prerequisite.characterLevel.gte)}`,
      prerequisite.characterLevel.lte === undefined
        ? undefined
        : `höchstens Stufe ${String(prerequisite.characterLevel.lte)}`
    ].filter((value): value is string => value !== undefined);
    return bounds.join(" und ");
  }
  if ("attribute" in prerequisite) {
    const bounds = [
      prerequisite.attribute.gte === undefined
        ? undefined
        : `mindestens ${String(prerequisite.attribute.gte)}`,
      prerequisite.attribute.lte === undefined
        ? undefined
        : `höchstens ${String(prerequisite.attribute.lte)}`
    ].filter((value): value is string => value !== undefined);
    return `${formatAttribute(prerequisite.attribute.id)} ${bounds.join(" und ")}`;
  }
  if ("proficiency" in prerequisite) {
    return `${formatEntityReference(prerequisite.proficiency.id, resolveName)} mindestens ${formatProficiencyRank(prerequisite.proficiency.rankAtLeast)}`;
  }
  if ("class" in prerequisite) {
    return `Klasse ${formatEntityReference(prerequisite.class.id, resolveName)}`;
  }
  if ("ancestry" in prerequisite) {
    return `Abstammung ${formatEntityReference(prerequisite.ancestry.id, resolveName)}`;
  }
  if ("heritage" in prerequisite) {
    return `Herkunft ${formatEntityReference(prerequisite.heritage.id, resolveName)}`;
  }
  if ("background" in prerequisite) {
    return `Hintergrund ${formatEntityReference(prerequisite.background.id, resolveName)}`;
  }
  if ("hasTrait" in prerequisite) {
    return `Merkmal ${formatEntityReference(prerequisite.hasTrait.id, resolveName)}`;
  }
  if ("hasFeat" in prerequisite) {
    return `Talent ${formatEntityReference(prerequisite.hasFeat.id, resolveName)}`;
  }
  if ("hasFeature" in prerequisite) {
    return `Merkmal ${formatEntityReference(prerequisite.hasFeature.id, resolveName)}`;
  }
  if ("spellTradition" in prerequisite) {
    return `Zaubertradition ${formatTradition(prerequisite.spellTradition.id)}`;
  }
  if ("knowsSpell" in prerequisite) {
    return `Kennt ${formatEntityReference(prerequisite.knowsSpell.id, resolveName)}`;
  }
  if ("hasItem" in prerequisite) {
    return `Besitzt ${formatEntityReference(prerequisite.hasItem.id, resolveName)}`;
  }
  if ("equippedItem" in prerequisite) {
    return `Ausgerüstet: ${formatEntityReference(prerequisite.equippedItem.id, resolveName)}`;
  }
  if ("itemTrait" in prerequisite) {
    return `Gegenstandsmerkmal ${formatEntityReference(prerequisite.itemTrait.id, resolveName)}`;
  }
  if ("weaponCategory" in prerequisite) {
    return `Waffenkategorie ${formatEntityReference(prerequisite.weaponCategory.id, resolveName)}`;
  }
  if ("armorCategory" in prerequisite) {
    return `Rüstungskategorie ${formatEntityReference(prerequisite.armorCategory.id, resolveName)}`;
  }
  if ("previousChoice" in prerequisite) {
    return `Frühere Auswahl ${formatEntityReference(prerequisite.previousChoice.choiceId, resolveName)}${
      prerequisite.previousChoice.optionId === undefined
        ? ""
        : `: ${formatEntityReference(prerequisite.previousChoice.optionId, resolveName)}`
    }`;
  }
  if ("characterOption" in prerequisite) {
    return `Charakteroption ${prerequisite.characterOption.key} = ${String(
      prerequisite.characterOption.value
    )}`;
  }
  return `${formatEntityReference(prerequisite.resource.id, resolveName)} mindestens ${String(prerequisite.resource.gte)}`;
};

const bonusTypeLabels = {
  status: "Statusbonus",
  circumstance: "Umstandsbonus",
  item: "Gegenstandsbonus",
  untyped: "untypisierter Bonus"
} as const;

const targetLabels: Record<Extract<EffectNode, { kind: "modifier" }>["target"], string> = {
  "armor-class": "Rüstungsklasse",
  "class-dc": "Klassen-SG",
  "spell-dc": "Zauber-SG",
  "spell-attack": "Zauberangriff",
  perception: "Wahrnehmung",
  initiative: "Initiative",
  speed: "Bewegung",
  "hit-points": "Trefferpunkte",
  skill: "Fertigkeit",
  save: "Rettungswurf",
  "weapon-attack": "Waffenangriff",
  "weapon-damage": "Waffenschaden"
};

export const formatEffect = (
  effect: EffectNode,
  resolveName: (id: string) => string | undefined
): string => {
  switch (effect.kind) {
    case "value":
      return `${effect.target}${effect.selector === undefined ? "" : ` (${formatEntityReference(effect.selector, resolveName)})`}: ${effect.operation} ${String(effect.value)}`;
    case "derived":
      return `${effect.target} aus ${effect.from} × ${String(effect.multiplier)} ${effect.offset >= 0 ? "+" : ""}${String(effect.offset)}`;
    case "proficiency-rule":
      return `${formatEntityReference(effect.proficiencyId, resolveName)}: ${effect.operation}${
        effect.rank === undefined ? "" : ` ${formatProficiencyRank(effect.rank)}`
      }${effect.steps === undefined ? "" : ` ${String(effect.steps)} Stufe(n)`}`;
    case "grant":
      return `Gewährt ${formatEntityReference(effect.id, resolveName)}`;
    case "resource-rule":
      return `${formatEntityReference(effect.resourceId, resolveName)}: ${effect.operation} ${String(effect.value)}`;
    case "movement":
      return `${effect.movementType}: ${effect.operation} ${String(effect.value)} Fuß`;
    case "action":
      return `Gewährt ${effect.actionType} ${formatEntityReference(effect.actionId, resolveName)}`;
    case "attack-rule":
      return `Angriffsregel${effect.selector === undefined ? "" : ` für ${formatEntityReference(effect.selector, resolveName)}`}`;
    case "spellcasting-rule":
      return `${formatTradition(effect.tradition)}: ${effect.operation}`;
    case "attribute":
      return `${formatAttribute(effect.attribute)} ${effect.value >= 0 ? "+" : ""}${String(effect.value)}`;
    case "modifier":
      return `${targetLabels[effect.target]}: ${effect.value >= 0 ? "+" : ""}${String(effect.value)} ${bonusTypeLabels[effect.bonusType]}`;
    case "proficiency":
      return `${formatEntityReference(effect.proficiencyId, resolveName)} auf ${formatProficiencyRank(effect.rank)}`;
    case "hit-points":
      return `${String(effect.perLevel)} Trefferpunkte pro Stufe`;
    case "speed":
      return `Bewegung ${String(effect.value)} Fuß`;
    case "perception":
      return `Wahrnehmung${effect.rank === undefined ? "" : ` ${formatProficiencyRank(effect.rank)}`}${effect.bonus === undefined ? "" : ` ${effect.bonus >= 0 ? "+" : ""}${String(effect.bonus)}`}`;
    case "save":
      return `${formatSave(effect.save)}${effect.rank === undefined ? "" : ` ${formatProficiencyRank(effect.rank)}`}${effect.bonus === undefined ? "" : ` ${effect.bonus >= 0 ? "+" : ""}${String(effect.bonus)}`}`;
    case "skill-training":
      return `${formatEntityReference(effect.skillId, resolveName)}: ${formatProficiencyRank(effect.rank)}`;
    case "weapon-proficiency":
    case "armor-proficiency":
      return `${formatEntityReference(effect.categoryId, resolveName)}: ${formatProficiencyRank(effect.rank)}`;
    case "grant-feat":
      return `Gewährt ${formatEntityReference(effect.featId, resolveName)}`;
    case "grant-feature":
      return `Gewährt ${formatEntityReference(effect.featureId, resolveName)}`;
    case "spell-access":
      return `Zugriff auf ${formatTradition(effect.tradition)}${effect.spellIds.length === 0 ? "" : `: ${effect.spellIds.map((id) => formatEntityReference(id, resolveName)).join(", ")}`}`;
    case "resource":
      return `${formatEntityReference(effect.resourceId, resolveName)} ${effect.delta >= 0 ? "+" : ""}${String(effect.delta)}`;
    case "unlock-choice":
      return `Schaltet ${formatEntityReference(effect.choiceId, resolveName)} frei`;
    case "conditional":
      return `Wenn ${formatPrerequisite(effect.when, resolveName)}: ${effect.effects.map((nested) => formatEffect(nested, resolveName)).join("; ")}`;
    case "text":
      return effect.text;
  }
};

const replaceReferences = (text: string, resolveName: (id: string) => string | undefined): string =>
  text.replace(/[a-z][a-z0-9]*(?:[.-][a-z0-9]+)+/g, (id) => formatEntityReference(id, resolveName));

export const formatRequirementFailure = (
  failure: RequirementFailure,
  resolveName: (id: string) => string | undefined
): string =>
  `Benötigt ${formatPrerequisite(failure.predicate, resolveName)}${
    failure.actual === undefined ? "" : `; aktuell ${String(failure.actual)}`
  }.`;

export const formatValidationIssue = (
  issue: BuildIssue,
  resolveName: (id: string) => string | undefined
): string => {
  if (issue.code === "CATALOG_HASH_MISMATCH") {
    return "Der gespeicherte Charakter verwendet einen anderen Katalogstand.";
  }
  if (issue.code === "UNKNOWN_SELECTION") {
    return "Eine gespeicherte Auswahl ist im aktuellen Katalog nicht bekannt.";
  }
  return replaceReferences(issue.message, resolveName);
};
