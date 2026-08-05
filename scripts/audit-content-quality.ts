import { writeFile } from "node:fs/promises";
import path from "node:path";

import type { ContentEntity } from "@sotc/shared";

import {
  contentPath,
  countBy,
  generatedDirectory,
  hasTextRule,
  loadCatalog,
  markdownTable,
  markdownToText,
  normalizeWhitespace,
  reviewDirectory,
  writeJson
} from "./lib/audit-utils.js";

type Severity = "BLOCKER" | "CRITICAL" | "MAJOR" | "MINOR" | "EDITORIAL";

interface QualityFinding {
  entityId: string;
  path: string;
  field: string;
  problemType: string;
  severity: Severity;
  currentText: string;
  recommendation: string;
  autoFixable: boolean;
}

const patterns: Array<{ type: string; expression: RegExp; severity: Severity }> = [
  {
    type: "placeholder",
    expression: /\b(?:TODO|FIXME|TBD|WIP|Placeholder|Lorem ipsum)\b/i,
    severity: "BLOCKER"
  },
  {
    type: "placeholder-de",
    expression: /\b(?:Beschreibung folgt|Noch ausarbeiten)\b/i,
    severity: "BLOCKER"
  },
  {
    type: "template-variable",
    expression: /(?:\{\{[^}]+\}\}|\$\{[^}]+\}|<%[^%]+%>)/,
    severity: "CRITICAL"
  }
];

const structuredShortTypes = new Set<ContentEntity["type"]>([
  "choice",
  "trait",
  "language",
  "proficiency",
  "rule"
]);

const run = async (): Promise<void> => {
  const catalog = await loadCatalog();
  const findings: QualityFinding[] = [];
  const add = (
    entity: ContentEntity,
    field: string,
    problemType: string,
    severity: Severity,
    currentText: string,
    recommendation: string,
    autoFixable: boolean
  ): void => {
    findings.push({
      entityId: entity.id,
      path: contentPath(entity),
      field,
      problemType,
      severity,
      currentText: normalizeWhitespace(currentText).slice(0, 320),
      recommendation,
      autoFixable
    });
  };

  for (const entity of catalog.entities) {
    const plain = markdownToText(entity.description);
    const summary = entity.summary.trim();
    if (summary.length < 20) {
      add(
        entity,
        "summary",
        "short-summary",
        "CRITICAL",
        entity.summary,
        "Eine Kurzbeschreibung aus dem vorhandenen Quelltext ableiten.",
        true
      );
    }
    if (plain.length === 0) {
      add(
        entity,
        "description",
        "empty-description",
        "BLOCKER",
        entity.description,
        "Aus der bestehenden Quelle eine belastbare Beschreibung übernehmen.",
        false
      );
    }
    if (plain.length < 24 && !structuredShortTypes.has(entity.type)) {
      add(
        entity,
        "description",
        "very-short-description",
        "MAJOR",
        entity.description,
        "Die vorhandenen strukturierten Werte in einen verständlichen Kurztext überführen.",
        true
      );
    }
    if (plain.toLocaleLowerCase("de") === entity.name.toLocaleLowerCase("de")) {
      add(
        entity,
        "description",
        "repeats-name",
        "MAJOR",
        entity.description,
        "Eine erklärende Beschreibung aus der Quelle ergänzen.",
        false
      );
    }
    for (const pattern of patterns) {
      if (pattern.expression.test(entity.description) || pattern.expression.test(entity.name)) {
        add(
          entity,
          "description",
          pattern.type,
          pattern.severity,
          entity.description,
          "Platzhalter entfernen oder die Entität bis zur fachlichen Klärung auf draft setzen.",
          false
        );
      }
    }
    if (/^(?:[a-z]+[A-Z]\w*|[a-z0-9]+(?:_[a-z0-9]+)+)$/.test(entity.name)) {
      add(
        entity,
        "name",
        "technical-label",
        "MAJOR",
        entity.name,
        "Einen geprüften deutschen Anzeigenamen verwenden.",
        false
      );
    }
    const visibleText = `${entity.name} ${entity.summary}`;
    if (/\b(?:Feat|Feature|Background|Skill|Playtest)s?\b/i.test(visibleText)) {
      add(
        entity,
        "name/summary",
        "english-ui-term",
        "CRITICAL",
        visibleText,
        "Den sichtbaren Fachbegriff durch die festgelegte deutsche Terminologie ersetzen.",
        true
      );
    }
    if (/^\s*(?:\[|\{)[\s\S]*(?:\]|\})\s*$/.test(entity.description)) {
      add(
        entity,
        "description",
        "raw-structured-data",
        "CRITICAL",
        entity.description,
        "Rohdaten in redaktionellen Markdown-Text oder strukturierte Schemafelder überführen.",
        false
      );
    }
    if (/<(?:script|iframe|object|embed)\b/i.test(entity.description)) {
      add(
        entity,
        "description",
        "unsafe-html",
        "BLOCKER",
        entity.description,
        "Aktiven HTML-Inhalt entfernen; der Builder rendert HTML nicht.",
        false
      );
    }
  }

  const markdown = {
    headings: catalog.entities.filter((entity) => /^#{1,6}\s+/m.test(entity.description)).length,
    lists: catalog.entities.filter((entity) => /^\s*(?:[-*+]|\d+\.)\s+/m.test(entity.description))
      .length,
    tables: catalog.entities.filter((entity) => /^\s*\|.+\|\s*$/m.test(entity.description)).length,
    blockquotes: catalog.entities.filter((entity) => /^>\s+/m.test(entity.description)).length,
    fencedCode: catalog.entities.filter((entity) => /```/.test(entity.description)).length,
    links: catalog.entities.filter((entity) => /\[[^\]]+\]\([^)]+\)/.test(entity.description))
      .length,
    internalReferences: catalog.entities.filter((entity) =>
      /\[\[[a-z][a-z0-9.-]+(?:\|[^\]]+)?\]\]/.test(entity.description)
    ).length,
    embeddedHtml: catalog.entities.filter((entity) => /<\/?[a-z][^>]*>/i.test(entity.description))
      .length
  };
  const fieldInventory = [
    ...new Set(catalog.entities.flatMap((entity) => Object.keys(entity)))
  ].sort();
  const visibleBeforeAudit = new Set([
    "name",
    "type",
    "level",
    "rank",
    "traditions",
    "description",
    "traits",
    "source",
    "status",
    "id"
  ]);
  const invisibleFields = fieldInventory.filter((field) => !visibleBeforeAudit.has(field));
  const severityCounts = countBy(findings, (finding) => finding.severity);
  const blocking = findings.filter(
    (finding) => finding.severity === "BLOCKER" || finding.severity === "CRITICAL"
  );
  const report = {
    schemaVersion: 1,
    catalogHash: catalog.contentHash,
    summary: {
      entities: catalog.entities.length,
      byType: countBy(catalog.entities, (entity) => entity.type),
      completeDescriptions: catalog.entities.filter(
        (entity) =>
          entity.summary.trim().length >= 20 &&
          (markdownToText(entity.description).length >= 24 || structuredShortTypes.has(entity.type))
      ).length,
      emptyDescriptions: catalog.entities.filter(
        (entity) => markdownToText(entity.description).length === 0
      ).length,
      shortDescriptions: catalog.entities.filter(
        (entity) => markdownToText(entity.description).length < 40
      ).length,
      suspiciousLabels: findings.filter((finding) => finding.problemType === "technical-label")
        .length,
      visiblePlaceholders: findings.filter((finding) =>
        finding.problemType.startsWith("placeholder")
      ).length,
      textRuleEntities: catalog.entities.filter(hasTextRule).length,
      markdown,
      catalogFields: fieldInventory.length,
      fieldsPreviouslyInvisibleInUi: invisibleFields.length,
      findings: findings.length,
      severityCounts,
      blockingFindings: blocking.length
    },
    invisibleFields,
    findings
  };
  await writeJson(path.join(generatedDirectory, "content-quality-report.json"), report);

  const findingsRows = findings
    .slice(0, 200)
    .map((finding) => [
      finding.severity,
      `\`${finding.entityId}\``,
      `\`${finding.field}\``,
      finding.problemType,
      finding.currentText,
      finding.recommendation
    ]);
  await writeFile(
    path.join(reviewDirectory, "06-content-quality-audit.md"),
    `# Inhaltsqualitätsaudit

Automatischer Stand für Katalog \`${catalog.contentHash}\`.

## Ergebnis

- ${String(report.summary.entities)} Entitäten geprüft
- ${String(report.summary.completeDescriptions)} vollständige sichtbare Beschreibungen aus Kurztext, Regeltext und typisierten Details
- ${String(report.summary.shortDescriptions)} Alttexte mit weniger als 40 Klartextzeichen
- ${String(report.summary.emptyDescriptions)} leere Beschreibungen
- ${String(report.summary.visiblePlaceholders)} sichtbare Platzhalter
- ${String(report.summary.suspiciousLabels)} technische Anzeigenamen
- ${String(report.summary.textRuleEntities)} Entitäten mit ausdrücklich nicht maschinenlesbaren Textregeln
- ${String(report.summary.blockingFindings)} blockierende oder kritische Befunde

## Markdown-Inventar

${markdownTable(
  ["Struktur", "Entitäten"],
  Object.entries(markdown).map(([key, value]) => [key, String(value)])
)}

## Befunde

${
  findingsRows.length === 0
    ? "Keine."
    : markdownTable(
        ["Schweregrad", "Entität", "Feld", "Problem", "Aktueller Text", "Maßnahme"],
        findingsRows
      )
}

Die vollständige maschinenlesbare Liste, einschließlich Dateipfad und
Auto-Fix-Eignung, steht in \`generated/content-quality-report.json\`.
`,
    "utf8"
  );

  await writeFile(
    path.join(reviewDirectory, "04-content-ui-quality-baseline.md"),
    `# Content- und UI-Qualitätsbaseline

Die Baseline wird von \`scripts/audit-content-quality.ts\` aus dem kompilierten
Katalog erzeugt. Sie beschreibt den Zustand vor der UI-Qualitätsschicht und
bleibt dadurch reproduzierbar.

## Katalog

${markdownTable(
  ["Entitätstyp", "Anzahl"],
  Object.entries(report.summary.byType).map(([type, count]) => [`\`${type}\``, String(count)])
)}

## Automatisierte Qualitätszahlen

- Vollständige sichtbare Beschreibungen aus Kurztext, Regeltext und typisierten Details: ${String(report.summary.completeDescriptions)}
- Leere Beschreibungen: ${String(report.summary.emptyDescriptions)}
- Alttexte mit weniger als 40 Klartextzeichen: ${String(report.summary.shortDescriptions)}
- Verdächtige technische Labels: ${String(report.summary.suspiciousLabels)}
- Sichtbare Platzhaltermuster: ${String(report.summary.visiblePlaceholders)}
- Entitäten mit Markdown-Struktur: ${String(
      catalog.entities.filter((entity) =>
        /(?:^#{1,6}\s+|^\s*(?:[-*+]|\d+\.)\s+|^\s*\|.+\|\s*$|^>\s+)/m.test(entity.description)
      ).length
    )}
- Entitäten mit nicht maschinenlesbarer Textregel: ${String(report.summary.textRuleEntities)}
- Katalogfelder, die vor diesem Auftrag nicht in der generischen Detailansicht sichtbar waren: ${String(report.summary.fieldsPreviouslyInvisibleInUi)}

## UI-Ausgangslage

- Markdown-Unterstützung: keine Parser-Pipeline; Detailtexte wurden als Klartext ausgegeben.
- Kurztexte: reguläre Ausdrücke entfernten Markdown-Zeichen ohne AST.
- Labels: einzelne lokale Maps in \`App.tsx\`; Entitätstyp, Status, Quelle und mehrere Enum-Werte wurden roh ausgegeben.
- Details: generischer Drawer mit Name, Typ, Beschreibung, Quelle, Status und technischer ID.
- Suche: Name und Beschreibung, ohne Traits, Typ, Quelle oder strukturierte Regelfelder.
- Filter: Verfügbarkeit bei Choices und Typ bei Ausrüstung, ohne zentrale Reset- oder Aktivanzeige.
- Reichweite: direkte Kernentscheidungen, Engine-Choices und Ausrüstung; kein vollständiges Kompendium.

## Unsichtbare Felder der Ausgangsansicht

${invisibleFields.map((field) => `- \`${field}\``).join("\n")}

Die aktuelle Reichweite nach Umsetzung wird separat durch
\`generated/builder-reachability-report.json\` belegt.
`,
    "utf8"
  );

  process.stdout.write(
    `Content quality: ${String(findings.length)} Befunde, ${String(blocking.length)} blockierend.\n`
  );
  if (blocking.length > 0) {
    process.exitCode = 1;
  }
};

await run();
