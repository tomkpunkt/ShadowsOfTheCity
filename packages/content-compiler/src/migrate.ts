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
const legacyRootDirectories = new Set([
  "bestiary",
  "classes",
  "feats",
  "gear",
  "lore",
  "races",
  "rules",
  "spells"
]);
const legacyRootMarkdownFiles = new Set(["README.md", "regelwerk_outline.md"]);

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
        if (directory === repositoryRoot && !legacyRootDirectories.has(entry.name)) {
          return [];
        }
        if (
          [
            ".git",
            "content",
            "docs",
            "node_modules",
            "packages",
            "apps",
            "dist",
            "release",
            "test-results",
            "playwright-report"
          ].includes(entry.name)
        ) {
          return [];
        }
        return findMarkdownFiles(absolute);
      }
      return entry.isFile() &&
        entry.name.endsWith(".md") &&
        (directory !== repositoryRoot || legacyRootMarkdownFiles.has(entry.name))
        ? [absolute]
        : [];
    })
  );
  return children.flat().sort((left, right) => left.localeCompare(right));
};

const readPreservedFiles = async (
  directory: string
): Promise<Array<{ relativePath: string; source: string }>> => {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map(async (entry): Promise<Array<{ relativePath: string; source: string }>> => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return (await readPreservedFiles(absolutePath)).map((file) => ({
          relativePath: path.join(entry.name, file.relativePath),
          source: file.source
        }));
      }
      return entry.isFile()
        ? [{ relativePath: entry.name, source: await readFile(absolutePath, "utf8") }]
        : [];
    })
  );
  return nested.flat().sort((left, right) => left.relativePath.localeCompare(right.relativePath));
};

const allEntities: ContentEntity[] = [];
const entitiesById = new Map<string, ContentEntity>();
const manifestByPath = new Map<string, ManifestSource>();

const formalizedEffects: Record<string, unknown[]> = {
  "feat.general.reflextraining": [
    {
      kind: "value",
      target: "save",
      selector: "reflex",
      operation: "add",
      value: 1,
      bonusType: "untyped"
    }
  ],
  "feat.general.verbesserte-wahrnehmung": [
    {
      kind: "value",
      target: "perception",
      operation: "add",
      value: 2,
      bonusType: "untyped"
    }
  ],
  "feat.general.mechaniker": [
    {
      kind: "value",
      target: "skill",
      selector: "skill.technology",
      operation: "add",
      value: 2,
      bonusType: "untyped"
    }
  ],
  "feat.class.wachter.wachsamkeit": [
    {
      kind: "value",
      target: "perception",
      operation: "add",
      value: 1,
      bonusType: "untyped"
    },
    {
      kind: "value",
      target: "initiative",
      operation: "add",
      value: 1,
      bonusType: "untyped"
    }
  ],
  "feat.class.soldner.veteraneninstinkt": [
    {
      kind: "value",
      target: "perception",
      operation: "add",
      value: 1,
      bonusType: "untyped"
    },
    {
      kind: "value",
      target: "initiative",
      operation: "add",
      value: 1,
      bonusType: "untyped"
    }
  ],
  "class-feature.agent.schnelle-reaktion": [
    {
      kind: "value",
      target: "initiative",
      operation: "add",
      value: 2,
      bonusType: "untyped"
    }
  ],
  "class-feature.soldner.kriegsinstinkt": [
    {
      kind: "value",
      target: "initiative",
      operation: "add",
      value: 2,
      bonusType: "untyped"
    }
  ],
  "class-feature.agent.spionageausbildung": [
    {
      kind: "proficiency-rule",
      proficiencyId: "skill.stealth",
      operation: "at-least",
      rank: "trained"
    },
    {
      kind: "proficiency-rule",
      proficiencyId: "skill.deception",
      operation: "at-least",
      rank: "trained"
    },
    {
      kind: "proficiency-rule",
      proficiencyId: "skill.society",
      operation: "at-least",
      rank: "trained"
    }
  ],
  "class-feature.agent.vorgehensweise.manipulator": [
    {
      kind: "proficiency-rule",
      proficiencyId: "skill.diplomacy",
      operation: "increase",
      steps: 1
    },
    {
      kind: "proficiency-rule",
      proficiencyId: "skill.deception",
      operation: "increase",
      steps: 1
    }
  ],
  "class-feature.magier.arkanes-studium": [
    {
      kind: "proficiency-rule",
      proficiencyId: "skill.arcana",
      operation: "at-least",
      rank: "trained"
    },
    {
      kind: "proficiency-rule",
      proficiencyId: "skill.science",
      operation: "at-least",
      rank: "trained"
    }
  ],
  "class-feature.mediziner.medizinische-ausbildung": [
    {
      kind: "proficiency-rule",
      proficiencyId: "skill.medicine",
      operation: "at-least",
      rank: "trained"
    },
    {
      kind: "proficiency-rule",
      proficiencyId: "skill.science",
      operation: "at-least",
      rank: "trained"
    }
  ],
  "class-feature.schamane.ahnenverbindung": [
    {
      kind: "proficiency-rule",
      proficiencyId: "skill.religion",
      operation: "at-least",
      rank: "trained"
    },
    {
      kind: "proficiency-rule",
      proficiencyId: "skill.survival",
      operation: "at-least",
      rank: "trained"
    }
  ],
  "heritage.elf.hochhaus-erbe": [
    {
      kind: "value",
      target: "skill",
      selector: "skill.society",
      operation: "add",
      value: 1,
      bonusType: "untyped"
    },
    {
      kind: "value",
      target: "skill",
      selector: "skill.diplomacy",
      operation: "add",
      value: 1,
      bonusType: "untyped"
    }
  ],
  "heritage.mensch.verdrangter": [
    {
      kind: "value",
      target: "skill",
      selector: "skill.stealth",
      operation: "add",
      value: 1,
      bonusType: "untyped"
    },
    {
      kind: "value",
      target: "skill",
      selector: "skill.deception",
      operation: "add",
      value: 1,
      bonusType: "untyped"
    }
  ],
  "heritage.elf.verborgener-wachter": [
    {
      kind: "proficiency-rule",
      proficiencyId: "skill.stealth",
      operation: "at-least",
      rank: "trained"
    },
    {
      kind: "proficiency-rule",
      proficiencyId: "proficiency.perception",
      operation: "at-least",
      rank: "trained"
    }
  ],
  "heritage.elf.waldhuter-der-dammerung": [
    {
      kind: "proficiency-rule",
      proficiencyId: "skill.survival",
      operation: "at-least",
      rank: "trained"
    },
    { kind: "grant", grantType: "spell", id: "spell.nachricht" }
  ],
  "class-feature.magier.schule-der-magie.schule-der-erkenntnis": [
    { kind: "grant", grantType: "spell", id: "spell.magie-erkennen" },
    {
      kind: "value",
      target: "skill",
      selector: "skill.arcana",
      operation: "add",
      value: 1,
      bonusType: "untyped"
    },
    {
      kind: "value",
      target: "perception",
      operation: "add",
      value: 1,
      bonusType: "untyped"
    }
  ],
  "class-feature.magier.schule-der-magie.schule-des-schutzes": [
    { kind: "grant", grantType: "spell", id: "spell.schutzschild" }
  ],
  "feat.general.zahigkeit": [
    {
      kind: "value",
      target: "hit-points",
      operation: "add",
      value: 1,
      scale: "per-level"
    }
  ]
};

const applyFormalization = (entity: ContentEntity): ContentEntity => {
  const additions = formalizedEffects[entity.id];
  if (!("effects" in entity)) {
    return entity;
  }
  const effects = entity.effects.map((effect): unknown => {
    if (
      effect !== null &&
      typeof effect === "object" &&
      "kind" in effect &&
      effect.kind === "skill-training" &&
      "skillId" in effect &&
      "rank" in effect
    ) {
      return {
        kind: "proficiency-rule",
        proficiencyId: effect.skillId,
        operation: "at-least",
        rank: effect.rank
      };
    }
    if (
      entity.id === "feat.general.zahigkeit" &&
      effect !== null &&
      typeof effect === "object" &&
      "kind" in effect &&
      effect.kind === "text"
    ) {
      return {
        ...(effect as Record<string, unknown>),
        classification: "requires-rules-decision",
        decisionId: "rules-decision.feat.zahigkeit-prerequisite"
      };
    }
    return effect;
  });
  return ContentEntitySchema.parse({
    ...entity,
    ...(entity.id === "feat.general.zahigkeit"
      ? { status: "draft", editorialStatus: "needs-rules-decision" }
      : {}),
    effects: [...(additions ?? []), ...effects]
  });
};

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
  let summary =
    typeof input["summary"] === "string" ? input["summary"] : deriveEntitySummary(input, body);
  if (allEntities.some((entity) => entity.summary === summary)) {
    summary = `${input.name}: ${summary}`;
  }
  const sourceRulesText = typeof input["rulesText"] === "string" ? input["rulesText"] : body.trim();
  const candidate = applyFormalization(
    ContentEntitySchema.parse({
      schemaVersion: SCHEMA_VERSION,
      source: sourceId,
      status: "legacy",
      traits: [],
      references: [],
      ...input,
      summary,
      rulesText: sourceRulesText.length >= 20 ? sourceRulesText : summary,
      editorialStatus:
        typeof input["editorialStatus"] === "string" ? input["editorialStatus"] : "reviewed",
      description: body.trim(),
      legacy: {
        paths: normalizedPaths,
        notes: options.warnings ?? []
      }
    })
  );
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

const textEffect = (
  text: string,
  classification: "partially-structured" | "display-only" | "requires-rules-decision",
  decisionId?: string
): Record<string, unknown> => ({
  kind: "text",
  text: normalizeText(text).slice(0, 2000) || "Siehe erhaltene Beschreibung.",
  machineReadable: false,
  classification,
  ...(decisionId === undefined ? {} : { decisionId })
});

const migrateSupportingEntities = (): void => {
  const sourcePath = "rules/core_mechanics.md";
  const skills: Array<[string, string, string, string, string]> = [
    [
      "athletics",
      "Athletik",
      "strength",
      "Athletik nutzt Stärke für Klettern, Springen, Schwimmen und andere Kraftleistungen gegen körperlichen Widerstand.",
      "Setze Athletik ein, wenn rohe Kraft und kontrollierte Bewegung über ein Hindernis entscheiden. Die Fertigkeit verwendet Stärke als typisches Attribut."
    ],
    [
      "acrobatics",
      "Akrobatik",
      "dexterity",
      "Akrobatik nutzt Geschicklichkeit für Balance, kontrollierte Stürze und präzise Bewegung durch gefährliches Gelände.",
      "Setze Akrobatik ein, wenn Gleichgewicht, Körperkontrolle oder eine sichere Bewegung auf engem Raum gefragt sind. Die Fertigkeit verwendet Geschicklichkeit."
    ],
    [
      "stealth",
      "Heimlichkeit",
      "dexterity",
      "Heimlichkeit nutzt Geschicklichkeit, um ungesehen zu bleiben, Deckung auszunutzen und leise an Beobachtern vorbeizukommen.",
      "Setze Heimlichkeit ein, wenn eine Figur Sichtlinien meidet, Geräusche dämpft oder sich unbemerkt nähert. Die Fertigkeit verwendet Geschicklichkeit."
    ],
    [
      "driving",
      "Fahrzeugführung",
      "dexterity",
      "Fahrzeugführung nutzt Geschicklichkeit, um Fahrzeuge unter Zeitdruck, bei hoher Geschwindigkeit oder in schwierigem Gelände zu kontrollieren.",
      "Setze Fahrzeugführung für riskante Manöver, Verfolgungen und das Beherrschen beschädigter Fahrzeuge ein. Gewöhnliche Fahrten benötigen nicht automatisch eine Probe."
    ],
    [
      "persuasion",
      "Überzeugen",
      "charisma",
      "Überzeugen nutzt Charisma, um andere mit nachvollziehbaren Argumenten, Auftreten und persönlichen Appellen zu einer Handlung zu bewegen.",
      "Setze Überzeugen ein, wenn eine Figur freiwillige Zustimmung erreichen will. Die Fertigkeit ersetzt weder Zwang noch eine verbindliche Abmachung."
    ],
    [
      "intimidation",
      "Einschüchtern",
      "charisma",
      "Einschüchtern nutzt Charisma, um durch Drohungen, Dominanz oder gezielte Furcht kurzfristigen Druck aufzubauen.",
      "Setze Einschüchtern ein, wenn eine Figur Gehorsam durch glaubhafte Konsequenzen erzwingen will. Die Reaktion des Ziels bleibt von Situation und Risiko abhängig."
    ],
    [
      "diplomacy",
      "Diplomatie",
      "charisma",
      "Diplomatie nutzt Charisma, um Interessen auszuhandeln, Spannungen zu entschärfen und tragfähige Vereinbarungen zwischen Parteien zu erreichen.",
      "Setze Diplomatie für Verhandlungen, Vermittlung und formelle Gespräche ein. Die Fertigkeit wirkt über Austausch und Kompromiss, nicht über Täuschung."
    ],
    [
      "deception",
      "Täuschen",
      "charisma",
      "Täuschen nutzt Charisma, um glaubhafte Lügen, falsche Rollen oder irreführende Eindrücke gegenüber anderen aufrechtzuerhalten.",
      "Setze Täuschen ein, wenn eine Figur Informationen verbirgt oder eine falsche Darstellung glaubhaft macht. Beweise und Vorwissen können die Täuschung erschweren."
    ],
    [
      "science",
      "Wissenschaft",
      "intelligence",
      "Wissenschaft nutzt Intelligenz, um naturwissenschaftliche Befunde auszuwerten, Hypothesen zu prüfen und Laborergebnisse einzuordnen.",
      "Setze Wissenschaft für Analyse, Forschung und die Interpretation messbarer Phänomene ein. Die Fertigkeit deckt keine praktische Reparatur technischer Geräte ab."
    ],
    [
      "technology",
      "Technologie",
      "intelligence",
      "Technologie nutzt Intelligenz, um moderne Geräte, digitale Systeme und technische Infrastrukturen zu verstehen und zielgerichtet einzusetzen.",
      "Setze Technologie für Bedienung, Diagnose und konzeptionelles Verständnis elektronischer Systeme ein. Handwerkliche Reparaturen fallen vorrangig unter Mechanik."
    ],
    [
      "magic",
      "Magie",
      "intelligence",
      "Magie nutzt Intelligenz, um allgemeine übernatürliche Phänomene, Zauberwirkungen und Störungen des Geflechts zu untersuchen.",
      "Setze Magie für breit angelegte Analyse übernatürlicher Vorgänge ein, wenn weder eine eindeutig arkane noch religiöse Tradition allein zuständig ist."
    ],
    [
      "society",
      "Gesellschaft",
      "intelligence",
      "Gesellschaft nutzt Intelligenz für Wissen über Institutionen, soziale Schichten, Konzerne, Gesetze und urbane Machtstrukturen.",
      "Setze Gesellschaft ein, um Organisationen, Gebräuche, politische Verbindungen oder rechtliche Abläufe einzuordnen."
    ],
    [
      "survival",
      "Überleben",
      "wisdom",
      "Überleben nutzt Weisheit, um Spuren zu lesen, Gefahren der Umgebung zu erkennen und außerhalb sicherer Infrastruktur handlungsfähig zu bleiben.",
      "Setze Überleben für Orientierung, Nahrungssuche, Wetterbeurteilung und das Verfolgen von Spuren ein. Die Fertigkeit verwendet Weisheit."
    ],
    [
      "medicine",
      "Medizin",
      "wisdom",
      "Medizin nutzt Weisheit, um Verletzungen zu beurteilen, Erste Hilfe zu leisten und die Versorgung kranker oder verwundeter Personen zu planen.",
      "Setze Medizin für Diagnose und Behandlung ein. Umfang, Materialbedarf und Zeit richten sich nach der konkreten medizinischen Handlung."
    ],
    [
      "detect-magic",
      "Magie erkennen",
      "wisdom",
      "Magie erkennen nutzt Weisheit, um übernatürliche Auren, aktive Wirkungen und auffällige Veränderungen im Geflecht wahrzunehmen.",
      "Setze Magie erkennen ein, wenn eine Figur ihre Sinne gezielt auf magische Präsenz richtet. Die Fertigkeit ersetzt nicht die genaue Analyse durch Arkane Kunde."
    ],
    [
      "crafting",
      "Handwerk",
      "intelligence",
      "Handwerk nutzt Intelligenz, um Gegenstände nach einem bekannten Verfahren herzustellen, anzupassen oder fachgerecht zu beurteilen.",
      "Setze Handwerk ein, wenn Materialwahl, Fertigungswissen und planmäßige Bearbeitung entscheidend sind. Benötigte Werkzeuge und Zeit hängen vom Werkstück ab."
    ],
    [
      "mechanics",
      "Mechanik",
      "intelligence",
      "Mechanik nutzt Intelligenz, um Maschinen zu warten, Defekte einzugrenzen und mechanische oder mechatronische Systeme zu reparieren.",
      "Setze Mechanik für praktische Diagnose, Wartung und Reparatur ein. Reine Bedienung oder theoretische Systemkunde fällt eher unter Technologie."
    ],
    [
      "religion",
      "Religion",
      "wisdom",
      "Religion nutzt Weisheit für Kulte, Glaubenslehren, heilige Zeichen und die Einordnung göttlicher oder dämonischer Einflüsse.",
      "Setze Religion ein, um Rituale, Glaubensgemeinschaften und religiös geprägte übernatürliche Vorgänge zu verstehen."
    ],
    [
      "arcana",
      "Arkane Kunde",
      "intelligence",
      "Arkane Kunde nutzt Intelligenz, um Zauberformeln, magische Traditionen und die Struktur arkaner Wirkungen präzise zu analysieren.",
      "Setze Arkane Kunde für formale Magietheorie, Zauberschriften und die Identifikation arkaner Mechanismen ein."
    ]
  ];
  for (const [id, name, attribute, summary, rulesText] of skills) {
    addEntity(
      {
        id: `skill.${id}`,
        type: "skill",
        name,
        attribute,
        summary,
        rulesText,
        editorialStatus: "rewritten"
      },
      [sourcePath],
      rulesText,
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
              effects: [textEffect(sectionBody(document, optionHeading), "partially-structured")],
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
          `Wähle für ${className} eine Option der Klassenfunktion ${featureName}.`
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
          effects: [textEffect(sectionBody(document, featureHeading), "partially-structured")],
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
          effects: [textEffect(effectText ?? featName, "partially-structured")]
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
        `Wähle auf Stufe ${String(level)} ein verfügbares ${className}-Talent, dessen Stufe nicht über deiner aktuellen Stufe liegt.`
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
          effects: [textEffect(sectionBody(document, archetypeHeading), "partially-structured")]
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
          effects: [textEffect(sectionBody(document, featureHeading), "partially-structured")]
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
          effects: [textEffect(sectionBody(document, featHeading), "partially-structured")]
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
          effects: [textEffect(sectionBody(document, heritageHeading), "partially-structured")]
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
        `Wähle auf Stufe ${String(level)} ein verfügbares ${name}-Talent, dessen Stufe nicht über deiner aktuellen Stufe liegt.`
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
          effects: [textEffect(effectText ?? name, "partially-structured")]
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
        effects: [textEffect(document.source, "partially-structured")],
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

interface ItemClassification {
  category: string;
  subcategory: string;
  technologyLevel: string;
  availability: string;
  origins: string[];
  traits?: string[];
}

const weaponClassifications: Record<string, ItemClassification> = {
  "1-bogen": {
    category: "weapon",
    subcategory: "magical-weapon",
    technologyLevel: "magitech",
    availability: "licensed",
    origins: ["civilian", "occult"],
    traits: ["trait.item.silent"]
  },
  "1-gewehr": {
    category: "weapon",
    subcategory: "firearm",
    technologyLevel: "magitech",
    availability: "licensed",
    origins: ["corporate", "occult"]
  },
  "1-pistole": {
    category: "weapon",
    subcategory: "firearm",
    technologyLevel: "magitech",
    availability: "licensed",
    origins: ["corporate", "occult"],
    traits: ["trait.item.concealable"]
  },
  "1-schwert": {
    category: "weapon",
    subcategory: "magical-weapon",
    technologyLevel: "magitech",
    availability: "licensed",
    origins: ["occult"]
  },
  "1-waffe": {
    category: "weapon",
    subcategory: "magical-weapon",
    technologyLevel: "arcane",
    availability: "licensed",
    origins: ["occult"]
  },
  "2-waffe": {
    category: "weapon",
    subcategory: "magical-weapon",
    technologyLevel: "arcane",
    availability: "licensed",
    origins: ["occult"]
  },
  "3-waffe": {
    category: "weapon",
    subcategory: "magical-weapon",
    technologyLevel: "arcane",
    availability: "licensed",
    origins: ["occult"]
  },
  armbrust: {
    category: "weapon",
    subcategory: "ranged-weapon",
    technologyLevel: "archaic",
    availability: "registered",
    origins: ["civilian"]
  },
  axt: {
    category: "weapon",
    subcategory: "melee-weapon",
    technologyLevel: "archaic",
    availability: "registered",
    origins: ["civilian", "industrial"]
  },
  blitzpistole: {
    category: "weapon",
    subcategory: "energy-weapon",
    technologyLevel: "high-tech",
    availability: "licensed",
    origins: ["corporate"],
    traits: ["trait.item.concealable"]
  },
  blitzwaffe: {
    category: "weapon",
    subcategory: "magical-weapon",
    technologyLevel: "arcane",
    availability: "licensed",
    origins: ["occult"]
  },
  bogen: {
    category: "weapon",
    subcategory: "ranged-weapon",
    technologyLevel: "archaic",
    availability: "registered",
    origins: ["civilian"],
    traits: ["trait.item.silent"]
  },
  damonenjager: {
    category: "weapon",
    subcategory: "magical-weapon",
    technologyLevel: "arcane",
    availability: "black-market",
    origins: ["occult", "otherworldly"]
  },
  dolch: {
    category: "weapon",
    subcategory: "thrown-weapon",
    technologyLevel: "archaic",
    availability: "registered",
    origins: ["civilian", "street"],
    traits: ["trait.item.concealable"]
  },
  eisbogen: {
    category: "weapon",
    subcategory: "magical-weapon",
    technologyLevel: "arcane",
    availability: "licensed",
    origins: ["occult"],
    traits: ["trait.item.silent"]
  },
  eiswaffe: {
    category: "weapon",
    subcategory: "magical-weapon",
    technologyLevel: "arcane",
    availability: "licensed",
    origins: ["occult"]
  },
  "elektroschock-stab": {
    category: "weapon",
    subcategory: "energy-weapon",
    technologyLevel: "high-tech",
    availability: "licensed",
    origins: ["corporate", "governmental"],
    traits: ["trait.item.concealable"]
  },
  erdwaffe: {
    category: "weapon",
    subcategory: "magical-weapon",
    technologyLevel: "arcane",
    availability: "licensed",
    origins: ["occult"]
  },
  feuerklinge: {
    category: "weapon",
    subcategory: "magical-weapon",
    technologyLevel: "arcane",
    availability: "licensed",
    origins: ["occult"]
  },
  feuerwaffe: {
    category: "weapon",
    subcategory: "magical-weapon",
    technologyLevel: "arcane",
    availability: "licensed",
    origins: ["occult"]
  },
  geisterjager: {
    category: "weapon",
    subcategory: "magical-weapon",
    technologyLevel: "arcane",
    availability: "black-market",
    origins: ["occult", "otherworldly"]
  },
  gewehr: {
    category: "weapon",
    subcategory: "firearm",
    technologyLevel: "conventional",
    availability: "licensed",
    origins: ["civilian", "governmental"]
  },
  hammer: {
    category: "weapon",
    subcategory: "melee-weapon",
    technologyLevel: "archaic",
    availability: "registered",
    origins: ["industrial"]
  },
  hellebarde: {
    category: "weapon",
    subcategory: "melee-weapon",
    technologyLevel: "archaic",
    availability: "licensed",
    origins: ["military"]
  },
  keule: {
    category: "weapon",
    subcategory: "melee-weapon",
    technologyLevel: "archaic",
    availability: "registered",
    origins: ["street"]
  },
  konstruktjager: {
    category: "weapon",
    subcategory: "magical-weapon",
    technologyLevel: "magitech",
    availability: "black-market",
    origins: ["occult", "corporate"]
  },
  kriegshammer: {
    category: "weapon",
    subcategory: "melee-weapon",
    technologyLevel: "archaic",
    availability: "licensed",
    origins: ["military"]
  },
  messer: {
    category: "weapon",
    subcategory: "melee-weapon",
    technologyLevel: "archaic",
    availability: "registered",
    origins: ["civilian", "street"],
    traits: ["trait.item.concealable"]
  },
  pistole: {
    category: "weapon",
    subcategory: "firearm",
    technologyLevel: "conventional",
    availability: "licensed",
    origins: ["civilian", "governmental"],
    traits: ["trait.item.concealable"]
  },
  "plasma-schwert": {
    category: "weapon",
    subcategory: "energy-weapon",
    technologyLevel: "high-tech",
    availability: "licensed",
    origins: ["corporate", "military"]
  },
  revolver: {
    category: "weapon",
    subcategory: "firearm",
    technologyLevel: "conventional",
    availability: "licensed",
    origins: ["civilian", "street"],
    traits: ["trait.item.concealable"]
  },
  schlagstock: {
    category: "weapon",
    subcategory: "melee-weapon",
    technologyLevel: "conventional",
    availability: "registered",
    origins: ["governmental", "street"]
  },
  schrotflinte: {
    category: "weapon",
    subcategory: "firearm",
    technologyLevel: "conventional",
    availability: "licensed",
    origins: ["civilian", "military"]
  },
  schwert: {
    category: "weapon",
    subcategory: "melee-weapon",
    technologyLevel: "archaic",
    availability: "registered",
    origins: ["civilian", "military"]
  },
  seelenfanger: {
    category: "weapon",
    subcategory: "magical-weapon",
    technologyLevel: "arcane",
    availability: "illegal",
    origins: ["criminal", "occult", "otherworldly"]
  },
  speer: {
    category: "weapon",
    subcategory: "thrown-weapon",
    technologyLevel: "archaic",
    availability: "registered",
    origins: ["civilian", "military"]
  },
  "vibro-klinge": {
    category: "weapon",
    subcategory: "energy-weapon",
    technologyLevel: "high-tech",
    availability: "licensed",
    origins: ["corporate", "military"]
  },
  wurfmesser: {
    category: "weapon",
    subcategory: "thrown-weapon",
    technologyLevel: "archaic",
    availability: "registered",
    origins: ["street"],
    traits: ["trait.item.concealable"]
  },
  zweihandaxt: {
    category: "weapon",
    subcategory: "melee-weapon",
    technologyLevel: "archaic",
    availability: "licensed",
    origins: ["military"]
  },
  zweihandschwert: {
    category: "weapon",
    subcategory: "melee-weapon",
    technologyLevel: "archaic",
    availability: "licensed",
    origins: ["military"]
  }
};

const armorClassifications: Record<string, ItemClassification> = {
  "cyborg-rustung": {
    category: "armor",
    subcategory: "heavy-armor",
    technologyLevel: "biotech",
    availability: "restricted",
    origins: ["corporate", "medical"]
  },
  kettenhemd: {
    category: "armor",
    subcategory: "medium-armor",
    technologyLevel: "archaic",
    availability: "registered",
    origins: ["civilian", "military"]
  },
  leder: {
    category: "armor",
    subcategory: "light-armor",
    technologyLevel: "archaic",
    availability: "common",
    origins: ["civilian"]
  },
  "magische-rustung": {
    category: "armor",
    subcategory: "magical-protection",
    technologyLevel: "arcane",
    availability: "licensed",
    origins: ["occult"]
  },
  "magische-vollrustung": {
    category: "armor",
    subcategory: "magical-protection",
    technologyLevel: "arcane",
    availability: "licensed",
    origins: ["occult", "military"]
  },
  "moderne-kleidung": {
    category: "protective-clothing",
    subcategory: "light-armor",
    technologyLevel: "conventional",
    availability: "common",
    origins: ["civilian"]
  },
  "moderne-rustung": {
    category: "armor",
    subcategory: "medium-armor",
    technologyLevel: "conventional",
    availability: "registered",
    origins: ["governmental", "corporate"]
  },
  "moderne-vollrustung": {
    category: "armor",
    subcategory: "heavy-armor",
    technologyLevel: "high-tech",
    availability: "licensed",
    origins: ["military", "corporate"]
  },
  plattenrustung: {
    category: "armor",
    subcategory: "medium-armor",
    technologyLevel: "archaic",
    availability: "licensed",
    origins: ["military"]
  },
  stoff: {
    category: "protective-clothing",
    subcategory: "light-armor",
    technologyLevel: "archaic",
    availability: "common",
    origins: ["civilian", "street"]
  },
  tarnkleidung: {
    category: "protective-clothing",
    subcategory: "camouflage-clothing",
    technologyLevel: "conventional",
    availability: "licensed",
    origins: ["military", "street"]
  },
  vollplatte: {
    category: "armor",
    subcategory: "heavy-armor",
    technologyLevel: "archaic",
    availability: "licensed",
    origins: ["military"]
  }
};

interface EquipmentEditorial extends ItemClassification {
  summary: string;
  limitations?: string;
}

const equipmentEditorial: Record<string, EquipmentEditorial> = {
  anzug: {
    category: "everyday",
    subcategory: "clothing",
    technologyLevel: "conventional",
    availability: "common",
    origins: ["civilian", "corporate"],
    summary:
      "Ein gepflegter Anzug unterstützt Diplomatie und Überzeugen jeweils mit +1, wenn formelles Auftreten in der Situation relevant ist."
  },
  arbeitskleidung: {
    category: "protective-clothing",
    subcategory: "clothing",
    technologyLevel: "conventional",
    availability: "common",
    origins: ["industrial"],
    summary:
      "Robuste Arbeitskleidung unterstützt Ausdauer und praktische Tätigkeiten jeweils mit +1 und ist für belastende Arbeitsumgebungen ausgelegt."
  },
  artefakt: {
    category: "magical-item",
    subcategory: "arcane-focus",
    technologyLevel: "arcane",
    availability: "unique",
    origins: ["occult", "otherworldly"],
    summary:
      "Das Artefakt verstärkt Magie mit +4; die zusätzlich genannte Spezialwirkung ist in der Quelle nicht fachlich definiert.",
    limitations:
      "Die Bedeutung des Quellenwerts „Spezial +4“ benötigt eine fachliche Regelentscheidung und wird nicht automatisch berechnet."
  },
  auto: {
    category: "vehicle",
    subcategory: "vehicle",
    technologyLevel: "conventional",
    availability: "registered",
    origins: ["civilian", "corporate"],
    summary:
      "Ein Auto ermöglicht schnellen individuellen Straßenverkehr und transportiert Personen sowie Ausrüstung innerhalb des befahrbaren Stadtgebiets."
  },
  computer: {
    category: "electronics",
    subcategory: "computer",
    technologyLevel: "high-tech",
    availability: "common",
    origins: ["civilian", "corporate"],
    summary:
      "Ein Computer verarbeitet und speichert digitale Daten und dient als stationäre Arbeitsplattform für technische oder wissenschaftliche Aufgaben."
  },
  fahrrad: {
    category: "vehicle",
    subcategory: "vehicle",
    technologyLevel: "conventional",
    availability: "common",
    origins: ["civilian", "street"],
    summary:
      "Ein Fahrrad ermöglicht langsamen, leisen Straßenverkehr ohne Treibstoff und bleibt auch bei eingeschränkter Infrastruktur nutzbar.",
    traits: ["trait.item.silent"]
  },
  funkgerat: {
    category: "communication",
    subcategory: "communication-device",
    technologyLevel: "conventional",
    availability: "common",
    origins: ["civilian", "governmental"],
    summary:
      "Ein Funkgerät überträgt Sprache über kurze Entfernung und ermöglicht direkte Kommunikation ohne vorhandenes Telefonnetz."
  },
  "jeans-und-t-shirt": {
    category: "everyday",
    subcategory: "clothing",
    technologyLevel: "conventional",
    availability: "common",
    origins: ["civilian", "street"],
    summary:
      "Jeans und T-Shirt bieten unauffällige Alltagskleidung und unterstützen Beweglichkeit sowie Komfort jeweils mit +1."
  },
  kamera: {
    category: "surveillance",
    subcategory: "surveillance-device",
    technologyLevel: "conventional",
    availability: "common",
    origins: ["civilian", "corporate"],
    summary:
      "Eine Kamera zeichnet sichtbare Vorgänge auf und liefert Bildmaterial für Dokumentation, Beweissicherung oder Überwachung.",
    traits: ["trait.item.traceable"]
  },
  kleid: {
    category: "everyday",
    subcategory: "clothing",
    technologyLevel: "conventional",
    availability: "common",
    origins: ["civilian"],
    summary:
      "Ein elegantes Kleid unterstützt Charisma und gesellschaftlich relevantes Auftreten jeweils mit +1."
  },
  krauter: {
    category: "medical",
    subcategory: "medical-supply",
    technologyLevel: "archaic",
    availability: "common",
    origins: ["medical", "occult"],
    summary:
      "Ausgewählte Kräuter unterstützen Heilung und Naturkunde jeweils mit +1, wenn ihre medizinische oder rituelle Verwendung passt."
  },
  kristalle: {
    category: "magical-item",
    subcategory: "arcane-focus",
    technologyLevel: "arcane",
    availability: "licensed",
    origins: ["occult"],
    summary:
      "Magisch geeignete Kristalle bündeln Konzentration und unterstützen Magie sowie Fokus jeweils mit +1."
  },
  kristallkugel: {
    category: "magical-item",
    subcategory: "arcane-focus",
    technologyLevel: "arcane",
    availability: "restricted",
    origins: ["occult"],
    summary:
      "Eine Kristallkugel dient als Fokus für Wahrsagerei und unterstützt Magie sowie entsprechende Deutungen jeweils mit +2."
  },
  "magische-robe": {
    category: "magical-item",
    subcategory: "clothing",
    technologyLevel: "arcane",
    availability: "licensed",
    origins: ["occult"],
    summary:
      "Eine magische Robe unterstützt Magie und Konzentrationsfokus jeweils mit +2, solange sie als rituelle Kleidung getragen wird."
  },
  metalle: {
    category: "tool",
    subcategory: "crafting-material",
    technologyLevel: "conventional",
    availability: "common",
    origins: ["industrial"],
    summary:
      "Bearbeitbare Metalle unterstützen Konstruktion und Haltbarkeit jeweils mit +1, wenn sie als Werkstoff in einem passenden Projekt eingesetzt werden."
  },
  mikrofon: {
    category: "surveillance",
    subcategory: "surveillance-device",
    technologyLevel: "conventional",
    availability: "common",
    origins: ["civilian", "corporate"],
    summary:
      "Ein Mikrofon erfasst Schall und ermöglicht Tonaufzeichnung, Übertragung oder akustische Überwachung.",
    traits: ["trait.item.traceable"]
  },
  motorrad: {
    category: "vehicle",
    subcategory: "vehicle",
    technologyLevel: "conventional",
    availability: "registered",
    origins: ["civilian", "street"],
    summary:
      "Ein Motorrad ermöglicht schnellen individuellen Straßenverkehr und bleibt in dichtem Stadtverkehr besonders beweglich."
  },
  "offentliche-verkehrsmittel": {
    category: "service",
    subcategory: "transit-service",
    technologyLevel: "conventional",
    availability: "common",
    origins: ["civilian", "governmental"],
    summary:
      "Öffentliche Verkehrsmittel bieten planmäßigen Massentransport durch erschlossene Stadtgebiete; der Preis bildet die Nutzung des Dienstes ab."
  },
  "organische-materialien": {
    category: "tool",
    subcategory: "crafting-material",
    technologyLevel: "biotech",
    availability: "restricted",
    origins: ["medical", "industrial"],
    summary:
      "Organische Materialien unterstützen Biologie und Arbeiten an lebenden Systemen jeweils mit +1, sofern das Material zum Vorhaben passt."
  },
  ritualkreis: {
    category: "magical-item",
    subcategory: "ritual-tool",
    technologyLevel: "arcane",
    availability: "restricted",
    origins: ["occult"],
    summary:
      "Ein vorbereiteter Ritualkreis unterstützt Magie und Rituale jeweils mit +3, wenn die Handlung innerhalb seiner Anordnung ausgeführt wird."
  },
  scanner: {
    category: "electronics",
    subcategory: "sensor",
    technologyLevel: "high-tech",
    availability: "restricted",
    origins: ["corporate", "governmental"],
    summary:
      "Ein Scanner untersucht seine Umgebung mit erweiterten Sensoren und unterstützt das Erkennen verborgener Signale oder ungewöhnlicher Stoffe."
  },
  schutzanzug: {
    category: "protective-clothing",
    subcategory: "protective-suit",
    technologyLevel: "conventional",
    availability: "restricted",
    origins: ["industrial", "medical"],
    summary:
      "Ein Schutzanzug gewährt +2 Rüstungsschutz und +2 Widerstand gegen passende Umwelt- oder Arbeitsgefahren."
  },
  sensor: {
    category: "electronics",
    subcategory: "sensor",
    technologyLevel: "high-tech",
    availability: "restricted",
    origins: ["corporate"],
    summary:
      "Ein Sensor überwacht festgelegte Messwerte und meldet automatisch, wenn er eine passende Veränderung oder Präsenz erkennt."
  },
  tablet: {
    category: "electronics",
    subcategory: "computer",
    technologyLevel: "high-tech",
    availability: "common",
    origins: ["civilian", "corporate"],
    summary:
      "Ein Tablet verarbeitet und speichert Daten in tragbarer Form und unterstützt mobile Recherche, Dokumentation und Systembedienung."
  },
  tarnkleidung: {
    category: "protective-clothing",
    subcategory: "clothing",
    technologyLevel: "conventional",
    availability: "restricted",
    origins: ["military", "street"],
    summary:
      "Tarnkleidung unterstützt Heimlichkeit und das Verschmelzen mit einer passenden Umgebung jeweils mit +2."
  },
  "techno-anzug": {
    category: "protective-clothing",
    subcategory: "protective-suit",
    technologyLevel: "high-tech",
    availability: "restricted",
    origins: ["corporate"],
    summary:
      "Ein Techno-Anzug unterstützt Technologie und die Arbeit über integrierte Schnittstellen jeweils mit +2."
  },
  telefon: {
    category: "communication",
    subcategory: "communication-device",
    technologyLevel: "high-tech",
    availability: "common",
    origins: ["civilian", "corporate"],
    summary:
      "Ein Telefon ermöglicht Sprach- und Datenkommunikation über große Entfernung, sofern ein erreichbares Netz verfügbar ist.",
    traits: ["trait.item.traceable"]
  },
  zauberstab: {
    category: "magical-item",
    subcategory: "arcane-focus",
    technologyLevel: "arcane",
    availability: "licensed",
    origins: ["occult"],
    summary:
      "Ein Zauberstab bündelt arkane Führung und unterstützt Magie sowie Fokus jeweils mit +1."
  }
};

const weaponModifierTemplates = new Set([
  "1-waffe",
  "2-waffe",
  "3-waffe",
  "blitzwaffe",
  "damonenjager",
  "eiswaffe",
  "erdwaffe",
  "feuerwaffe",
  "geisterjager",
  "konstruktjager",
  "seelenfanger"
]);

const damageTypeLabel = (id: string): string =>
  id === "damage.bludgeoning" ? "Wuchtschaden" : "Stichschaden";

const weaponUsageLabel = (subcategory: string): string =>
  ({
    "melee-weapon": "Nahkampfwaffe",
    "ranged-weapon": "Fernkampfwaffe",
    firearm: "Schusswaffe",
    "energy-weapon": "Energiewaffe",
    "thrown-weapon": "Wurfwaffe",
    "magical-weapon": "magische Waffe"
  })[subcategory] ?? "Waffe";

const technologyLabel = (technologyLevel: string): string =>
  ({
    archaic: "archaische",
    conventional: "konventionelle",
    "high-tech": "hochtechnologische",
    biotech: "biotechnologische",
    arcane: "arkane",
    magitech: "magitechbasierte"
  })[technologyLevel] ?? technologyLevel;

const armorUsageLabel = (subcategory: string): string =>
  ({
    "light-armor": "leichte Rüstung",
    "medium-armor": "mittelschwere Rüstung",
    "heavy-armor": "schwere Rüstung",
    "camouflage-clothing": "Tarnkleidung",
    "environmental-suit": "Umweltschutzkleidung",
    "magical-protection": "magische Schutzkleidung"
  })[subcategory] ?? "Rüstung";

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
    ["item.concealable", "Verbergbar", "equipment"],
    ["item.silent", "Leise", "equipment"],
    ["item.traceable", "Rückverfolgbar", "equipment"],
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
    const itemKey = slug(name);
    const classification = weaponClassifications[itemKey];
    if (classification === undefined) {
      throw new Error(`Missing weapon classification for ${name} (${itemKey})`);
    }
    const rangeText = ranged ? row[2] : undefined;
    const priceText = row.at(-1);
    const rangeMatch = rangeText?.match(/(\d+)\s*\/\s*(\d+)/);
    const damage = parseDamage(row[1]);
    const hands = /zweih|schwer/i.test(row.join(" ")) ? 2 : 1;
    const damageType = /stumpf/i.test(row.join(" ")) ? "damage.bludgeoning" : "damage.piercing";
    const modifierTemplate = weaponModifierTemplates.has(itemKey);
    const usage = weaponUsageLabel(classification.subcategory);
    const rangeRule =
      rangeMatch === null || rangeMatch === undefined
        ? "Sie besitzt keine in der Quelle angegebene Reichweite."
        : `Ihre Reichweitenstaffel beträgt ${rangeMatch[1]} Meter bis maximal ${rangeMatch[2]} Meter.`;
    const summary = modifierTemplate
      ? `${name} ist in der Quelle als Waffenmodifikation beschrieben: ${normalizeText(row[1] ?? "")}`
      : `${name} ist eine ${technologyLabel(classification.technologyLevel)} ${usage} mit ${damage.dice}${damage.die} ${damageTypeLabel(damageType)}${damage.flat > 0 ? ` und +${damage.flat} festem Schaden` : ""}.`;
    const rulesText = modifierTemplate
      ? `Die Quelle definiert ${name} ausschließlich als Modifikation: ${normalizeText(row[1] ?? "")} Eigenständige Grundwerte, Preis, Last, Hände und die genaue Anwendung auf eine Basiswaffe sind nicht festgelegt.`
      : `${name} verursacht ${damage.dice}${damage.die}${damage.flat > 0 ? `+${damage.flat}` : ""} ${damageTypeLabel(damageType)} und wird mit ${hands === 1 ? "einer Hand" : "zwei Händen"} geführt. ${rangeRule} Der Quellenpreis beträgt ${parsePrice(priceText)} GS; die vorläufig migrierte Last beträgt 1.`;
    addEntity(
      {
        id: `weapon.${itemKey}`,
        type: "weapon",
        name,
        ...(modifierTemplate ? { status: "draft" } : {}),
        editorialStatus: modifierTemplate ? "needs-rules-decision" : "rewritten",
        summary,
        rulesText,
        ...(modifierTemplate
          ? {
              limitations:
                "Diese Entität darf erst nach einer fachlichen Entscheidung zu Basiswaffe, Kosten und Anwendungslogik als eigenständiger Gegenstand angeboten werden."
            }
          : {}),
        level: 0,
        priceGp: parsePrice(priceText),
        bulk: 1,
        hands,
        category: classification.category,
        subcategory: classification.subcategory,
        technologyLevel: classification.technologyLevel,
        availability: classification.availability,
        origins: classification.origins,
        categoryId: ranged ? "trait.item.weapon.ranged" : "trait.item.weapon.simple",
        groupId: ranged ? "trait.weapon-group.projectile" : "trait.weapon-group.blade",
        damage: {
          ...damage,
          type: damageType
        },
        ...(rangeMatch === null || rangeMatch === undefined
          ? {}
          : {
              range: {
                increment: Number(rangeMatch[1]),
                maximum: Number(rangeMatch[2])
              }
            }),
        traits: ["trait.legacy", ...(classification.traits ?? [])]
      },
      [overview.relativePath, ...(melee.source.includes(name) ? [melee.relativePath] : [])],
      row.join(" | "),
      {
        warnings: modifierTemplate
          ? [
              "Die Quelle beschreibt diesen Eintrag als Waffenmodifikation, nicht als eigenständige Waffe."
            ]
          : [],
        manualFields: [
          "level",
          "bulk",
          "hands",
          "categoryId",
          "groupId",
          ...(modifierTemplate ? ["damage", "priceGp", "application"] : [])
        ]
      }
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
      const itemKey = slug(name);
      const classification = armorClassifications[itemKey];
      if (classification === undefined) {
        throw new Error(`Missing armor classification for ${name} (${itemKey})`);
      }
      const itemBonus = Number(row[1]?.match(/\d+/)?.[0] ?? 0);
      const dexterityCap = categoryId.endsWith("heavy") ? 0 : categoryId.endsWith("medium") ? 2 : 4;
      const bulk = categoryId.endsWith("heavy") ? 3 : categoryId.endsWith("medium") ? 2 : 1;
      const priceGp = parsePrice(row.at(-1));
      const usage = armorUsageLabel(classification.subcategory);
      addEntity(
        {
          id: `armor.${itemKey}`,
          type: "armor",
          name,
          editorialStatus: "rewritten",
          summary: `${name} ist eine ${technologyLabel(classification.technologyLevel)} ${usage} mit einem Rüstungsbonus von +${itemBonus}.`,
          rulesText: `${name} gewährt einen Gegenstandsbonus von +${itemBonus} auf die Rüstungsklasse. Der Geschicklichkeitsdeckel beträgt ${dexterityCap}, die Last ${bulk} und der Quellenpreis ${priceGp} GS.`,
          level: 0,
          priceGp,
          bulk,
          hands: 0,
          category: classification.category,
          subcategory: classification.subcategory,
          technologyLevel: classification.technologyLevel,
          availability: classification.availability,
          origins: classification.origins,
          categoryId,
          itemBonus,
          dexterityCap,
          traits: ["trait.legacy", ...(classification.traits ?? [])]
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
      const itemKey = slug(name);
      const editorial = equipmentEditorial[itemKey];
      if (editorial === undefined) {
        throw new Error(`Missing equipment classification for ${name} (${itemKey})`);
      }
      const needsRulesDecision = itemKey === "artefakt";
      const sourceEffect = normalizeText(row[1] ?? name);
      const priceGp = parsePrice(row.at(-1));
      const bulk = /auto|motorrad/i.test(name) ? 10 : 1;
      addEntity(
        {
          id: `equipment.${itemKey}`,
          type: "equipment",
          name,
          ...(needsRulesDecision ? { status: "draft" } : {}),
          editorialStatus: needsRulesDecision ? "needs-rules-decision" : "rewritten",
          summary: editorial.summary,
          rulesText: `${name}: ${sourceEffect} Der Quellenpreis beträgt ${priceGp} GS; die vorläufig migrierte Last beträgt ${bulk}.`,
          ...(editorial.limitations === undefined ? {} : { limitations: editorial.limitations }),
          level: 0,
          priceGp,
          bulk,
          hands: 0,
          category: editorial.category,
          subcategory: editorial.subcategory,
          technologyLevel: editorial.technologyLevel,
          availability: editorial.availability,
          origins: editorial.origins,
          categoryId,
          traits: ["trait.legacy", ...(editorial.traits ?? [])],
          effects: [
            textEffect(
              row[1] ?? name,
              needsRulesDecision ? "requires-rules-decision" : "display-only",
              needsRulesDecision ? "rules-decision.equipment.artefakt-special-plus-four" : undefined
            )
          ]
        },
        [overview.relativePath],
        row.join(" | "),
        {
          warnings: needsRulesDecision
            ? ["Die Bedeutung von „Spezial +4“ ist in der Quelle nicht definiert."]
            : [],
          manualFields: ["level", "bulk", "effects", ...(needsRulesDecision ? ["special"] : [])]
        }
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
        effects: [textEffect(candidate.body, "partially-structured")]
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
  const backgrounds: Array<[string, string, string[], string, string, string]> = [
    [
      "corporate-child",
      "Konzernkind",
      ["intelligence", "charisma"],
      "skill.society",
      "Als Konzernkind kennst du Hierarchien, Verhandlungen und die ungeschriebenen Regeln mächtiger Unternehmen aus eigener Erfahrung.",
      "Du bist zwischen Zugangskarten, Vorstandsetagen und sorgfältig gepflegten Netzwerken aufgewachsen; Privilegien öffnen Türen, machen dich aber auch sichtbar."
    ],
    [
      "worker",
      "Arbeiter",
      ["strength", "constitution"],
      "skill.crafting",
      "Als Arbeiter verbindest du körperliche Belastbarkeit mit praktischer Fertigungserfahrung aus Werkstatt, Baustelle oder Produktion.",
      "Schichtpläne, Sicherheitsvorschriften und improvisierte Reparaturen haben dir gezeigt, wie die Stadt tatsächlich am Laufen gehalten wird."
    ],
    [
      "clan-heir",
      "Clan-Erbe",
      ["constitution", "charisma"],
      "skill.diplomacy",
      "Als Clan-Erbe trägst du Verantwortung für eine Gemeinschaft und bist darin geschult, Loyalitäten auszuhandeln und ihren Ruf zu vertreten.",
      "Dein Name ist Versprechen und Verpflichtung zugleich; jede Entscheidung fällt auf jene zurück, deren Erwartungen du geerbt hast."
    ],
    [
      "academic",
      "Akademiker",
      ["intelligence", "wisdom"],
      "skill.science",
      "Als Akademiker untersuchst du komplexe Fragen methodisch und verfügst über wissenschaftliches Training sowie institutionelle Erfahrung.",
      "Archive, Labore und Fachdebatten haben deinen Blick geschärft, auch wenn Erkenntnis in der Stadt selten frei von Interessen bleibt."
    ],
    [
      "underworld-contact",
      "Unterweltkontakt",
      ["dexterity", "charisma"],
      "skill.deception",
      "Als Unterweltkontakt bewegst du dich zwischen Hehlern, Informanten und falschen Identitäten, ohne deine wahren Absichten offenzulegen.",
      "Du kennst Treffpunkte ohne Adressen und Absprachen ohne Papier; Vertrauen ist knapp und jede Information hat ihren Preis."
    ],
    [
      "frontier",
      "Grenzgänger",
      ["constitution", "wisdom"],
      "skill.survival",
      "Als Grenzgänger bleibst du fern sicherer Infrastruktur orientiert und widerstandsfähig, wenn Versorgung, Schutz und klare Wege fehlen.",
      "Jenseits kontrollierter Bezirke hast du gelernt, Wetter, Spuren und knappe Vorräte ernster zu nehmen als offizielle Karten."
    ],
    [
      "order-member",
      "Ordensmitglied",
      ["strength", "wisdom"],
      "skill.religion",
      "Als Ordensmitglied verbindest du diszipliniertes Handeln mit Wissen über Glaubenslehren, Rituale und übernatürliche Verpflichtungen.",
      "Dein Orden gab dir Regeln, Verbündete und eine Aufgabe; ob du noch überzeugt bist, ändert nichts an den Zeichen, die du trägst."
    ],
    [
      "outcast",
      "Ausgestoßener",
      ["dexterity", "wisdom"],
      "skill.stealth",
      "Als Ausgestoßener überlebst du durch Aufmerksamkeit und unauffällige Bewegung außerhalb der Gemeinschaft, die dich zurückgelassen hat.",
      "Du hast gelernt, in Randzonen zu verschwinden, sichere Orte früh zu erkennen und nur wenigen Menschen deine Geschichte anzuvertrauen."
    ]
  ];
  const attributeNames: Record<string, string> = {
    strength: "Stärke",
    dexterity: "Geschicklichkeit",
    constitution: "Konstitution",
    intelligence: "Intelligenz",
    wisdom: "Weisheit",
    charisma: "Charisma"
  };
  const skillNames: Record<string, string> = {
    "skill.society": "Gesellschaft",
    "skill.crafting": "Handwerk",
    "skill.diplomacy": "Diplomatie",
    "skill.science": "Wissenschaft",
    "skill.deception": "Täuschen",
    "skill.survival": "Überleben",
    "skill.religion": "Religion",
    "skill.stealth": "Heimlichkeit"
  };
  for (const [id, name, boosts, skill, summary, flavorText] of backgrounds) {
    const rulesText = `## Spielwerte

Der Hintergrund bietet Attributsverbesserungen für ${boosts
      .map((boost) => attributeNames[boost])
      .join(
        " und "
      )} sowie eine freie Attributsverbesserung. Du erhältst den Kompetenzrang geübt in ${skillNames[skill]}.`;
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
        effects: [{ kind: "skill-training", skillId: skill, rank: "trained" }],
        summary,
        flavorText,
        rulesText,
        editorialStatus: "rewritten"
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
  const aliasesPath = path.join(contentDirectory, "legacy-aliases.json");
  const aliasesSource = await readFile(aliasesPath, "utf8").catch(() => "{}\n");
  const preservedDirectories = await Promise.all(
    ["templates", "custom"].map(async (name) => ({
      name,
      files: await readPreservedFiles(path.join(contentDirectory, name))
    }))
  );
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
  await writeFile(aliasesPath, aliasesSource, "utf8");
  for (const directory of preservedDirectories) {
    for (const file of directory.files) {
      const target = path.join(resolvedContent, directory.name, file.relativePath);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.source, "utf8");
    }
  }
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
