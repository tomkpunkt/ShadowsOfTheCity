import {
  AlertTriangle,
  Archive,
  BookOpen,
  Check,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  Download,
  FileJson,
  Filter,
  HeartPulse,
  Info,
  Languages,
  PackageOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Printer,
  Save,
  Search,
  Shield,
  Sparkles,
  Swords,
  Upload,
  UserRoundCog,
  WandSparkles,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";

import {
  calculateCharacter,
  type AttributeId,
  type CharacterState,
  type ResolvedChoice,
  type ValidationState
} from "@sotc/rules-engine";
import type { ContentEntity } from "@sotc/shared";

import { catalog, entities, entitiesOfType, entityName } from "./catalog.js";
import {
  downloadCharacter,
  importCharacter,
  loadCharacter,
  saveCharacter,
  toggleAttributeBoost
} from "./storage.js";

type StepId =
  | "overview"
  | "ancestry"
  | "background"
  | "class"
  | "attributes"
  | "skills"
  | "feats"
  | "spells"
  | "equipment"
  | "review"
  | "sheet";

interface Step {
  id: StepId;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}

const steps: Step[] = [
  { id: "overview", label: "Übersicht", icon: CircleUserRound },
  { id: "ancestry", label: "Abstammung", icon: Languages },
  { id: "background", label: "Background", icon: Archive },
  { id: "class", label: "Klasse", icon: UserRoundCog },
  { id: "attributes", label: "Attribute", icon: Sparkles },
  { id: "skills", label: "Skills", icon: ClipboardCheck },
  { id: "feats", label: "Feats & Features", icon: Swords },
  { id: "spells", label: "Zauber", icon: WandSparkles },
  { id: "equipment", label: "Ausrüstung", icon: PackageOpen },
  { id: "review", label: "Abschlussprüfung", icon: Check },
  { id: "sheet", label: "Charakterbogen", icon: BookOpen }
];

const attributeLabels: Record<AttributeId, string> = {
  strength: "Stärke",
  dexterity: "Geschicklichkeit",
  constitution: "Konstitution",
  intelligence: "Intelligenz",
  wisdom: "Weisheit",
  charisma: "Charisma"
};

const stateLabels: Record<ValidationState, string> = {
  valid: "Gültig",
  incomplete: "Offen",
  invalid: "Ungültig",
  blocked: "Blockiert"
};

const plainText = (markdown: string): string =>
  markdown
    .replace(/<[^>]+>/g, " ")
    .replace(/[`*_>#|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const entityLevel = (entity: ContentEntity): number | undefined =>
  "level" in entity && typeof entity.level === "number"
    ? entity.level
    : entity.type === "spell"
      ? entity.rank
      : undefined;

const entityMeta = (entity: ContentEntity): string[] => {
  const meta: string[] = [entity.type];
  const level = entityLevel(entity);
  if (level !== undefined) {
    meta.push(`Stufe ${String(level)}`);
  }
  if ("traditions" in entity) {
    meta.push(...entity.traditions);
  }
  return meta;
};

const AppButton = ({
  children,
  icon: Icon,
  onClick,
  tone = "quiet",
  title,
  disabled = false
}: {
  children?: ReactNode;
  icon: ComponentType<{ size?: number }>;
  onClick: () => void;
  tone?: "quiet" | "primary" | "danger";
  title: string;
  disabled?: boolean;
}) => (
  <button
    className={`app-button app-button--${tone}`}
    type="button"
    onClick={onClick}
    title={title}
    aria-label={children === undefined ? title : undefined}
    disabled={disabled}
  >
    <Icon size={17} />
    {children}
  </button>
);

const StatusPill = ({ state }: { state: ValidationState }) => (
  <span className={`status status--${state}`}>{stateLabels[state]}</span>
);

const Metric = ({
  label,
  value,
  detail,
  icon: Icon
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon: ComponentType<{ size?: number }>;
}) => (
  <div className="metric">
    <Icon size={18} />
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail === undefined ? null : <small>{detail}</small>}
    </div>
  </div>
);

const EntityCard = ({
  entity,
  selected,
  locked = false,
  invalid = false,
  onSelect,
  onDetails,
  reason
}: {
  entity: ContentEntity;
  selected: boolean;
  locked?: boolean;
  invalid?: boolean;
  onSelect: () => void;
  onDetails: () => void;
  reason?: string;
}) => (
  <article
    data-entity-id={entity.id}
    className={`entity-card${selected ? " entity-card--selected" : ""}${
      locked ? " entity-card--locked" : ""
    }${invalid ? " entity-card--invalid" : ""}`}
  >
    <button className="entity-card__body" type="button" onClick={onDetails}>
      <span className="entity-card__topline">
        <strong>{entity.name}</strong>
        {selected ? <Check size={17} /> : locked ? <Shield size={16} /> : null}
      </span>
      <span className="entity-card__meta">{entityMeta(entity).join(" · ")}</span>
      <span className="entity-card__description">
        {plainText(entity.description).slice(0, 180) || "Keine Kurzbeschreibung"}
      </span>
      {reason === undefined ? null : (
        <span className="entity-card__reason">
          <AlertTriangle size={14} />
          {reason}
        </span>
      )}
    </button>
    <button
      className="entity-card__select"
      type="button"
      onClick={onSelect}
      disabled={locked && !selected}
    >
      {selected ? "Entfernen" : "Auswählen"}
    </button>
  </article>
);

const SearchBar = ({
  value,
  onChange,
  onlyAvailable,
  onAvailabilityChange
}: {
  value: string;
  onChange: (value: string) => void;
  onlyAvailable?: boolean;
  onAvailabilityChange?: (value: boolean) => void;
}) => (
  <div className="search-row">
    <label className="search">
      <Search size={17} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Suchen"
      />
    </label>
    {onAvailabilityChange === undefined ? null : (
      <label className="availability-filter">
        <Filter size={16} />
        <input
          type="checkbox"
          checked={onlyAvailable}
          onChange={(event) => onAvailabilityChange(event.target.checked)}
        />
        Nur verfügbar
      </label>
    )}
  </div>
);

const EntitySelection = ({
  title,
  subtitle,
  candidates,
  selectedId,
  onSelect,
  onDetails
}: {
  title: string;
  subtitle: string;
  candidates: ContentEntity[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onDetails: (id: string) => void;
}) => {
  const [search, setSearch] = useState("");
  const visible = candidates.filter((entity) =>
    `${entity.name} ${entity.description}`.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <section className="workspace-section">
      <header className="section-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <span className="count">{String(visible.length)}</span>
      </header>
      <SearchBar value={search} onChange={setSearch} />
      <div className="entity-grid">
        {visible.map((entity) => (
          <EntityCard
            key={entity.id}
            entity={entity}
            selected={selectedId === entity.id}
            onSelect={() => onSelect(entity.id)}
            onDetails={() => onDetails(entity.id)}
          />
        ))}
      </div>
    </section>
  );
};

const ChoiceGroup = ({
  choice,
  character,
  onChange,
  onDetails
}: {
  choice: ResolvedChoice;
  character: CharacterState;
  onChange: (choiceId: string, optionId: string, maximum: number) => void;
  onDetails: (id: string) => void;
}) => {
  const [search, setSearch] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const visible = choice.options.filter((option) => {
    const matchesSearch = `${option.entity.name} ${option.entity.description}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesSearch && (!onlyAvailable || ["available", "selected"].includes(option.status));
  });
  return (
    <section className="choice-group" data-choice-id={choice.choiceId}>
      <header className="choice-group__header">
        <div>
          <div className="choice-group__title">
            <h3>{choice.name}</h3>
            <StatusPill state={choice.state} />
          </div>
          <p>
            {String(choice.selectedIds.length)} von {String(choice.min)}–{String(choice.max)}{" "}
            gewählt · Stufe {String(choice.level)}
          </p>
        </div>
      </header>
      <SearchBar
        value={search}
        onChange={setSearch}
        onlyAvailable={onlyAvailable}
        onAvailabilityChange={setOnlyAvailable}
      />
      <div className="entity-grid entity-grid--compact">
        {visible.map((option) => {
          const selected = choice.selectedIds.includes(option.entity.id);
          const firstFailure = option.failures[0]?.message;
          return (
            <EntityCard
              key={option.entity.id}
              entity={option.entity}
              selected={selected}
              locked={option.status === "locked"}
              invalid={option.status === "invalid"}
              reason={firstFailure}
              onSelect={() => onChange(choice.choiceId, option.entity.id, choice.max)}
              onDetails={() => onDetails(option.entity.id)}
            />
          );
        })}
      </div>
      {visible.length === 0 ? (
        <p className="empty-state">Keine Optionen entsprechen den Filtern.</p>
      ) : null}
      {character.choices[choice.choiceId]?.some((id) => !entities.has(id)) === true ? (
        <p className="inline-alert">Die Auswahl enthält IDs aus einem anderen Katalog.</p>
      ) : null}
    </section>
  );
};

const DetailDrawer = ({ entity, onClose }: { entity?: ContentEntity; onClose: () => void }) => (
  <aside className={`detail-drawer${entity === undefined ? "" : " detail-drawer--open"}`}>
    {entity === undefined ? null : (
      <>
        <header>
          <div>
            <span>{entityMeta(entity).join(" · ")}</span>
            <h2>{entity.name}</h2>
          </div>
          <button type="button" onClick={onClose} title="Details schließen">
            <X size={20} />
          </button>
        </header>
        <div className="detail-drawer__traits">
          {entity.traits.map((trait) => (
            <span key={trait}>{entityName(trait)}</span>
          ))}
        </div>
        <div className="detail-drawer__body">{entity.description}</div>
        <footer>
          <span>Quelle</span>
          <strong>{entity.source}</strong>
          <span>Status</span>
          <strong>{entity.status}</strong>
          <span>ID</span>
          <code>{entity.id}</code>
        </footer>
      </>
    )}
  </aside>
);

export const App = () => {
  const [character, setCharacter] = useState<CharacterState>(() =>
    loadCharacter(catalog.contentHash)
  );
  const [activeStep, setActiveStep] = useState<StepId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(
    () =>
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function" ||
      window.matchMedia("(min-width: 761px)").matches
  );
  const [detailId, setDetailId] = useState<string>();
  const [importConflicts, setImportConflicts] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const result = useMemo(() => calculateCharacter(catalog, character), [character]);
  const expectedBoosts =
    (entities.get(character.ancestryId ?? "")?.type === "ancestry"
      ? (entities.get(character.ancestryId ?? "") as Extract<ContentEntity, { type: "ancestry" }>)
          .freeBoosts
      : 0) +
    (entities.get(character.backgroundId ?? "")?.type === "background"
      ? (
          entities.get(character.backgroundId ?? "") as Extract<
            ContentEntity,
            { type: "background" }
          >
        ).freeBoosts
      : 0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveCharacter(character);
      setSaved(true);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [character]);

  useEffect(() => {
    if (!saved) {
      return;
    }
    const timer = window.setTimeout(() => setSaved(false), 1200);
    return () => window.clearTimeout(timer);
  }, [saved]);

  const update = (patch: Partial<CharacterState>): void => {
    setSaved(false);
    setCharacter((current) => ({ ...current, ...patch }));
  };

  const updateChoice = (choiceId: string, optionId: string, maximum: number): void => {
    setCharacter((current) => {
      const selected = current.choices[choiceId] ?? [];
      const next = selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : maximum === 1
          ? [optionId]
          : selected.length < maximum
            ? [...selected, optionId]
            : selected;
      return {
        ...current,
        choices: { ...current.choices, [choiceId]: next }
      };
    });
  };

  const choicesByKind = (kind: string): ResolvedChoice[] =>
    result.choices.filter(
      (choice) =>
        entities.get(choice.choiceId)?.type === "choice" &&
        (entities.get(choice.choiceId) as Extract<ContentEntity, { type: "choice" }>).choice
          .kind === kind
    );

  const handleImport = async (file: File): Promise<void> => {
    try {
      const imported = importCharacter(await file.text(), catalog);
      setCharacter(imported.character);
      setImportConflicts(imported.conflicts);
      setActiveStep(imported.conflicts.length === 0 ? "overview" : "review");
    } catch (error) {
      setImportConflicts([
        error instanceof Error ? error.message : "Import konnte nicht gelesen werden."
      ]);
      setActiveStep("review");
    }
  };

  const renderOverview = () => (
    <>
      <section className="identity-band">
        <label>
          Charaktername
          <input
            value={character.name}
            onChange={(event) => update({ name: event.target.value })}
          />
        </label>
        <div>
          <span>Abstammung</span>
          <strong>{entityName(character.ancestryId)}</strong>
        </div>
        <div>
          <span>Background</span>
          <strong>{entityName(character.backgroundId)}</strong>
        </div>
        <div>
          <span>Klasse</span>
          <strong>{entityName(character.classId)}</strong>
        </div>
      </section>
      <section className="metrics-grid">
        <Metric label="Trefferpunkte" value={result.hitPoints.value} icon={HeartPulse} />
        <Metric label="Rüstungsklasse" value={result.armorClass.value} icon={Shield} />
        <Metric label="Wahrnehmung" value={`+${String(result.perception.value)}`} icon={Search} />
        <Metric
          label="Geschwindigkeit"
          value={`${String(result.speed.value)} ft`}
          icon={ChevronRight}
        />
        <Metric
          label="Offene Punkte"
          value={result.issues.length}
          detail={stateLabels[result.state]}
          icon={AlertTriangle}
        />
        <Metric label="Bulk" value={result.bulk.value} icon={PackageOpen} />
      </section>
      <section className="workspace-section overview-columns">
        <div>
          <header className="section-heading">
            <div>
              <h2>Attribute</h2>
              <p>Aktuell berechnete Werte</p>
            </div>
          </header>
          <div className="attribute-summary">
            {Object.entries(result.attributes).map(([id, score]) => (
              <div key={id}>
                <span>{attributeLabels[id as AttributeId]}</span>
                <strong>{score.value}</strong>
                <small>
                  {Math.floor((score.value - 10) / 2) >= 0 ? "+" : ""}
                  {String(Math.floor((score.value - 10) / 2))}
                </small>
              </div>
            ))}
          </div>
        </div>
        <div>
          <header className="section-heading">
            <div>
              <h2>Prüfstatus</h2>
              <p>{stateLabels[result.state]}</p>
            </div>
            <StatusPill state={result.state} />
          </header>
          <div className="issue-list">
            {result.issues.slice(0, 5).map((issue, index) => (
              <button
                type="button"
                key={`${issue.code}-${String(index)}`}
                onClick={() => setActiveStep("review")}
              >
                <AlertTriangle size={16} />
                <span>{issue.message}</span>
                <ChevronRight size={16} />
              </button>
            ))}
            {result.issues.length === 0 ? (
              <div className="success-state">
                <Check size={18} />
                Alle derzeitigen Entscheidungen sind gültig.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );

  const renderAncestry = () => {
    const heritageCandidates = entitiesOfType("heritage").filter(
      (heritage) => heritage.ancestryId === character.ancestryId
    );
    return (
      <>
        <EntitySelection
          title="Abstammung"
          subtitle="Grundwerte, Sprachen und angeborene Merkmale"
          candidates={entitiesOfType("ancestry")}
          selectedId={character.ancestryId}
          onSelect={(ancestryId) => update({ ancestryId })}
          onDetails={setDetailId}
        />
        {character.ancestryId === undefined ? null : (
          <EntitySelection
            title="Herkunft"
            subtitle="Ausprägung innerhalb der gewählten Abstammung"
            candidates={heritageCandidates}
            selectedId={character.heritageId}
            onSelect={(heritageId) => update({ heritageId })}
            onDetails={setDetailId}
          />
        )}
      </>
    );
  };

  const renderClass = () => (
    <>
      <EntitySelection
        title="Klasse"
        subtitle="Kernprogression, Proficiencies und Klassenmerkmale"
        candidates={entitiesOfType("class")}
        selectedId={character.classId}
        onSelect={(classId) => update({ classId })}
        onDetails={setDetailId}
      />
      {choicesByKind("class-option").map((choice) => (
        <ChoiceGroup
          key={choice.choiceId}
          choice={choice}
          character={character}
          onChange={updateChoice}
          onDetails={setDetailId}
        />
      ))}
    </>
  );

  const renderAttributes = () => (
    <section className="workspace-section">
      <header className="section-heading">
        <div>
          <h2>Attributsverbesserungen</h2>
          <p>
            {String(character.attributeBoosts.length)} von {String(expectedBoosts)} frei gewählt
          </p>
        </div>
        <StatusPill
          state={
            character.attributeBoosts.length === expectedBoosts
              ? "valid"
              : character.attributeBoosts.length < expectedBoosts
                ? "incomplete"
                : "invalid"
          }
        />
      </header>
      <div className="attribute-editor">
        {(Object.keys(attributeLabels) as AttributeId[]).map((attribute) => {
          const score = result.attributes[attribute];
          const selected = character.attributeBoosts.includes(attribute);
          return (
            <label key={attribute} className={selected ? "is-selected" : ""}>
              <input
                type="checkbox"
                checked={selected}
                onChange={() =>
                  update({
                    attributeBoosts: toggleAttributeBoost(
                      character.attributeBoosts,
                      attribute,
                      expectedBoosts
                    )
                  })
                }
              />
              <span>{attributeLabels[attribute]}</span>
              <strong>{score.value}</strong>
              <small>{score.breakdown.map((entry) => entry.label).join(" · ")}</small>
            </label>
          );
        })}
      </div>
    </section>
  );

  const renderChoices = (kind: string, title: string, subtitle: string) => {
    const choices = choicesByKind(kind);
    return (
      <section className="workspace-section">
        <header className="section-heading">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <span className="count">{String(choices.length)}</span>
        </header>
        {choices.map((choice) => (
          <ChoiceGroup
            key={choice.choiceId}
            choice={choice}
            character={character}
            onChange={updateChoice}
            onDetails={setDetailId}
          />
        ))}
        {choices.length === 0 ? (
          <p className="empty-state">
            Für die aktuellen Entscheidungen gibt es hier nichts zu wählen.
          </p>
        ) : null}
      </section>
    );
  };

  const renderFeats = () => (
    <>
      {renderChoices("feat", "Feats", "Allgemeine, Abstammungs- und Klassen-Feats nach Stufe")}
      <section className="workspace-section">
        <header className="section-heading">
          <div>
            <h2>Automatische Features</h2>
            <p>Durch Klasse und Stufe gewährt</p>
          </div>
          <span className="count">{String(result.featureIds.length)}</span>
        </header>
        <div className="entity-grid entity-grid--compact">
          {result.featureIds.map((id) => {
            const entity = entities.get(id);
            return entity === undefined ? null : (
              <EntityCard
                key={id}
                entity={entity}
                selected
                onSelect={() => undefined}
                onDetails={() => setDetailId(id)}
              />
            );
          })}
        </div>
      </section>
    </>
  );

  const renderEquipment = () => {
    const candidates = catalog.entities.filter((entity) =>
      ["weapon", "armor", "equipment", "cyberware"].includes(entity.type)
    );
    return (
      <EquipmentSelection
        candidates={candidates}
        selectedIds={character.inventoryIds}
        onToggle={(id) =>
          update({
            inventoryIds: character.inventoryIds.includes(id)
              ? character.inventoryIds.filter((itemId) => itemId !== id)
              : [...character.inventoryIds, id]
          })
        }
        onDetails={setDetailId}
      />
    );
  };

  const renderReview = () => (
    <section className="workspace-section">
      <header className="section-heading">
        <div>
          <h2>Abschlussprüfung</h2>
          <p>Katalog, Entscheidungen und Voraussetzungen</p>
        </div>
        <StatusPill state={result.state} />
      </header>
      {importConflicts.length > 0 ? (
        <div className="conflict-list">
          <header>
            <FileJson size={18} />
            Importkonflikte
          </header>
          {importConflicts.map((conflict) => (
            <p key={conflict}>{conflict}</p>
          ))}
        </div>
      ) : null}
      <div className="review-list">
        {result.issues.map((issue, index) => (
          <article key={`${issue.code}-${String(index)}`}>
            <AlertTriangle size={18} />
            <div>
              <span>{issue.code}</span>
              <strong>{issue.message}</strong>
              {issue.failures?.map((failure) => (
                <p key={`${failure.code}-${failure.message}`}>{failure.message}</p>
              ))}
            </div>
            <StatusPill state={issue.state} />
          </article>
        ))}
        {result.issues.length === 0 ? (
          <div className="review-success">
            <Check size={28} />
            <strong>Charakter ist vollständig und gültig.</strong>
            <span>Katalog {catalog.contentHash.slice(0, 12)}</span>
          </div>
        ) : null}
      </div>
    </section>
  );

  const renderSheet = () => (
    <CharacterSheet character={character} result={result} onPrint={() => window.print()} />
  );

  const stepContent: Record<StepId, () => ReactNode> = {
    overview: renderOverview,
    ancestry: renderAncestry,
    background: () => (
      <EntitySelection
        title="Background"
        subtitle="Herkunft, Training und soziale Verankerung"
        candidates={entitiesOfType("background")}
        selectedId={character.backgroundId}
        onSelect={(backgroundId) => update({ backgroundId })}
        onDetails={setDetailId}
      />
    ),
    class: renderClass,
    attributes: renderAttributes,
    skills: () => renderChoices("skill", "Skills", "Wähle die Fertigkeitstrainings deiner Klasse"),
    feats: renderFeats,
    spells: () => renderChoices("spell", "Zauber", "Verfügbare Zauber nach Tradition und Rang"),
    equipment: renderEquipment,
    review: renderReview,
    sheet: renderSheet
  };

  return (
    <div className={`app-shell${sidebarOpen ? "" : " app-shell--collapsed"}`}>
      <header className="topbar">
        <button
          className="sidebar-toggle"
          type="button"
          onClick={() => setSidebarOpen((current) => !current)}
          title={sidebarOpen ? "Navigation einklappen" : "Navigation ausklappen"}
        >
          {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
        <div className="brand">
          <span>SHADOWS</span>
          <strong>OF THE CITY</strong>
        </div>
        <label className="level-control">
          <span>Stufe</span>
          <select
            value={character.level}
            onChange={(event) => update({ level: Number(event.target.value) })}
          >
            {Array.from({ length: 20 }, (_, index) => index + 1).map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <div className="topbar__status">
          <StatusPill state={result.state} />
          <span className={saved ? "save-indicator is-visible" : "save-indicator"}>
            Gespeichert
          </span>
        </div>
        <div className="topbar__actions">
          <AppButton
            icon={Save}
            title="Lokal speichern"
            onClick={() => {
              saveCharacter(character);
              setSaved(true);
            }}
          />
          <AppButton
            icon={Download}
            title="JSON exportieren"
            onClick={() => downloadCharacter(character)}
          />
          <AppButton
            icon={Upload}
            title="JSON importieren"
            onClick={() => fileInput.current?.click()}
          />
          <input
            ref={fileInput}
            className="visually-hidden"
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file !== undefined) {
                void handleImport(file);
              }
              event.target.value = "";
            }}
          />
        </div>
      </header>
      <nav className="sidebar" aria-label="Character Builder">
        <div className="sidebar__character">
          <div>{character.name.trim().slice(0, 1).toUpperCase() || "?"}</div>
          <span>
            <strong>{character.name || "Unbenannt"}</strong>
            <small>
              Stufe {String(character.level)} · {entityName(character.classId)}
            </small>
          </span>
        </div>
        <ol>
          {steps.map((step) => {
            const Icon = step.icon;
            const active = step.id === activeStep;
            const problem =
              step.id === "review" && result.issues.length > 0 ? result.issues.length : undefined;
            return (
              <li key={step.id}>
                <button
                  data-step-id={step.id}
                  type="button"
                  className={active ? "is-active" : ""}
                  onClick={() => {
                    setActiveStep(step.id);
                    if (window.innerWidth <= 760) {
                      setSidebarOpen(false);
                    }
                  }}
                  title={step.label}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{step.label}</span>
                  {problem === undefined ? null : <b>{problem}</b>}
                </button>
              </li>
            );
          })}
        </ol>
        <footer>
          <span>Katalog</span>
          <code>{catalog.contentHash.slice(0, 12)}</code>
          <span>{String(catalog.entities.length)} Entitäten</span>
        </footer>
      </nav>
      <main className="workspace">
        <header className="workspace__header">
          <div>
            <span>Character Builder</span>
            <h1>{steps.find((step) => step.id === activeStep)?.label}</h1>
          </div>
          {activeStep === "sheet" ? (
            <AppButton icon={Printer} title="Charakterbogen drucken" onClick={() => window.print()}>
              Drucken
            </AppButton>
          ) : (
            <AppButton
              icon={ChevronRight}
              tone="primary"
              title="Zum nächsten Bereich"
              onClick={() => {
                const index = steps.findIndex((step) => step.id === activeStep);
                setActiveStep(steps[Math.min(index + 1, steps.length - 1)]?.id ?? "review");
              }}
            >
              Weiter
            </AppButton>
          )}
        </header>
        <div className="workspace__content">{stepContent[activeStep]()}</div>
      </main>
      <DetailDrawer entity={entities.get(detailId ?? "")} onClose={() => setDetailId(undefined)} />
    </div>
  );
};

const EquipmentSelection = ({
  candidates,
  selectedIds,
  onToggle,
  onDetails
}: {
  candidates: ContentEntity[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onDetails: (id: string) => void;
}) => {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const visible = candidates.filter(
    (entity) =>
      (type === "all" || entity.type === type) &&
      `${entity.name} ${entity.description}`.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <section className="workspace-section">
      <header className="section-heading">
        <div>
          <h2>Ausrüstung</h2>
          <p>{String(selectedIds.length)} Gegenstände · Inventar und Belastung</p>
        </div>
        <span className="count">{String(visible.length)}</span>
      </header>
      <div className="filter-bar">
        <SearchBar value={search} onChange={setSearch} />
        <div className="segmented-control">
          {[
            ["all", "Alle"],
            ["weapon", "Waffen"],
            ["armor", "Rüstung"],
            ["equipment", "Ausrüstung"]
          ].map(([value, label]) => (
            <button
              type="button"
              className={type === value ? "is-active" : ""}
              key={value}
              onClick={() => setType(value ?? "all")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="entity-grid">
        {visible.map((entity) => (
          <EntityCard
            key={entity.id}
            entity={entity}
            selected={selectedIds.includes(entity.id)}
            onSelect={() => onToggle(entity.id)}
            onDetails={() => onDetails(entity.id)}
          />
        ))}
      </div>
    </section>
  );
};

const CharacterSheet = ({
  character,
  result,
  onPrint
}: {
  character: CharacterState;
  result: ReturnType<typeof calculateCharacter>;
  onPrint: () => void;
}) => (
  <article className="character-sheet">
    <header>
      <div>
        <span>SHADOWS OF THE CITY</span>
        <h2>{character.name}</h2>
        <p>
          Stufe {String(character.level)} · {entityName(character.ancestryId)} ·{" "}
          {entityName(character.backgroundId)} · {entityName(character.classId)}
        </p>
      </div>
      <button type="button" onClick={onPrint}>
        <Printer size={18} />
        Drucken
      </button>
    </header>
    <section className="sheet-vitals">
      <div>
        <span>TP</span>
        <strong>{result.hitPoints.value}</strong>
      </div>
      <div>
        <span>RK</span>
        <strong>{result.armorClass.value}</strong>
      </div>
      <div>
        <span>Wahrnehmung</span>
        <strong>+{result.perception.value}</strong>
      </div>
      <div>
        <span>Bewegung</span>
        <strong>{result.speed.value} ft</strong>
      </div>
    </section>
    <section className="sheet-columns">
      <div>
        <h3>Attribute</h3>
        {Object.entries(result.attributes).map(([id, value]) => (
          <p key={id}>
            <span>{attributeLabels[id as AttributeId]}</span>
            <strong>{value.value}</strong>
          </p>
        ))}
      </div>
      <div>
        <h3>Rettungswürfe</h3>
        {Object.entries(result.saves).map(([id, value]) => (
          <p key={id}>
            <span>{id}</span>
            <strong>+{value.value}</strong>
          </p>
        ))}
        <h3>SG</h3>
        <p>
          <span>Klasse</span>
          <strong>{result.classDc?.value ?? "–"}</strong>
        </p>
        <p>
          <span>Zauber</span>
          <strong>{result.spellDc?.value ?? "–"}</strong>
        </p>
      </div>
      <div>
        <h3>Skills</h3>
        {Object.entries(result.skills)
          .filter(([, value]) =>
            value.breakdown.some((entry) => entry.kind === "proficiency" && entry.value > 0)
          )
          .map(([id, value]) => (
            <p key={id}>
              <span>{entityName(id)}</span>
              <strong>+{value.value}</strong>
            </p>
          ))}
      </div>
    </section>
    <section className="sheet-lists">
      <div>
        <h3>Feats & Features</h3>
        <p>{[...result.featIds, ...result.featureIds].map(entityName).join(" · ") || "–"}</p>
      </div>
      <div>
        <h3>Zauber</h3>
        <p>{result.spellIds.map(entityName).join(" · ") || "–"}</p>
      </div>
      <div>
        <h3>Ausrüstung</h3>
        <p>{result.inventoryIds.map(entityName).join(" · ") || "–"}</p>
      </div>
    </section>
    <footer>
      <Info size={14} />
      Katalog {result.catalogHash.slice(0, 12)} · Status {stateLabels[result.state]}
    </footer>
  </article>
);
