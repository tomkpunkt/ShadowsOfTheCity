import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ContentEntitySchema, SCHEMA_VERSION, type ContentEntity } from "@sotc/shared";
import { toString } from "mdast-util-to-string";
import type { Heading, RootContent, Table } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { stringify } from "yaml";

import { stableStringify } from "./compiler.js";

const packageDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(packageDirectory, "../../..");
const contentDirectory = path.join(repositoryRoot, "content");
const sourceId = "legacy.world-rules";

type EntityInput = Record<string, unknown> & {
  id: string;
  type: ContentEntity["type"];
  name: string;
};

interface IndexedHeading {
  depth: number;
  title: string;
  start: number;
  contentStart: number;
  end: number;
  parentTitles: string[];
}

interface IndexedTable {
  rows: string[][];
  parentTitles: string[];
}

interface IndexedDocument {
  relativePath: string;
  source: string;
  headings: IndexedHeading[];
  tables: IndexedTable[];
}

interface ManifestSource {
  path: string;
  entityIds: string[];
  warnings: string[];
  manualFields: string[];
}

interface MigrationManifest {
  schemaVersion: number;
  generatedAt: string;
  sourceCount: number;
  generatedEntityCount: number;
  expectedMinimums: Record<string, number>;
  actualCounts: Record<string, number>;
  sources: ManifestSource[];
  decisions: string[];
}

const normalizePath = (value: string): string => value.split(path.sep).join("/");

const normalizeText = (value: string): string =>
  value.replaceAll("**", "").replaceAll("*", "").replace(/\s+/g, " ").trim();

const deriveSummary = (name: string, markdown: string): string => {
  const prose = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        line !== "---" &&
        !line.startsWith("#") &&
        !line.startsWith("|") &&
        !line.startsWith(">") &&
        !/^\*{0,2}Quelle:/i.test(line)
    )
    .map((line) => normalizeText(line))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  const firstSentence = prose.match(/^.{20,220}?[.!?](?:\s|$)/)?.[0]?.trim();
  const summary = firstSentence ?? prose.slice(0, 220).trim();
  return summary.length >= 20
    ? summary
    : `${name}: ${summary || "Inhalt aus dem bestehenden Regelwerk."}`;
};

const deriveEntitySummary = (input: EntityInput, markdown: string): string => {
  if (input.type === "skill" && typeof input["attribute"] === "string") {
    const attribute = {
      strength: "Stärke",
      dexterity: "Geschicklichkeit",
      constitution: "Konstitution",
      intelligence: "Intelligenz",
      wisdom: "Weisheit",
      charisma: "Charisma"
    }[input["attribute"]];
    return `${input.name} ist eine Fertigkeit mit ${attribute ?? "einem festgelegten Attribut"} als typischem Attribut.`;
  }
  if (input.type === "weapon" && input["damage"] !== null && typeof input["damage"] === "object") {
    const damage = input["damage"] as Record<string, unknown>;
    return `${input.name} ist eine Waffe und verursacht ${String(damage["dice"])}${String(damage["die"])} Schaden.`;
  }
  if (input.type === "armor" && typeof input["itemBonus"] === "number") {
    return `${input.name} gewährt einen Gegenstandsbonus von +${String(input["itemBonus"])} auf die Rüstungsklasse.`;
  }
  if (
    input.type === "equipment" &&
    typeof input["priceGp"] === "number" &&
    typeof input["bulk"] === "number"
  ) {
    return `${input.name} ist Ausrüstung mit einem Preis von ${String(input["priceGp"])} GP und einer Last von ${String(input["bulk"])}.`;
  }
  return deriveSummary(input.name, markdown);
};

const slug = (value: string): string => {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/Ä/g, "Ae")
    .replace(/Ö/g, "Oe")
    .replace(/Ü/g, "Ue")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "unnamed";
};

const nodeStart = (node: RootContent): number => node.position?.start.offset ?? 0;
const nodeEnd = (node: RootContent, source: string): number =>
  node.position?.end.offset ?? source.length;

const indexDocument = (relativePath: string, source: string): IndexedDocument => {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(source);
  const headingNodes = tree.children.filter((node): node is Heading => node.type === "heading");
  const headings = headingNodes.map((heading, index): IndexedHeading => {
    const endHeading = headingNodes
      .slice(index + 1)
      .find((candidate) => candidate.depth <= heading.depth);
    const parents = headingNodes
      .slice(0, index)
      .filter((candidate) => candidate.depth < heading.depth);
    const directParents: Heading[] = [];
    let maximumDepth = heading.depth;
    for (let parentIndex = parents.length - 1; parentIndex >= 0; parentIndex -= 1) {
      const candidate = parents[parentIndex];
      if (candidate !== undefined && candidate.depth < maximumDepth) {
        directParents.unshift(candidate);
        maximumDepth = candidate.depth;
      }
    }
    return {
      depth: heading.depth,
      title: normalizeText(toString(heading)),
      start: nodeStart(heading),
      contentStart: nodeEnd(heading, source),
      end: endHeading === undefined ? source.length : nodeStart(endHeading),
      parentTitles: directParents.map((parent) => normalizeText(toString(parent)))
    };
  });

  const tables = tree.children
    .filter((node): node is Table => node.type === "table")
    .map((table): IndexedTable => {
      const start = nodeStart(table);
      const parents = headings
        .filter((heading) => heading.start < start && heading.end >= start)
        .sort((left, right) => left.depth - right.depth);
      return {
        rows: table.children.map((row) =>
          row.children.map((cell) => normalizeText(toString(cell)))
        ),
        parentTitles: parents.map((heading) => heading.title)
      };
    });

  return { relativePath, source, headings, tables };
};

const sectionBody = (document: IndexedDocument, heading: IndexedHeading): string =>
  document.source.slice(heading.contentStart, heading.end).trim();

const findMarkdownFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const children = await Promise.all(
    entries.map(async (entry): Promise<string[]> => {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if ([".git", "content", "docs", "node_modules", "packages", "apps"].includes(entry.name)) {
          return [];
        }
        return findMarkdownFiles(absolute);
      }
      return entry.isFile() && entry.name.endsWith(".md") && entry.name !== "CONTRIBUTING.md"
        ? [absolute]
        : [];
    })
  );
  return children.flat().sort((left, right) => left.localeCompare(right));
};

const allEntities: ContentEntity[] = [];
const entitiesById = new Map<string, ContentEntity>();
const manifestByPath = new Map<string, ManifestSource>();

const sourceEntry = (relativePath: string): ManifestSource => {
  const normalized = normalizePath(relativePath);
  const existing = manifestByPath.get(normalized);
  if (existing !== undefined) {
    return existing;
  }
  const created = { path: normalized, entityIds: [], warnings: [], manualFields: [] };
  manifestByPath.set(normalized, created);
  return created;
};

const addEntity = (
  input: EntityInput,
  legacyPaths: string[],
  body: string,
  options: { warnings?: string[]; manualFields?: string[] } = {}
): ContentEntity => {
  const normalizedPaths = [...new Set(legacyPaths.map(normalizePath))];
  const candidate = ContentEntitySchema.parse({
    schemaVersion: SCHEMA_VERSION,
    source: sourceId,
    status: "legacy",
    traits: [],
    references: [],
    ...input,
    summary: deriveEntitySummary(input, body),
    description: body.trim(),
    legacy: {
      paths: normalizedPaths,
      notes: options.warnings ?? []
    }
  });
  if (entitiesById.has(candidate.id)) {
    throw new Error(`Migration produced duplicate ID ${candidate.id}`);
  }
  entitiesById.set(candidate.id, candidate);
  allEntities.push(candidate);
  for (const legacyPath of normalizedPaths) {
    const entry = sourceEntry(legacyPath);
    entry.entityIds.push(candidate.id);
    entry.warnings.push(...(options.warnings ?? []));
    entry.manualFields.push(...(options.manualFields ?? []));
  }
  return candidate;
};

const addTrait = (id: string, name: string, legacyPath: string): void => {
  if (entitiesById.has(id)) {
    return;
  }
  addEntity(
    {
      id,
      type: "trait",
      name,
      appliesTo: []
    },
    [legacyPath],
    `Aus dem Altbestand migriertes Merkmal: ${name}.`
  );
};

const tableRows = (table: IndexedTable): string[][] => table.rows.slice(1);

const attributeIds: Record<string, string> = {
  ST: "strength",
  Stärke: "strength",
  GE: "dexterity",
  Geschicklichkeit: "dexterity",
  KO: "constitution",
  Konstitution: "constitution",
  IN: "intelligence",
  Intelligenz: "intelligence",
  WE: "wisdom",
  Weisheit: "wisdom",
  CH: "charisma",
  Charisma: "charisma"
};

const attributeFromText = (value: string): string[] =>
  Object.entries(attributeIds)
    .filter(([label]) => new RegExp(`(?:^|\\W)${label}(?:\\W|$)`, "i").test(value))
    .map(([, id]) => id)
    .filter((id, index, values) => values.indexOf(id) === index);

const parseLevel = (value: string, fallback = 1): number => {
  const match = value.match(/(\d+)(?:\.|\+)?(?:\s*Stufe)?/i);
  return match === null ? fallback : Math.max(1, Math.min(20, Number(match[1])));
};

const textEffect = (text: string): Record<string, unknown> => ({
  kind: "text",
  text: normalizeText(text).slice(0, 2000) || "Siehe erhaltene Beschreibung.",
  machineReadable: false
});

const migrateSupportingEntities = (): void => {
  const sourcePath = "rules/core_mechanics.md";
  const skills: Array<[string, string, string]> = [
    ["athletics", "Athletik", "strength"],
    ["acrobatics", "Akrobatik", "dexterity"],
    ["stealth", "Heimlichkeit", "dexterity"],
    ["driving", "Fahrzeugführung", "dexterity"],
    ["persuasion", "Überzeugen", "charisma"],
    ["intimidation", "Einschüchtern", "charisma"],
    ["diplomacy", "Diplomatie", "charisma"],
    ["deception", "Täuschen", "charisma"],
    ["science", "Wissenschaft", "intelligence"],
    ["technology", "Technologie", "intelligence"],
    ["magic", "Magie", "intelligence"],
    ["society", "Gesellschaft", "intelligence"],
    ["survival", "Überleben", "wisdom"],
    ["medicine", "Medizin", "wisdom"],
    ["detect-magic", "Magie erkennen", "wisdom"],
    ["crafting", "Handwerk", "intelligence"],
    ["mechanics", "Mechanik", "intelligence"],
    ["religion", "Religion", "wisdom"],
    ["arcana", "Arkane Kunde", "intelligence"]
  ];
  for (const [id, name, attribute] of skills) {
    addEntity(
      { id: `skill.${id}`, type: "skill", name, attribute },
      [sourcePath],
      `Kanonischer Skill für ${name}.`,
      id === "detect-magic"
        ? {
            warnings: [
              "Der alte Wahrnehmungsblock wurde getrennt: Wahrnehmung ist eine eigene Proficiency."
            ]
          }
        : {}
    );
  }

  const proficiencies: Array<[string, string, string, string?]> = [
    ["perception", "Wahrnehmung", "perception", "wisdom"],
    ["save.fortitude", "Zähigkeitswurf", "save", "constitution"],
    ["save.reflex", "Reflexwurf", "save", "dexterity"],
    ["save.will", "Willenswurf", "save", "wisdom"],
    ["weapon.simple", "Einfache Waffen", "weapon"],
    ["weapon.martial", "Kriegerische Waffen", "weapon"],
    ["weapon.firearm", "Feuerwaffen", "weapon"],
    ["weapon.unarmed", "Unbewaffnet", "weapon"],
    ["armor.unarmored", "Ungerüstet", "armor"],
    ["armor.light", "Leichte Rüstung", "armor"],
    ["armor.medium", "Mittlere Rüstung", "armor"],
    ["armor.heavy", "Schwere Rüstung", "armor"],
    ["class-dc", "Klassen-SG", "class-dc"],
    ["spell.arcane", "Arkane Zauber", "spellcasting"],
    ["spell.occult", "Okkulte Zauber", "spellcasting"],
    ["spell.primal", "Naturzauber", "spellcasting"]
  ];
  for (const [id, name, category, attribute] of proficiencies) {
    addEntity(
      {
        id: `proficiency.${id}`,
        type: "proficiency",
        name,
        category,
        ...(attribute === undefined ? {} : { attribute })
      },
      [sourcePath],
      `${name} verwendet die fünf Ränge untrainiert, geübt, Experte, Meister und legendär.`
    );
  }

  const languages: Array<[string, string]> = [
    ["common", "Gemeinsprache"],
    ["elven", "Elfenisch"],
    ["dwarven", "Zwergisch"],
    ["orcish", "Orkisch"],
    ["gnomish", "Gnomisch"],
    ["goblin", "Goblinisch"],
    ["halfling", "Halblingisch"],
    ["infernal", "Infernalisch"],
    ["draconic", "Drakonisch"],
    ["sign", "Gebärdensprache"]
  ];
  for (const [id, name] of languages) {
    addEntity(
      { id: `language.${id}`, type: "language", name, rarity: "common" },
      [sourcePath],
      `${name} ist eine aus dem Altbestand normalisierte Sprache.`
    );
  }

  const baseTraits: Array<[string, string]> = [
    ["legacy", "Legacy"],
    ["class-option", "Klassenoption"],
    ["magic", "Magisch"],
    ["ancestry", "Abstammung"],
    ["general", "Allgemein"],
    ["humanoid", "Humanoid"]
  ];
  for (const [id, name] of baseTraits) {
    addTrait(`trait.${id}`, name, sourcePath);
  }

  for (const [id, name, value] of [
    ["actions-per-turn", "Aktionen pro Zug", 3],
    ["reaction-per-round", "Reaktionen pro Runde", 1],
    [
      "proficiency-ranks",
      "Proficiency-Ränge",
      {
        untrained: 0,
        trained: 2,
        expert: 4,
        master: 6,
        legendary: 8
      }
    ],
    [
      "bonus-stacking",
      "Bonus-Stapelung",
      "Gleichartige Status-, Umstands- und Gegenstandsboni stapeln nicht."
    ]
  ] as const) {
    addEntity(
      { id: `rule.${id}`, type: "rule", name, key: `rule.${id}`, value },
      [sourcePath],
      `${name} ist eine verbindliche Compilerannahme aus dem Review.`
    );
  }

  addEntity(
    {
      id: "choice.general-feat.1",
      type: "choice",
      name: "Allgemeines Talent Stufe 1",
      status: "playtest",
      choice: {
        id: "choice.general-feat.1",
        level: 1,
        kind: "feat",
        min: 1,
        max: 1,
        filter: {
          entityTypes: ["feat"],
          category: "general",
          maxLevel: 1
        },
        prerequisites: [],
        effects: [],
        excludes: [],
        repeatable: false
      }
    },
    [sourcePath],
    "Wähle auf Stufe 1 ein allgemeines Talent.",
    {
      warnings: [
        "Der Altbestand definiert keinen vollständigen Talent-Zeitplan; diese Auswahl ist ein Testinhalt."
      ],
      manualFields: ["level", "min", "max"]
    }
  );
};

const classConfig: Record<string, { keyAttributes: string[]; hp: number; spellcasting?: string }> =
  {
    agent: { keyAttributes: ["dexterity", "charisma", "intelligence"], hp: 8 },
    ingenieur: { keyAttributes: ["intelligence"], hp: 8 },
    magier: {
      keyAttributes: ["intelligence"],
      hp: 6,
      spellcasting: "spellcasting.arcane-prepared"
    },
    mediziner: { keyAttributes: ["wisdom", "intelligence"], hp: 8 },
    okkultist: {
      keyAttributes: ["charisma"],
      hp: 6,
      spellcasting: "spellcasting.occult-spontaneous"
    },
    raufbold: { keyAttributes: ["strength", "constitution"], hp: 10 },
    schamane: {
      keyAttributes: ["wisdom"],
      hp: 8,
      spellcasting: "spellcasting.primal-prepared"
    },
    soeldner: { keyAttributes: ["strength", "dexterity"], hp: 10 },
    waechter: { keyAttributes: ["constitution", "wisdom"], hp: 10 }
  };

const migrateClasses = (documents: IndexedDocument[]): void => {
  for (const document of documents.filter((item) =>
    item.relativePath.startsWith("classes/klasse_")
  )) {
    const fileKey = path.basename(document.relativePath, ".md").replace("klasse_", "");
    const config = classConfig[fileKey];
    if (config === undefined) {
      throw new Error(`Missing class config for ${fileKey}`);
    }
    const className = document.headings.find((heading) => heading.depth === 1)?.title ?? fileKey;
    const classId = `class.${slug(className)}`;
    const features: string[] = [];
    const classChoices: string[] = [];
    const featureHeadings = document.headings.filter(
      (heading) => heading.depth === 3 && heading.parentTitles.at(-1) === "Klassenmerkmale"
    );

    for (const featureHeading of featureHeadings) {
      const featureName = featureHeading.title.replace(/\s*\(\d+\.\s*Stufe\)\s*$/i, "");
      const featureId = `class-feature.${slug(className)}.${slug(featureName)}`;
      const optionHeadings = document.headings.filter(
        (heading) =>
          heading.depth === 4 &&
          heading.start > featureHeading.start &&
          heading.start < featureHeading.end
      );
      const choiceIds: string[] = [];
      if (optionHeadings.length > 0) {
        const optionTraitId = `trait.class-option.${slug(className)}.${slug(featureName)}`;
        addTrait(optionTraitId, `${className}: ${featureName}`, document.relativePath);
        for (const optionHeading of optionHeadings) {
          const optionId = `${featureId}.${slug(optionHeading.title)}`;
          addEntity(
            {
              id: optionId,
              type: "class-feature",
              name: optionHeading.title,
              classId,
              level: parseLevel(featureHeading.title),
              traits: ["trait.class-option", optionTraitId],
              prerequisites: [],
              effects: [textEffect(sectionBody(document, optionHeading))],
              choiceIds: []
            },
            [document.relativePath],
            sectionBody(document, optionHeading),
            { manualFields: ["effects"] }
          );
          features.push(optionId);
        }
        const choiceId = `choice.${slug(className)}.${slug(featureName)}`;
        addEntity(
          {
            id: choiceId,
            type: "choice",
            name: `${featureName} wählen`,
            choice: {
              id: choiceId,
              level: parseLevel(featureHeading.title),
              kind: "class-option",
              min: 1,
              max: 1,
              filter: {
                entityTypes: ["class-feature"],
                classId,
                traitsAll: [optionTraitId]
              },
              prerequisites: [{ class: { id: classId } }],
              effects: [],
              excludes: [],
              repeatable: false
            }
          },
          [document.relativePath],
          `Wähle eine Option für ${featureName}.`
        );
        choiceIds.push(choiceId);
        classChoices.push(choiceId);
      }
      addEntity(
        {
          id: featureId,
          type: "class-feature",
          name: featureName,
          classId,
          level: parseLevel(featureHeading.title),
          traits: ["trait.legacy"],
          prerequisites: [],
          effects: [textEffect(sectionBody(document, featureHeading))],
          choiceIds
        },
        [document.relativePath],
        sectionBody(document, featureHeading),
        { manualFields: ["effects"] }
      );
      features.push(featureId);
    }

    const featTable = document.tables.find(
      (table) => table.parentTitles.at(-1) === "Klassen-Feats"
    );
    if (featTable === undefined) {
      throw new Error(`No class feat table in ${document.relativePath}`);
    }
    for (const row of tableRows(featTable)) {
      const [levelText, featName, effectText] = row;
      if (levelText === undefined || featName === undefined) {
        continue;
      }
      const level = parseLevel(levelText);
      const featId = `feat.class.${slug(className)}.${slug(featName)}`;
      addEntity(
        {
          id: featId,
          type: "feat",
          name: featName,
          category: "class",
          level,
          classId,
          traits: ["trait.legacy"],
          prerequisites: [{ class: { id: classId } }],
          effects: [textEffect(effectText ?? featName)]
        },
        [document.relativePath],
        effectText ?? "",
        { manualFields: ["effects"] }
      );
      const choiceId = `choice.class-feat.${slug(className)}.${String(level)}`;
      addEntity(
        {
          id: choiceId,
          type: "choice",
          name: `${className}-Talent Stufe ${String(level)}`,
          choice: {
            id: choiceId,
            level,
            kind: "feat",
            min: 1,
            max: 1,
            filter: {
              entityTypes: ["feat"],
              classId,
              category: "class",
              maxLevel: level
            },
            prerequisites: [{ class: { id: classId } }],
            effects: [],
            excludes: [],
            repeatable: false
          }
        },
        [document.relativePath],
        `Wähle ein verfügbares ${className}-Talent.`
      );
      classChoices.push(choiceId);
    }

    for (const archetypeHeading of document.headings.filter(
      (heading) => heading.depth === 3 && heading.parentTitles.at(-1) === "Archetypen"
    )) {
      addEntity(
        {
          id: `feat.archetype.${slug(className)}.${slug(archetypeHeading.title)}`,
          type: "feat",
          name: archetypeHeading.title,
          category: "archetype",
          level: 1,
          classId,
          traits: ["trait.legacy"],
          prerequisites: [{ class: { id: classId } }],
          effects: [textEffect(sectionBody(document, archetypeHeading))]
        },
        [document.relativePath],
        sectionBody(document, archetypeHeading),
        {
          warnings: ["Der Altbestand definiert keine Archetyp-Stufe oder Erwerbskosten."],
          manualFields: ["level", "effects"]
        }
      );
    }

    const skillChoiceId = `choice.class-skills.${slug(className)}`;
    addEntity(
      {
        id: skillChoiceId,
        type: "choice",
        name: `${className}-Fertigkeiten`,
        choice: {
          id: skillChoiceId,
          level: 1,
          kind: "skill",
          min: 4,
          max: 4,
          filter: { entityTypes: ["skill"] },
          prerequisites: [{ class: { id: classId } }],
          effects: [],
          excludes: [],
          repeatable: false
        }
      },
      [document.relativePath],
      `Wähle vier geübte Fertigkeiten für ${className}.`,
      {
        warnings: [
          "Der Altbestand nennt klassenabhängige Formeln; vorläufig gelten vier feste Auswahlen."
        ],
        manualFields: ["min", "max"]
      }
    );
    classChoices.push(skillChoiceId);

    if (config.spellcasting !== undefined) {
      const tradition = config.spellcasting.includes("arcane")
        ? "arcane"
        : config.spellcasting.includes("occult")
          ? "occult"
          : "primal";
      const spellChoiceId = `choice.class-spells.${slug(className)}`;
      addEntity(
        {
          id: spellChoiceId,
          type: "choice",
          name: `${className}-Zauber`,
          choice: {
            id: spellChoiceId,
            level: 1,
            kind: "spell",
            min: 0,
            max: 10,
            filter: {
              entityTypes: ["spell"],
              traditions: [tradition],
              maxLevel: 5
            },
            prerequisites: [{ class: { id: classId } }],
            effects: [],
            excludes: [],
            repeatable: false
          }
        },
        [document.relativePath],
        `Wähle Zauber aus der ${tradition}-Tradition.`,
        {
          warnings: [
            "Die genaue Anzahl bekannter oder vorbereiteter Zauber bleibt eine Playtest-Regel."
          ],
          manualFields: ["min", "max"]
        }
      );
      classChoices.push(spellChoiceId);
    }

    addEntity(
      {
        id: classId,
        type: "class",
        name: className,
        keyAttributes: config.keyAttributes,
        hpPerLevel: config.hp,
        trainedSkillChoices: 4,
        initialProficiencies: {
          perception: "trained",
          saves: { fortitude: "trained", reflex: "trained", will: "trained" },
          skills: {},
          weapons: {
            "proficiency.weapon.simple": "trained",
            "proficiency.weapon.unarmed": "trained"
          },
          armor: {
            "proficiency.armor.unarmored": "trained",
            "proficiency.armor.light": "trained"
          }
        },
        featureIds: features,
        choiceIds: classChoices,
        ...(config.spellcasting === undefined
          ? {}
          : { spellcastingProgressionId: config.spellcasting })
      },
      [document.relativePath],
      document.source,
      {
        warnings: [
          "Freie Anfangsproficiencies bleiben im Legacy-Text erhalten und benötigen Balancing."
        ],
        manualFields: ["initialProficiencies", "trainedSkillChoices"]
      }
    );
  }
};

const ancestryConfig: Record<
  string,
  {
    hp: number;
    size: "small" | "medium";
    speed: number;
    boosts: string[];
    flaws: string[];
    languages: string[];
  }
> = {
  elfen: {
    hp: 6,
    size: "medium",
    speed: 30,
    boosts: ["dexterity", "intelligence"],
    flaws: ["constitution"],
    languages: ["language.elven", "language.common"]
  },
  gnome: {
    hp: 8,
    size: "small",
    speed: 25,
    boosts: ["constitution", "charisma"],
    flaws: ["strength"],
    languages: ["language.gnomish", "language.common"]
  },
  goblins: {
    hp: 6,
    size: "small",
    speed: 30,
    boosts: ["dexterity", "charisma"],
    flaws: ["wisdom"],
    languages: ["language.goblin", "language.common"]
  },
  halblinge: {
    hp: 6,
    size: "small",
    speed: 25,
    boosts: ["dexterity", "wisdom"],
    flaws: ["strength"],
    languages: ["language.halfling", "language.common"]
  },
  mensch: {
    hp: 8,
    size: "medium",
    speed: 30,
    boosts: [],
    flaws: [],
    languages: ["language.common"]
  },
  orks: {
    hp: 10,
    size: "medium",
    speed: 30,
    boosts: ["strength", "constitution"],
    flaws: ["intelligence"],
    languages: ["language.orcish", "language.common"]
  },
  tieflinge: {
    hp: 8,
    size: "medium",
    speed: 30,
    boosts: ["charisma", "intelligence"],
    flaws: ["wisdom"],
    languages: ["language.infernal", "language.common"]
  },
  zwerge: {
    hp: 10,
    size: "medium",
    speed: 20,
    boosts: ["constitution", "wisdom"],
    flaws: ["charisma"],
    languages: ["language.dwarven", "language.common"]
  }
};

const migrateAncestries = (documents: IndexedDocument[]): void => {
  for (const document of documents.filter(
    (item) => item.relativePath.startsWith("races/") && !item.relativePath.endsWith("TOC.md")
  )) {
    const key = path.basename(document.relativePath).split("_")[0] ?? "";
    const config = ancestryConfig[key];
    if (config === undefined) {
      throw new Error(`Missing ancestry config for ${key}`);
    }
    const name = document.headings.find((heading) => heading.depth === 1)?.title ?? key;
    const ancestryId = `ancestry.${slug(name)}`;
    const featureIds: string[] = [];
    const featIds: string[] = [];
    const heritageIds: string[] = [];

    for (const featureHeading of document.headings.filter(
      (heading) =>
        heading.depth === 3 &&
        !["Volks-Feats", "Volksherkünfte (Heritages)"].includes(heading.parentTitles.at(-1) ?? "")
    )) {
      const featureId = `feat.ancestry-feature.${slug(name)}.${slug(featureHeading.title)}`;
      addEntity(
        {
          id: featureId,
          type: "feat",
          name: featureHeading.title,
          category: "ancestry",
          level: 1,
          ancestryId,
          traits: ["trait.ancestry"],
          prerequisites: [{ ancestry: { id: ancestryId } }],
          effects: [textEffect(sectionBody(document, featureHeading))]
        },
        [document.relativePath],
        sectionBody(document, featureHeading),
        { manualFields: ["effects"] }
      );
      featureIds.push(featureId);
    }

    for (const featHeading of document.headings.filter(
      (heading) => heading.depth === 3 && heading.parentTitles.at(-1) === "Volks-Feats"
    )) {
      const featName = featHeading.title.replace(/^\d+\.\s*Stufe\s*[–-]\s*/i, "");
      const featId = `feat.ancestry.${slug(name)}.${slug(featName)}`;
      addEntity(
        {
          id: featId,
          type: "feat",
          name: featName,
          category: "ancestry",
          level: parseLevel(featHeading.title),
          ancestryId,
          traits: ["trait.ancestry"],
          prerequisites: [{ ancestry: { id: ancestryId } }],
          effects: [textEffect(sectionBody(document, featHeading))]
        },
        [document.relativePath],
        sectionBody(document, featHeading),
        { manualFields: ["effects"] }
      );
      featIds.push(featId);
    }

    for (const heritageHeading of document.headings.filter(
      (heading) =>
        heading.depth === 3 && heading.parentTitles.at(-1) === "Volksherkünfte (Heritages)"
    )) {
      const heritageName = heritageHeading.title.replace(/\s*\(.*\)\s*$/i, "");
      const heritageId = `heritage.${slug(name)}.${slug(heritageName)}`;
      addEntity(
        {
          id: heritageId,
          type: "heritage",
          name: heritageName,
          ancestryId,
          traits: ["trait.ancestry"],
          prerequisites: [{ ancestry: { id: ancestryId } }],
          effects: [textEffect(sectionBody(document, heritageHeading))]
        },
        [document.relativePath],
        sectionBody(document, heritageHeading),
        { manualFields: ["effects"] }
      );
      heritageIds.push(heritageId);
    }

    addEntity(
      {
        id: ancestryId,
        type: "ancestry",
        name,
        hp: config.hp,
        size: config.size,
        speed: config.speed,
        boosts: config.boosts,
        flaws: config.flaws,
        freeBoosts: name === "Mensch" ? 2 : 1,
        languageIds: config.languages,
        additionalLanguagesFromIntelligence: true,
        featureIds,
        heritageIds,
        featIds
      },
      [document.relativePath],
      document.source,
      { manualFields: ["attribute boosts and flaws"] }
    );

    const heritageChoiceId = `choice.heritage.${slug(name)}`;
    addEntity(
      {
        id: heritageChoiceId,
        type: "choice",
        name: `${name}-Herkunft`,
        choice: {
          id: heritageChoiceId,
          level: 1,
          kind: "generic",
          min: 1,
          max: 1,
          filter: { entityTypes: ["heritage"], ancestryId },
          prerequisites: [{ ancestry: { id: ancestryId } }],
          effects: [],
          excludes: [],
          repeatable: false
        }
      },
      [document.relativePath],
      `Wähle eine Herkunft für ${name}.`
    );

    for (const level of [1, 5, 9, 13, 17]) {
      const featChoiceId = `choice.ancestry-feat.${slug(name)}.${String(level)}`;
      addEntity(
        {
          id: featChoiceId,
          type: "choice",
          name: `${name}-Talent Stufe ${String(level)}`,
          choice: {
            id: featChoiceId,
            level,
            kind: "feat",
            min: 1,
            max: 1,
            filter: {
              entityTypes: ["feat"],
              ancestryId,
              category: "ancestry",
              maxLevel: level
            },
            prerequisites: [{ ancestry: { id: ancestryId } }],
            effects: [],
            excludes: featureIds,
            repeatable: false
          }
        },
        [document.relativePath],
        `Wähle ein verfügbares ${name}-Talent.`
      );
    }
  }
};

const migrateGeneralFeats = (documents: IndexedDocument[]): void => {
  const overview = documents.find((item) => item.relativePath === "feats/feats_overview.md");
  if (overview === undefined) {
    throw new Error("Missing feats overview");
  }
  const detailDocuments = new Map(
    documents
      .filter((item) => item.relativePath.startsWith("feats/feat_"))
      .map((item) => {
        const title = item.headings.find((heading) => heading.depth === 1)?.title ?? "";
        return [slug(title.replace(/^(?:Feat|Beruf):\s*/i, "")), item] as const;
      })
  );
  const featTables = overview.tables.filter(
    (table) => table.rows[0]?.[0] === "Feat" && table.rows[0]?.length === 4
  );
  for (const table of featTables) {
    const parent = table.parentTitles.at(-1) ?? "";
    for (const row of tableRows(table)) {
      const [name, prerequisiteText, effectText, levelText] = row;
      if (name === undefined) {
        continue;
      }
      const detail = detailDocuments.get(slug(name));
      const attributes = attributeFromText(prerequisiteText ?? "");
      const prerequisites =
        attributes.length === 0
          ? []
          : [
              {
                all: attributes.map((attribute) => ({
                  attribute: {
                    id: attribute,
                    gte: Number(prerequisiteText?.match(/\d+/)?.[0] ?? 1)
                  }
                }))
              }
            ];
      const category =
        parent === "Berufs-Feats" ? "profession" : parent === "Soziale Feats" ? "skill" : "general";
      addEntity(
        {
          id: `feat.general.${slug(name)}`,
          type: "feat",
          name,
          category,
          level: parseLevel(levelText ?? "1"),
          traits: ["trait.general"],
          prerequisites,
          effects: [textEffect(effectText ?? name)]
        },
        detail === undefined
          ? [overview.relativePath]
          : [overview.relativePath, detail.relativePath],
        detail?.source ??
          `${name} gewährt den im Altbestand beschriebenen Effekt: ${effectText ?? name}.`,
        {
          warnings:
            detail === undefined ? ["Für dieses Katalog-Feat existiert keine Detaildatei."] : [],
          manualFields: ["effects"]
        }
      );
    }
  }
};

const spellConfig: Record<
  string,
  {
    rank: number;
    traditions: Array<"arcane" | "divine" | "occult" | "primal">;
    actions: number;
    range: Record<string, unknown>;
    target: Record<string, unknown>;
    defense: Record<string, unknown>;
  }
> = {
  benommenheit: {
    rank: 0,
    traditions: ["arcane", "occult"],
    actions: 2,
    range: { kind: "distance", value: 30, unit: "feet" },
    target: { kind: "creature", count: 1 },
    defense: { kind: "save", save: "will" }
  },
  blitzschlag: {
    rank: 1,
    traditions: ["arcane", "primal"],
    actions: 2,
    range: { kind: "distance", value: 120, unit: "feet" },
    target: { kind: "area", area: { shape: "line", size: 60, unit: "feet" } },
    defense: { kind: "save", save: "reflex", basic: true }
  },
  feuerball: {
    rank: 3,
    traditions: ["arcane", "primal"],
    actions: 2,
    range: { kind: "distance", value: 500, unit: "feet" },
    target: { kind: "area", area: { shape: "burst", size: 20, unit: "feet" } },
    defense: { kind: "save", save: "reflex", basic: true }
  },
  flamme_erschaffen: {
    rank: 0,
    traditions: ["arcane", "primal"],
    actions: 2,
    range: { kind: "distance", value: 30, unit: "feet" },
    target: { kind: "creature", count: 1 },
    defense: { kind: "armor-class" }
  },
  gedankenkontrolle: {
    rank: 4,
    traditions: ["occult"],
    actions: 2,
    range: { kind: "distance", value: 30, unit: "feet" },
    target: { kind: "creature", count: 1 },
    defense: { kind: "save", save: "will" }
  },
  gedankenlesen: {
    rank: 2,
    traditions: ["arcane", "occult"],
    actions: 2,
    range: { kind: "distance", value: 30, unit: "feet" },
    target: { kind: "creature", count: 1 },
    defense: { kind: "save", save: "will" }
  },
  heilung: {
    rank: 1,
    traditions: ["divine", "primal"],
    actions: 2,
    range: { kind: "distance", value: 30, unit: "feet" },
    target: { kind: "creature", count: 1 },
    defense: { kind: "none" }
  },
  licht: {
    rank: 0,
    traditions: ["arcane", "divine", "occult", "primal"],
    actions: 2,
    range: { kind: "touch" },
    target: { kind: "object", count: 1 },
    defense: { kind: "none" }
  },
  magie_aufheben: {
    rank: 3,
    traditions: ["arcane", "divine", "occult", "primal"],
    actions: 2,
    range: { kind: "distance", value: 120, unit: "feet" },
    target: { kind: "effect", count: 1 },
    defense: { kind: "none" }
  },
  magie_erkennen: {
    rank: 0,
    traditions: ["arcane", "divine", "occult", "primal"],
    actions: 2,
    range: { kind: "self" },
    target: { kind: "area", area: { shape: "emanation", size: 30, unit: "feet" } },
    defense: { kind: "none" }
  },
  nachricht: {
    rank: 0,
    traditions: ["arcane", "occult"],
    actions: 2,
    range: { kind: "distance", value: 120, unit: "feet" },
    target: { kind: "creature", count: 1 },
    defense: { kind: "none" }
  },
  schutzschild: {
    rank: 1,
    traditions: ["arcane", "divine"],
    actions: 1,
    range: { kind: "self" },
    target: { kind: "self" },
    defense: { kind: "none" }
  },
  teleportation: {
    rank: 5,
    traditions: ["arcane", "occult"],
    actions: 3,
    range: { kind: "self" },
    target: { kind: "mixed", text: "Du und bis zu acht bereitwillige Kreaturen." },
    defense: { kind: "none" }
  },
  unsichtbarkeit: {
    rank: 2,
    traditions: ["arcane", "occult"],
    actions: 2,
    range: { kind: "touch" },
    target: { kind: "creature", count: 1 },
    defense: { kind: "none" }
  }
};

const migrateSpells = (documents: IndexedDocument[]): void => {
  for (const document of documents.filter((item) =>
    item.relativePath.startsWith("spells/spell_")
  )) {
    const key = path.basename(document.relativePath, ".md").replace("spell_", "");
    const config = spellConfig[key];
    if (config === undefined) {
      throw new Error(`Missing spell config for ${key}`);
    }
    const rawTitle = document.headings.find((heading) => heading.depth === 1)?.title ?? key;
    const name = rawTitle.replace(/^Zauber:\s*/i, "");
    addEntity(
      {
        id: `spell.${slug(name)}`,
        type: "spell",
        name,
        rank: config.rank,
        traditions: config.traditions,
        actions: { kind: "fixed", value: config.actions },
        range: config.range,
        target: config.target,
        duration: "Siehe Legacy-Beschreibung",
        defense: config.defense,
        traits: ["trait.magic"],
        effects: [textEffect(document.source)],
        heightened: []
      },
      [document.relativePath, "spells/TOC.md"],
      document.source,
      {
        warnings: [
          "Bei Rangkonflikten gilt vorläufig die Detaildatei; Dauer und Höhenstufen bleiben Freitext."
        ],
        manualFields: ["duration", "effects", "heightened"]
      }
    );
  }
};

const parsePrice = (value: string | undefined): number =>
  Number(value?.replace(/[^\d.,]/g, "").replace(",", ".") || 0);

const parseDamage = (
  value: string | undefined
): { dice: number; die: string; modifier?: string; flat: number } => {
  const match = value?.match(/(\d+)d(4|6|8|10|12)/i);
  const modifier = value?.includes("GE")
    ? "dexterity"
    : value?.includes("ST")
      ? "strength"
      : undefined;
  const flatMatches = [...(value?.matchAll(/\+(\d+)/g) ?? [])];
  return {
    dice: Number(match?.[1] ?? 1),
    die: `d${match?.[2] ?? "4"}`,
    ...(modifier === undefined ? {} : { modifier }),
    flat: flatMatches.reduce((total, item) => total + Number(item[1]), 0)
  };
};

const migrateEquipment = (documents: IndexedDocument[]): void => {
  const overview = documents.find(
    (item) => item.relativePath === "gear/equipment/equipment_overview.md"
  );
  const melee = documents.find(
    (item) => item.relativePath === "gear/weapons/melee/melee_weapons.md"
  );
  if (overview === undefined || melee === undefined) {
    throw new Error("Missing equipment sources");
  }
  const itemTraits: Array<[string, string, string]> = [
    ["item.weapon.simple", "Einfache Waffen", "weapon"],
    ["item.weapon.martial", "Kriegerische Waffen", "weapon"],
    ["item.weapon.ranged", "Fernkampfwaffen", "weapon"],
    ["item.weapon.magic", "Magische Waffen", "weapon"],
    ["item.armor.light", "Leichte Rüstung", "armor"],
    ["item.armor.medium", "Mittlere Rüstung", "armor"],
    ["item.armor.heavy", "Schwere Rüstung", "armor"],
    ["item.equipment.clothing", "Kleidung", "equipment"],
    ["item.equipment.technology", "Technologie", "equipment"],
    ["item.equipment.magic", "Magische Gegenstände", "equipment"],
    ["weapon-group.blade", "Klingen", "weapon"],
    ["weapon-group.blunt", "Stumpfe Waffen", "weapon"],
    ["weapon-group.projectile", "Projektilwaffen", "weapon"]
  ];
  for (const [id, name] of itemTraits) {
    addTrait(`trait.${id}`, name, overview.relativePath);
  }

  const weaponRows = overview.tables.filter((table) => {
    const header = table.rows[0] ?? [];
    return header[0] === "Waffe" && header.includes("Schaden");
  });
  const weapons = new Map<string, { name: string; row: string[]; ranged: boolean }>();
  for (const table of weaponRows) {
    const ranged = (table.rows[0] ?? []).includes("Reichweite");
    for (const row of tableRows(table)) {
      const name = row[0];
      if (name !== undefined && !weapons.has(slug(name))) {
        weapons.set(slug(name), { name, row, ranged });
      }
    }
  }
  for (const heading of melee.headings.filter(
    (candidate) =>
      candidate.depth === 4 &&
      (candidate.parentTitles.includes("Waffenstatistiken") ||
        candidate.parentTitles.includes("Moderne Varianten"))
  )) {
    const body = sectionBody(melee, heading);
    if (["Verzauberte Waffen", "Elementare Waffen", "Spezielle Waffen"].includes(heading.title)) {
      for (const match of body.matchAll(/^-\s+\*\*(.+?):\*\*\s+(.+)$/gm)) {
        const name = match[1];
        const effect = match[2];
        if (name !== undefined && effect !== undefined) {
          weapons.set(slug(name), {
            name,
            row: [name, effect, body, "0"],
            ranged: false
          });
        }
      }
    } else if (!weapons.has(slug(heading.title))) {
      const damage = body.match(/Schaden:\*?\*?\s*([^\n]+)/i)?.[1] ?? "1d6";
      const price = body.match(/Preis:\*?\*?\s*([^\n]+)/i)?.[1] ?? "0";
      weapons.set(slug(heading.title), {
        name: heading.title,
        row: [heading.title, damage, body, price],
        ranged: false
      });
    }
  }
  for (const { name, row, ranged } of weapons.values()) {
    const rangeText = ranged ? row[2] : undefined;
    const priceText = row.at(-1);
    const rangeMatch = rangeText?.match(/(\d+)\s*\/\s*(\d+)/);
    const damage = parseDamage(row[1]);
    addEntity(
      {
        id: `weapon.${slug(name)}`,
        type: "weapon",
        name,
        level: 0,
        priceGp: parsePrice(priceText),
        bulk: 1,
        hands: /zweih|schwer/i.test(row.join(" ")) ? 2 : 1,
        categoryId: ranged ? "trait.item.weapon.ranged" : "trait.item.weapon.simple",
        groupId: ranged ? "trait.weapon-group.projectile" : "trait.weapon-group.blade",
        damage: {
          ...damage,
          type: /stumpf/i.test(row.join(" ")) ? "damage.bludgeoning" : "damage.piercing"
        },
        ...(rangeMatch === null || rangeMatch === undefined
          ? {}
          : {
              range: {
                increment: Number(rangeMatch[1]),
                maximum: Number(rangeMatch[2])
              }
            }),
        traits: ["trait.legacy"]
      },
      [overview.relativePath, ...(melee.source.includes(name) ? [melee.relativePath] : [])],
      row.join(" | "),
      { manualFields: ["level", "bulk", "hands", "categoryId", "groupId"] }
    );
  }

  const armorTables = overview.tables.filter((table) => table.rows[0]?.[0] === "Rüstung");
  for (const table of armorTables) {
    const context = table.parentTitles.join(" ");
    const categoryId = /Leichte/i.test(context)
      ? "trait.item.armor.light"
      : /Mittlere/i.test(context)
        ? "trait.item.armor.medium"
        : "trait.item.armor.heavy";
    for (const row of tableRows(table)) {
      const name = row[0];
      if (name === undefined) {
        continue;
      }
      addEntity(
        {
          id: `armor.${slug(name)}`,
          type: "armor",
          name,
          level: 0,
          priceGp: parsePrice(row.at(-1)),
          bulk: categoryId.endsWith("heavy") ? 3 : categoryId.endsWith("medium") ? 2 : 1,
          hands: 0,
          categoryId,
          itemBonus: Number(row[1]?.match(/\d+/)?.[0] ?? 0),
          dexterityCap: categoryId.endsWith("heavy") ? 0 : categoryId.endsWith("medium") ? 2 : 4,
          traits: ["trait.legacy"]
        },
        [overview.relativePath],
        row.join(" | "),
        { manualFields: ["level", "bulk", "dexterityCap"] }
      );
    }
  }

  const equipmentTables = overview.tables.filter((table) => {
    const header = table.rows[0] ?? [];
    return (
      table.parentTitles.includes("Ausrüstungssystem") &&
      header.length === 3 &&
      header[1] === "Eigenschaften" &&
      header[2] === "Preis"
    );
  });
  for (const table of equipmentTables) {
    const context = table.parentTitles.join(" ");
    const categoryId = /Kleidung/i.test(context)
      ? "trait.item.equipment.clothing"
      : /Magische/i.test(context)
        ? "trait.item.equipment.magic"
        : "trait.item.equipment.technology";
    for (const row of tableRows(table)) {
      const name = row[0];
      if (name === undefined) {
        continue;
      }
      addEntity(
        {
          id: `equipment.${slug(name)}`,
          type: "equipment",
          name,
          level: 0,
          priceGp: parsePrice(row.at(-1)),
          bulk: /auto|motorrad/i.test(name) ? 10 : 1,
          hands: 0,
          categoryId,
          traits: ["trait.legacy"],
          effects: [textEffect(row[1] ?? name)]
        },
        [overview.relativePath],
        row.join(" | "),
        { manualFields: ["level", "bulk", "effects"] }
      );
    }
  }
};

const migrateCreatures = (documents: IndexedDocument[]): void => {
  const overview = documents.find((item) => item.relativePath === "bestiary/bestiary_overview.md");
  if (overview === undefined) {
    throw new Error("Missing bestiary overview");
  }
  const candidates = new Map<string, { name: string; body: string; paths: string[] }>();
  for (const heading of overview.headings.filter(
    (candidate) => candidate.depth === 4 && candidate.parentTitles.includes("Kreaturenverzeichnis")
  )) {
    candidates.set(slug(heading.title), {
      name: heading.title,
      body: sectionBody(overview, heading),
      paths: [overview.relativePath]
    });
  }
  for (const document of documents.filter((item) =>
    item.relativePath.startsWith("bestiary/humanoid/")
  )) {
    const mainName =
      document.headings.find((heading) => heading.depth === 1)?.title ??
      path.basename(document.relativePath, ".md");
    const mainKey = slug(mainName);
    const existing = candidates.get(mainKey);
    candidates.set(mainKey, {
      name: mainName,
      body: document.source,
      paths: [...(existing?.paths ?? []), document.relativePath]
    });
    for (const heading of document.headings.filter(
      (candidate) => candidate.depth === 3 && candidate.parentTitles.at(-1) === "Variationen"
    )) {
      const key = slug(heading.title);
      const previous = candidates.get(key);
      candidates.set(key, {
        name: heading.title,
        body: sectionBody(document, heading),
        paths: [...(previous?.paths ?? []), document.relativePath]
      });
    }
  }

  for (const candidate of candidates.values()) {
    const levelText =
      candidate.body.match(/(?:Stufe|Herausforderungsgrad):\*?\*?\s*([^\s(<]+)/i)?.[1] ?? "0";
    const fraction = levelText.match(/(\d+)\s*\/\s*(\d+)/);
    const level =
      fraction === null ? Math.max(-1, Math.min(30, Number(levelText.match(/\d+/)?.[0] ?? 0))) : 0;
    const hp = Number(candidate.body.match(/(?:TP|Trefferpunkte):\*?\*?\s*(\d+)/i)?.[1] ?? 20);
    const armorClass = Number(
      candidate.body.match(/(?:RK|Rüstungsklasse):\*?\*?\s*(\d+)/i)?.[1] ?? 12
    );
    const speed = Number(
      candidate.body.match(/(?:Bewegung|Bewegungsrate):\*?\*?\s*(\d+)/i)?.[1] ?? 30
    );
    addEntity(
      {
        id: `creature.${slug(candidate.name)}`,
        type: "creature",
        name: candidate.name,
        level,
        hp,
        armorClass,
        speed,
        legacySystem: "dnd5e",
        traits: ["trait.humanoid", "trait.legacy"],
        effects: [textEffect(candidate.body)]
      },
      candidate.paths,
      candidate.body,
      {
        warnings: [
          "Der Statblock stammt aus einem D&D-5e-ähnlichen System und ist noch nicht auf SotC-Balance migriert.",
          ...(fraction === null
            ? []
            : ["Ein gebrochener Herausforderungsgrad wurde vorläufig auf Stufe 0 abgebildet."])
        ],
        manualFields: ["level", "effects"]
      }
    );
  }
};

const migrateBackgroundsAndProgressions = (): void => {
  const socialSource = "rules/social_mechanics.md";
  const backgrounds: Array<[string, string, string[], string]> = [
    ["corporate-child", "Konzernkind", ["intelligence", "charisma"], "skill.society"],
    ["worker", "Arbeiter", ["strength", "constitution"], "skill.crafting"],
    ["clan-heir", "Clan-Erbe", ["constitution", "charisma"], "skill.diplomacy"],
    ["academic", "Akademiker", ["intelligence", "wisdom"], "skill.science"],
    ["underworld-contact", "Unterweltkontakt", ["dexterity", "charisma"], "skill.deception"],
    ["frontier", "Grenzgänger", ["constitution", "wisdom"], "skill.survival"],
    ["order-member", "Ordensmitglied", ["strength", "wisdom"], "skill.religion"],
    ["outcast", "Ausgestoßener", ["dexterity", "wisdom"], "skill.stealth"]
  ];
  for (const [id, name, boosts, skill] of backgrounds) {
    addEntity(
      {
        id: `background.${id}`,
        type: "background",
        name,
        status: "playtest",
        boosts,
        freeBoosts: 1,
        trainedSkillIds: [skill],
        grantedFeatIds: [],
        choiceIds: [],
        effects: [{ kind: "skill-training", skillId: skill, rank: "trained" }]
      },
      [socialSource],
      `${name} wurde für einen vollständigen Charakterbau aus den sozialen Rollen des Altbestands abgeleitet.`,
      {
        warnings: [
          "Neu ergänzter Playtest-Background; im Altbestand existieren keine formalen Backgrounds."
        ],
        manualFields: ["boosts", "trainedSkillIds"]
      }
    );
  }

  const progressions: Array<[string, string, string, string, string, string]> = [
    [
      "arcane-prepared",
      "Vorbereitete arkane Progression",
      "class.magier",
      "arcane",
      "prepared",
      "intelligence"
    ],
    [
      "occult-spontaneous",
      "Spontane okkulte Progression",
      "class.okkultist",
      "occult",
      "spontaneous",
      "charisma"
    ],
    [
      "primal-prepared",
      "Vorbereitete Naturprogression",
      "class.schamane",
      "primal",
      "prepared",
      "wisdom"
    ]
  ];
  for (const [id, name, classId, tradition, mode, attribute] of progressions) {
    addEntity(
      {
        id: `spellcasting.${id}`,
        type: "spellcasting-progression",
        name,
        status: id === "primal-prepared" ? "playtest" : "legacy",
        classId,
        tradition,
        mode,
        castingAttribute: attribute,
        proficiencyByLevel: { "1": "trained", "7": "expert", "15": "master", "19": "legendary" },
        slotsByLevel: {
          "1": [2],
          "3": [3, 2],
          "5": [3, 3, 2],
          "7": [3, 3, 3, 2],
          "9": [3, 3, 3, 3, 2]
        },
        ...(mode === "spontaneous"
          ? {
              repertoireByLevel: {
                "1": [3],
                "3": [4, 2],
                "5": [4, 3, 2],
                "7": [4, 3, 3, 2],
                "9": [4, 3, 3, 3, 2]
              }
            }
          : {})
      },
      [`classes/klasse_${classId.split(".")[1]}.md`],
      `${name}; Progression als ausdrückliche Testannahme ergänzt.`,
      {
        warnings: ["Slot- und Proficiency-Progression benötigt Playtest-Balancing."],
        manualFields: ["proficiencyByLevel", "slotsByLevel"]
      }
    );
  }
};

const writeEntity = async (entity: ContentEntity): Promise<void> => {
  const typeDirectory = path.join(contentDirectory, entity.type);
  await mkdir(typeDirectory, { recursive: true });
  const { description, ...frontmatter } = entity;
  const yaml = stringify(frontmatter, {
    lineWidth: 0,
    sortMapEntries: true
  }).trimEnd();
  const body = description.length === 0 ? `# ${entity.name}` : description;
  await writeFile(
    path.join(typeDirectory, `${entity.id}.md`),
    `---\n${yaml}\n---\n\n${body.trim()}\n`,
    "utf8"
  );
};

const markdownCell = (value: string): string =>
  value.replaceAll("|", "\\|").replace(/\r?\n/g, "<br>");

const migrationReport = (manifest: MigrationManifest): string => {
  const countRows = Object.entries(manifest.actualCounts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([type, count]) => `| \`${type}\` | ${String(count)} |`)
    .join("\n");
  const sourceRows = manifest.sources
    .map((entry) => {
      const status = entry.entityIds.length > 0 ? "migriert" : "erfasst, nicht-mechanisch";
      const ids =
        entry.entityIds.length === 0 ? "-" : entry.entityIds.map((id) => `\`${id}\``).join("<br>");
      const warnings = entry.warnings.length === 0 ? "-" : entry.warnings.join("<br>");
      const manual = entry.manualFields.length === 0 ? "-" : entry.manualFields.join(", ");
      return `| \`${entry.path}\` | ${ids} | ${status} | ${markdownCell(warnings)} | ${markdownCell(manual)} |`;
    })
    .join("\n");

  return `# Migrationsbericht

Stand: reproduzierbare Migration mit Schema-Version ${String(manifest.schemaVersion)}

## Ergebnis

- ${String(manifest.sourceCount)} von 64 Ausgangsdateien wurden indiziert.
- ${String(manifest.generatedEntityCount)} Entitäten wurden erzeugt und vor dem Schreiben validiert.
- Der Compiler prüft zusätzlich IDs, Referenzen, Choices, Prädikate, Effekte und Zyklen.
- Die maschinenlesbare Primärquelle dieses Berichts ist \`content/migration-manifest.json\`.

| Entitätstyp | Anzahl |
|:--|--:|
${countRows}

## Entscheidungen und Ausnahmen

${manifest.decisions.map((decision) => `- ${decision}`).join("\n")}

Die Baseline-Zahl von 41 eindeutigen Waffen wurde auf 40 korrigiert. Die beiden
Quellen definieren zusammen 54 Vorkommen; nach der bereits bekannten
Speer-Dopplung bleibt zusätzlich \`Seelenfänger\` in beiden Quellen identisch.
Der Eintrag wird deshalb nicht künstlich dupliziert. Diese Ausnahme wird durch
\`content:migration-manifest.json\` und den Migrationstest geprüft.

## Dateizuordnung

Der Status \`erfasst, nicht-mechanisch\` bezeichnet Navigation, Vorlagen, Lore
oder Regelprosa, aus der keine eigenständige Auswahlentität erzeugt werden
musste. Ihre Information bleibt unverändert in der Ausgangsdatei erhalten.

| Ursprüngliche Datei | Neue Entitäts-IDs | Status | Warnungen/offene Regelentscheidung | Manuell ergänzte Felder |
|:--|:--|:--|:--|:--|
${sourceRows}

## Vollständigkeitsprüfung

\`npm run content:migration:verify\` kompiliert den Katalog erneut und bricht ab,
wenn eine Mindestzahl unterschritten wird, nicht mehr alle 64 Quellen im
Manifest stehen, Manifest und Katalog auseinanderlaufen oder eine mechanische
Quelldatei ohne Entitätszuordnung bleibt. Erlaubte Abweichungen müssen als
Entscheidung im Manifest stehen.
`;
};

const run = async (): Promise<void> => {
  const sourceFiles = await findMarkdownFiles(repositoryRoot);
  const documents = await Promise.all(
    sourceFiles.map(async (absolutePath) => {
      const relativePath = normalizePath(path.relative(repositoryRoot, absolutePath));
      sourceEntry(relativePath);
      return indexDocument(relativePath, await readFile(absolutePath, "utf8"));
    })
  );

  migrateSupportingEntities();
  migrateClasses(documents);
  migrateAncestries(documents);
  migrateGeneralFeats(documents);
  migrateSpells(documents);
  migrateEquipment(documents);
  migrateCreatures(documents);
  migrateBackgroundsAndProgressions();

  const resolvedContent = path.resolve(contentDirectory);
  if (
    path.dirname(resolvedContent) !== repositoryRoot ||
    path.basename(resolvedContent) !== "content"
  ) {
    throw new Error(`Refusing to replace unexpected directory: ${resolvedContent}`);
  }
  await rm(resolvedContent, { recursive: true, force: true });
  await mkdir(resolvedContent, { recursive: true });
  await Promise.all(
    allEntities.sort((left, right) => left.id.localeCompare(right.id)).map(writeEntity)
  );

  const actualCounts = Object.fromEntries(
    [...new Set(allEntities.map((entity) => entity.type))]
      .sort()
      .map((type) => [type, allEntities.filter((entity) => entity.type === type).length])
  );
  const manifest: MigrationManifest = {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: "deterministic-from-repository",
    sourceCount: sourceFiles.length,
    generatedEntityCount: allEntities.length,
    expectedMinimums: {
      class: 9,
      "class-feature": 99,
      ancestry: 8,
      heritage: 40,
      background: 8,
      feat: 195,
      spell: 14,
      weapon: 40,
      armor: 12,
      equipment: 28,
      creature: 34
    },
    actualCounts,
    sources: [...manifestByPath.values()]
      .map((entry) => ({
        ...entry,
        entityIds: [...new Set(entry.entityIds)].sort(),
        warnings: [...new Set(entry.warnings)].sort(),
        manualFields: [...new Set(entry.manualFields)].sort()
      }))
      .sort((left, right) => left.path.localeCompare(right.path)),
    decisions: [
      "Legacy-Dateien bleiben unverändert; Markdown unter content/ ist der neue kanonische Build-Eingang.",
      "IDs werden einmalig aus deutschem Anzeigenamen und Eigentümerkontext erzeugt und danach nicht mehr aus Namen abgeleitet.",
      "Nicht zuverlässig formalisierbare Regeln werden als ausdrücklich nicht maschinenlesbare Text-Effekte markiert.",
      "Bei widersprüchlichen Zauberrängen gilt vorläufig die Detaildatei.",
      "Bestiary-Statblocks bleiben als legacySystem=dnd5e isoliert.",
      "Die Inventarzahl 41 Waffen wurde auf 40 eindeutige Konzepte korrigiert: Seelenfänger steht in beiden Waffenquellen.",
      "Backgrounds und Zauberprogressionen sind dokumentierte Playtest-Ergänzungen."
    ]
  };
  await writeFile(
    path.join(contentDirectory, "migration-manifest.json"),
    stableStringify(manifest),
    "utf8"
  );
  const reviewDirectory = path.join(repositoryRoot, "docs", "review");
  await mkdir(reviewDirectory, { recursive: true });
  await writeFile(
    path.join(reviewDirectory, "02-migration-report.md"),
    migrationReport(manifest),
    "utf8"
  );

  process.stdout.write(
    `Migrated ${String(sourceFiles.length)} sources to ${String(allEntities.length)} entities.\n`
  );
};

await run();
