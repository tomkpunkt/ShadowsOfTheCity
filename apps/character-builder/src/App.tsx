import {
  AlertTriangle,
  Archive,
  BookOpen,
  Check,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  Compass,
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
  RotateCcw,
  Save,
  Search,
  Shield,
  Sparkles,
  Swords,
  Upload,
  UserRoundPlus,
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
  type SaveId,
  type ValidationState
} from "@sotc/rules-engine";
import { APP_VERSION, type ContentEntity } from "@sotc/shared";

import { catalog, entities, entitiesOfType, entityName } from "./catalog.js";
import { EntityDetails } from "./EntityDetails.js";
import { entityMeta, searchableEntityText } from "./entity-presentation.js";
import {
  attributeLabels,
  formatContentStatus,
  formatEntityType,
  formatItemAvailability,
  formatItemCategory,
  formatItemOrigin,
  formatItemQuality,
  formatItemSubcategory,
  formatRequirementFailure,
  formatSave,
  formatTechnologyLevel,
  formatValidationIssue,
  validationStateLabels
} from "./i18n/de.js";
import {
  countActiveItemFilters,
  emptyItemFilters,
  isItemEntity,
  itemMatchesFilters,
  sortItems,
  uniqueItemValues,
  type ItemCatalogFilters,
  type ItemEntity,
  type ItemGrouping,
  type ItemSort
} from "./item-catalog.js";
import {
  downloadCharacter,
  emptyCharacter,
  importCharacter,
  loadCharacter,
  saveCharacter,
  toggleAttributeBoost,
  type CatalogCompatibility
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
  | "compendium"
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
  { id: "background", label: "Hintergrund", icon: Archive },
  { id: "class", label: "Klasse", icon: UserRoundCog },
  { id: "attributes", label: "Attribute", icon: Sparkles },
  { id: "skills", label: "Fertigkeiten", icon: ClipboardCheck },
  { id: "feats", label: "Talente und Merkmale", icon: Swords },
  { id: "spells", label: "Zauber", icon: WandSparkles },
  { id: "equipment", label: "Ausrüstung", icon: PackageOpen },
  { id: "compendium", label: "Kompendium", icon: Compass },
  { id: "review", label: "Abschlussprüfung", icon: Check },
  { id: "sheet", label: "Charakterbogen", icon: BookOpen }
];

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
  <span className={`status status--${state}`}>{validationStateLabels[state]}</span>
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
  reason,
  showSelect = true
}: {
  entity: ContentEntity;
  selected: boolean;
  locked?: boolean;
  invalid?: boolean;
  onSelect: () => void;
  onDetails: () => void;
  reason?: string;
  showSelect?: boolean;
}) => (
  <article
    data-entity-id={entity.id}
    className={`entity-card${selected ? " entity-card--selected" : ""}${
      locked ? " entity-card--locked" : ""
    }${invalid ? " entity-card--invalid" : ""}${showSelect ? "" : " entity-card--detail-only"}`}
  >
    <button className="entity-card__body" type="button" onClick={onDetails}>
      <span className="entity-card__topline">
        <strong>{entity.name}</strong>
        {selected ? <Check size={17} /> : locked ? <Shield size={16} /> : null}
      </span>
      <span className="entity-card__meta">{entityMeta(entity).join(" · ")}</span>
      <span className="entity-card__description">{entity.summary}</span>
      {entity.traits.length === 0 ? null : (
        <span className="entity-card__traits">
          {entity.traits.slice(0, 3).map((trait) => (
            <span key={trait}>{entityName(trait)}</span>
          ))}
        </span>
      )}
      <span className={`content-status content-status--${entity.status}`}>
        {formatContentStatus(entity.status)}
      </span>
      {reason === undefined ? null : (
        <span className="entity-card__reason">
          <AlertTriangle size={14} />
          {reason}
        </span>
      )}
    </button>
    {showSelect ? (
      <button
        className="entity-card__select"
        type="button"
        onClick={onSelect}
        disabled={locked && !selected}
      >
        {selected ? "Entfernen" : "Auswählen"}
      </button>
    ) : null}
  </article>
);

const SearchBar = ({
  value,
  onChange,
  onlyAvailable,
  onAvailabilityChange,
  onReset
}: {
  value: string;
  onChange: (value: string) => void;
  onlyAvailable?: boolean;
  onAvailabilityChange?: (value: boolean) => void;
  onReset?: () => void;
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
    {onReset === undefined ? null : (
      <button className="filter-reset" type="button" onClick={onReset}>
        <RotateCcw size={16} />
        Zurücksetzen
      </button>
    )}
  </div>
);

const ItemCatalogControls = ({
  items,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  grouping,
  onGroupingChange,
  subgroupByTechnology,
  onSubgroupByTechnologyChange
}: {
  items: ItemEntity[];
  filters: ItemCatalogFilters;
  onFiltersChange: (filters: ItemCatalogFilters) => void;
  sort: ItemSort;
  onSortChange: (sort: ItemSort) => void;
  grouping: ItemGrouping;
  onGroupingChange: (grouping: ItemGrouping) => void;
  subgroupByTechnology: boolean;
  onSubgroupByTechnologyChange: (value: boolean) => void;
}) => {
  const categories = uniqueItemValues(items, "category");
  const subcategories = uniqueItemValues(items, "subcategory");
  const technologies = uniqueItemValues(items, "technologyLevel");
  const availabilities = uniqueItemValues(items, "availability");
  const qualities = uniqueItemValues(items, "quality");
  const origins = [...new Set(items.flatMap((item) => item.origins))].sort((left, right) =>
    formatItemOrigin(left).localeCompare(formatItemOrigin(right), "de")
  );
  const traits = [
    ...new Set(items.flatMap((item) => item.traits.filter((trait) => trait !== "trait.legacy")))
  ].sort((left, right) => entityName(left).localeCompare(entityName(right), "de"));
  const setFilter = (key: keyof ItemCatalogFilters, value: string): void => {
    onFiltersChange({ ...filters, [key]: value });
  };
  const select = (
    label: string,
    key: keyof ItemCatalogFilters,
    values: string[],
    formatter: (value: string) => string
  ): ReactNode =>
    values.length === 0 ? null : (
      <label>
        <span>{label}</span>
        <select
          aria-label={label}
          value={filters[key]}
          onChange={(event) => setFilter(key, event.target.value)}
        >
          <option value="all">Alle</option>
          {values.map((value) => (
            <option key={value} value={value}>
              {formatter(value)}
            </option>
          ))}
        </select>
      </label>
    );
  return (
    <div className="catalog-controls" data-testid="item-catalog-controls">
      <div className="catalog-controls__selectors">
        {select("Hauptkategorie", "category", categories, (value) =>
          formatItemCategory(value as ItemEntity["category"])
        )}
        {select("Unterkategorie", "subcategory", subcategories, (value) =>
          formatItemSubcategory(value as ItemEntity["subcategory"])
        )}
        {select("Technologieniveau", "technologyLevel", technologies, (value) =>
          formatTechnologyLevel(value as ItemEntity["technologyLevel"])
        )}
        {select("Verfügbarkeit", "availability", availabilities, (value) =>
          formatItemAvailability(value as ItemEntity["availability"])
        )}
        {select("Herkunft", "origin", origins, (value) =>
          formatItemOrigin(value as ItemEntity["origins"][number])
        )}
        {select("Qualität", "quality", qualities, (value) =>
          formatItemQuality(value as NonNullable<ItemEntity["quality"]>)
        )}
        {select("Merkmal", "trait", traits, entityName)}
        {items.length === 0 ? null : (
          <>
            <label>
              <span>Stufe von</span>
              <input
                aria-label="Mindeststufe"
                type="number"
                min="0"
                value={filters.minLevel}
                onChange={(event) => setFilter("minLevel", event.target.value)}
              />
            </label>
            <label>
              <span>Stufe bis</span>
              <input
                aria-label="Höchststufe"
                type="number"
                min="0"
                value={filters.maxLevel}
                onChange={(event) => setFilter("maxLevel", event.target.value)}
              />
            </label>
            <label>
              <span>Preis bis</span>
              <input
                aria-label="Höchstpreis"
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(event) => setFilter("maxPrice", event.target.value)}
              />
            </label>
            <label>
              <span>Last bis</span>
              <input
                aria-label="Höchstlast"
                type="number"
                min="0"
                step="0.1"
                value={filters.maxBulk}
                onChange={(event) => setFilter("maxBulk", event.target.value)}
              />
            </label>
          </>
        )}
      </div>
      <div className="catalog-controls__view">
        <label>
          <span>Sortierung</span>
          <select
            aria-label="Sortierung"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as ItemSort)}
          >
            <option value="name">Name</option>
            <option value="level">Stufe</option>
            <option value="price-asc">Preis aufsteigend</option>
            <option value="price-desc">Preis absteigend</option>
            <option value="bulk">Last</option>
          </select>
        </label>
        <label>
          <span>Gruppierung</span>
          <select
            aria-label="Gruppierung"
            value={grouping}
            onChange={(event) => onGroupingChange(event.target.value as ItemGrouping)}
          >
            <option value="category">Hauptkategorie</option>
            <option value="subcategory">Unterkategorie</option>
            <option value="none">Keine</option>
          </select>
        </label>
        <label className="catalog-controls__toggle">
          <input
            type="checkbox"
            checked={subgroupByTechnology}
            onChange={(event) => onSubgroupByTechnologyChange(event.target.checked)}
          />
          Nach Technologie unterteilen
        </label>
      </div>
    </div>
  );
};

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
    searchableEntityText(entity, (id) => entities.get(id)?.name).includes(
      search.toLocaleLowerCase("de")
    )
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
      <SearchBar
        value={search}
        onChange={setSearch}
        onReset={search.length === 0 ? undefined : () => setSearch("")}
      />
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
    const matchesSearch = searchableEntityText(
      option.entity,
      (id) => entities.get(id)?.name
    ).includes(search.toLocaleLowerCase("de"));
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
        onReset={
          search.length === 0 && !onlyAvailable
            ? undefined
            : () => {
                setSearch("");
                setOnlyAvailable(false);
              }
        }
      />
      <div className="entity-grid entity-grid--compact">
        {visible.map((option) => {
          const selected = choice.selectedIds.includes(option.entity.id);
          const firstFailure =
            option.failures[0] === undefined
              ? undefined
              : formatRequirementFailure(option.failures[0], (id) => entities.get(id)?.name);
          return (
            <EntityCard
              key={option.entity.id}
              entity={option.entity}
              selected={selected}
              locked={option.status === "locked" || option.status === "blocked"}
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
        <p className="inline-alert">Die Auswahl enthält einen Eintrag aus einem anderen Katalog.</p>
      ) : null}
    </section>
  );
};

const DetailDrawer = ({
  entity,
  provenance,
  onClose,
  onOpenEntity
}: {
  entity?: ContentEntity;
  provenance: string[];
  onClose: () => void;
  onOpenEntity: (id: string) => void;
}) => (
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
        <div className="detail-drawer__body">
          <EntityDetails entity={entity} provenance={provenance} onOpenEntity={onOpenEntity} />
        </div>
      </>
    )}
  </aside>
);

export const App = () => {
  const [initialLoad] = useState(() => loadCharacter(catalog));
  const [character, setCharacter] = useState<CharacterState>(initialLoad.character);
  const [activeStep, setActiveStep] = useState<StepId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(
    () =>
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function" ||
      window.matchMedia("(min-width: 761px)").matches
  );
  const [detailId, setDetailId] = useState<string>();
  const [importConflicts, setImportConflicts] = useState<string[]>(initialLoad.conflicts);
  const [compatibility, setCompatibility] = useState<CatalogCompatibility>(
    initialLoad.compatibility
  );
  const [saved, setSaved] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const result = useMemo(() => calculateCharacter(catalog, character), [character]);
  const expectedBoosts = result.expectedAttributeBoosts;

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

  const createNewCharacter = (): void => {
    if (!window.confirm("Aktuellen Charakter verwerfen und einen neuen Charakter anlegen?")) {
      return;
    }
    setCharacter(emptyCharacter(catalog.contentHash));
    setActiveStep("overview");
    setDetailId(undefined);
    setImportConflicts([]);
    setCompatibility("compatible");
    setSaved(false);
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

  const detailProvenance = (id: string): string[] => {
    const entries: string[] = [];
    if (character.ancestryId === id) {
      entries.push("Manuell als Abstammung gewählt.");
    }
    if (character.heritageId === id) {
      entries.push("Manuell als Herkunft gewählt.");
    }
    if (character.backgroundId === id) {
      entries.push("Manuell als Hintergrund gewählt.");
    }
    if (character.classId === id) {
      entries.push("Manuell als Klasse gewählt.");
    }
    if (character.inventoryIds.includes(id)) {
      entries.push("Manuell zur Ausrüstung hinzugefügt.");
    }
    for (const [choiceId, selectedIds] of Object.entries(character.choices)) {
      if (selectedIds.includes(id)) {
        const choice = entities.get(choiceId);
        entries.push(
          `Manuell über ${choice?.name ?? "eine Charakterauswahl"} gewählt${
            choice?.type === "choice" ? ` (Stufe ${String(choice.choice.level)})` : ""
          }.`
        );
      }
    }
    if (result.featureIds.includes(id)) {
      entries.push(`Automatisch durch Klasse oder Stufe ${String(character.level)} gewährt.`);
    }
    if (result.featIds.includes(id) && entries.length === 0) {
      entries.push("Automatisch durch Abstammung, Hintergrund oder Regel gewährt.");
    }
    if (result.spellIds.includes(id) && entries.length === 0) {
      entries.push("Über den Zauberzugang der gewählten Klasse verfügbar.");
    }
    return entries;
  };

  const handleImport = async (file: File): Promise<void> => {
    try {
      const imported = importCharacter(await file.text(), catalog);
      setCharacter(imported.character);
      setImportConflicts(imported.conflicts);
      setCompatibility(imported.compatibility);
      setActiveStep(imported.conflicts.length === 0 ? "overview" : "review");
    } catch (error) {
      setImportConflicts([
        error instanceof Error ? error.message : "Import konnte nicht gelesen werden."
      ]);
      setCompatibility("unreadable");
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
          <span>Hintergrund</span>
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
          value={`${String(result.speed.value)} Fuß`}
          icon={ChevronRight}
        />
        <Metric
          label="Offene Punkte"
          value={result.issues.length}
          detail={validationStateLabels[result.state]}
          icon={AlertTriangle}
        />
        <Metric label="Last" value={result.bulk.value} icon={PackageOpen} />
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
              <p>{validationStateLabels[result.state]}</p>
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
                <span>{formatValidationIssue(issue, (id) => entities.get(id)?.name)}</span>
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
      {renderChoices("feat", "Talente", "Allgemeine, Abstammungs- und Klassentalente nach Stufe")}
      <section className="workspace-section">
        <header className="section-heading">
          <div>
            <h2>Automatische Merkmale</h2>
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
              : [...character.inventoryIds, id],
            equippedItemIds: character.inventoryIds.includes(id)
              ? character.equippedItemIds.filter((itemId) => itemId !== id)
              : [...character.equippedItemIds, id]
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
      <div className={`compatibility compatibility--${compatibility}`}>
        <FileJson size={18} />
        <div>
          <strong>Katalog-Kompatibilität</strong>
          <p>
            {
              {
                compatible: "Kompatibel mit dem aktuellen Katalog.",
                migrated: "Erfolgreich auf den aktuellen Katalog migriert.",
                "partially-incompatible":
                  "Teilweise inkompatibel; erhaltene Altwerte müssen geprüft werden.",
                unreadable: "Nicht lesbar; der gespeicherte Stand wurde nicht übernommen."
              }[compatibility]
            }
          </p>
        </div>
      </div>
      <div className="review-list">
        {result.issues.map((issue, index) => (
          <article key={`${issue.code}-${String(index)}`}>
            <AlertTriangle size={18} />
            <div>
              <strong>{formatValidationIssue(issue, (id) => entities.get(id)?.name)}</strong>
              {issue.failures?.map((failure) => (
                <p key={`${failure.code}-${failure.message}`}>
                  {formatRequirementFailure(failure, (id) => entities.get(id)?.name)}
                </p>
              ))}
            </div>
            <StatusPill state={issue.state} />
          </article>
        ))}
        {result.issues.length === 0 ? (
          <div className="review-success">
            <Check size={28} />
            <strong>Charakter ist vollständig und gültig.</strong>
            <span>{String(catalog.entities.length)} geprüfte Inhalte</span>
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
        title="Hintergrund"
        subtitle="Herkunft, Training und soziale Verankerung"
        candidates={entitiesOfType("background")}
        selectedId={character.backgroundId}
        onSelect={(backgroundId) => update({ backgroundId })}
        onDetails={setDetailId}
      />
    ),
    class: renderClass,
    attributes: renderAttributes,
    skills: () =>
      renderChoices("skill", "Fertigkeiten", "Wähle die Fertigkeitstrainings deiner Klasse"),
    feats: renderFeats,
    spells: () => renderChoices("spell", "Zauber", "Verfügbare Zauber nach Tradition und Rang"),
    equipment: renderEquipment,
    compendium: () => <Compendium onDetails={setDetailId} />,
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
          <span className={saved ? "save-indicator is-visible" : "save-indicator"}>
            Gespeichert
          </span>
          <StatusPill state={result.state} />
        </div>
        <div className="topbar__actions">
          <AppButton
            icon={UserRoundPlus}
            title="Neuen Charakter anlegen"
            onClick={createNewCharacter}
          />
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
      <nav className="sidebar" aria-label="Charakterbau">
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
            const sectionState = result.sectionStatuses[step.id] ?? "not-relevant";
            const SectionStatusIcon =
              sectionState === "valid"
                ? Check
                : sectionState === "not-relevant"
                  ? Info
                  : AlertTriangle;
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
                  <span
                    className={`sidebar__state sidebar__state--${sectionState}`}
                    title={
                      sectionState === "not-relevant"
                        ? "Nicht relevant"
                        : validationStateLabels[sectionState]
                    }
                  >
                    <SectionStatusIcon size={13} />
                    {problem === undefined ? null : <b>{problem}</b>}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <footer>
          <span>Version {APP_VERSION} · Geprüfter Katalog</span>
          <strong>{String(catalog.entities.length)} Inhalte</strong>
        </footer>
      </nav>
      <main className="workspace">
        <header className="workspace__header">
          <div>
            <span>Charakterbau</span>
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
      <DetailDrawer
        entity={entities.get(detailId ?? "")}
        provenance={detailProvenance(detailId ?? "")}
        onClose={() => setDetailId(undefined)}
        onOpenEntity={setDetailId}
      />
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
  const [filters, setFilters] = useState<ItemCatalogFilters>(emptyItemFilters);
  const [sort, setSort] = useState<ItemSort>("name");
  const [grouping, setGrouping] = useState<ItemGrouping>("category");
  const [subgroupByTechnology, setSubgroupByTechnology] = useState(false);
  const items = candidates.filter(isItemEntity).filter((entity) => entity.status !== "draft");
  const visible = sortItems(
    items.filter(
      (entity) =>
        (type === "all" || entity.type === type) &&
        itemMatchesFilters(entity, filters) &&
        searchableEntityText(entity, (id) => entities.get(id)?.name).includes(
          search.toLocaleLowerCase("de")
        )
    ),
    sort
  );
  const activeFilters =
    countActiveItemFilters(filters) + Number(type !== "all") + Number(search.length > 0);
  const reset = (): void => {
    setSearch("");
    setType("all");
    setFilters(emptyItemFilters());
  };
  const cards = (groupItems: ItemEntity[]): ReactNode => (
    <div className="entity-grid">
      {groupItems.map((entity) => (
        <EntityCard
          key={entity.id}
          entity={entity}
          selected={selectedIds.includes(entity.id)}
          onSelect={() => onToggle(entity.id)}
          onDetails={() => onDetails(entity.id)}
        />
      ))}
    </div>
  );
  const grouped =
    grouping === "none"
      ? cards(visible)
      : [
          ...new Set(
            visible.map((item) => (grouping === "category" ? item.category : item.subcategory))
          )
        ]
          .sort((left, right) =>
            (grouping === "category"
              ? formatItemCategory(left as ItemEntity["category"])
              : formatItemSubcategory(left as ItemEntity["subcategory"])
            ).localeCompare(
              grouping === "category"
                ? formatItemCategory(right as ItemEntity["category"])
                : formatItemSubcategory(right as ItemEntity["subcategory"]),
              "de"
            )
          )
          .map((groupValue) => {
            const categoryItems = visible.filter((item) =>
              grouping === "category"
                ? item.category === groupValue
                : item.subcategory === groupValue
            );
            return (
              <section
                className="catalog-group"
                key={groupValue}
                data-category={grouping === "category" ? groupValue : undefined}
                data-subcategory={grouping === "subcategory" ? groupValue : undefined}
              >
                <header>
                  <h3>
                    {grouping === "category"
                      ? formatItemCategory(groupValue as ItemEntity["category"])
                      : formatItemSubcategory(groupValue as ItemEntity["subcategory"])}
                  </h3>
                  <span>{categoryItems.length}</span>
                </header>
                {subgroupByTechnology
                  ? [...new Set(categoryItems.map((item) => item.technologyLevel))]
                      .sort((left, right) =>
                        formatTechnologyLevel(left).localeCompare(
                          formatTechnologyLevel(right),
                          "de"
                        )
                      )
                      .map((technology) => {
                        const technologyItems = categoryItems.filter(
                          (item) => item.technologyLevel === technology
                        );
                        return (
                          <section
                            className="catalog-subgroup"
                            key={technology}
                            data-technology={technology}
                          >
                            <h4>
                              {formatTechnologyLevel(technology)}
                              <span>{technologyItems.length}</span>
                            </h4>
                            {cards(technologyItems)}
                          </section>
                        );
                      })
                  : cards(categoryItems)}
              </section>
            );
          });
  return (
    <section className="workspace-section" data-testid="equipment-catalog">
      <header className="section-heading">
        <div>
          <h2>Ausrüstung</h2>
          <p>{String(selectedIds.length)} Gegenstände · Inventar und Belastung</p>
        </div>
        <span className="count">{String(visible.length)}</span>
      </header>
      <div className="filter-bar">
        <SearchBar
          value={search}
          onChange={setSearch}
          onReset={activeFilters === 0 ? undefined : reset}
        />
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
      <ItemCatalogControls
        items={items}
        filters={filters}
        onFiltersChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        grouping={grouping}
        onGroupingChange={setGrouping}
        subgroupByTechnology={subgroupByTechnology}
        onSubgroupByTechnologyChange={setSubgroupByTechnology}
      />
      {activeFilters === 0 ? null : (
        <div className="active-filters">
          <Filter size={15} />
          {String(activeFilters)} aktive {activeFilters === 1 ? "Eingrenzung" : "Eingrenzungen"}
        </div>
      )}
      <div className="catalog-groups">{grouped}</div>
      {visible.length === 0 ? (
        <p className="empty-state">Keine Gegenstände entsprechen den gewählten Filtern.</p>
      ) : null}
    </section>
  );
};

const Compendium = ({ onDetails }: { onDetails: (id: string) => void }) => {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ContentEntity["type"] | "all">("all");
  const [status, setStatus] = useState<ContentEntity["status"] | "all">("all");
  const [limit, setLimit] = useState(96);
  const [itemFilters, setItemFilters] = useState<ItemCatalogFilters>(emptyItemFilters);
  const [itemSort, setItemSort] = useState<ItemSort>("name");
  const [itemGrouping, setItemGrouping] = useState<ItemGrouping>("none");
  const [subgroupByTechnology, setSubgroupByTechnology] = useState(false);
  const itemCandidates = catalog.entities.filter(isItemEntity);
  const itemFilterCount = countActiveItemFilters(itemFilters);
  const normalizedSearch = search.toLocaleLowerCase("de");
  const matching = catalog.entities.filter(
    (entity) =>
      (type === "all" || entity.type === type) &&
      (status === "all" || entity.status === status) &&
      (itemFilterCount === 0 ||
        (isItemEntity(entity) && itemMatchesFilters(entity, itemFilters))) &&
      searchableEntityText(entity, (id) => entities.get(id)?.name).includes(normalizedSearch)
  );
  const visible =
    matching.every(isItemEntity) && matching.length > 0 ? sortItems(matching, itemSort) : matching;
  const activeFilters =
    Number(type !== "all") + Number(status !== "all") + Number(search.length > 0) + itemFilterCount;
  const reset = (): void => {
    setSearch("");
    setType("all");
    setStatus("all");
    setItemFilters(emptyItemFilters());
    setLimit(96);
  };
  const displayed = visible.slice(0, limit);
  const renderCards = (values: ContentEntity[]): ReactNode => (
    <div className="entity-grid">
      {values.map((entity) => (
        <EntityCard
          key={entity.id}
          entity={entity}
          selected={false}
          showSelect={false}
          onSelect={() => undefined}
          onDetails={() => onDetails(entity.id)}
        />
      ))}
    </div>
  );
  const groupedContent =
    itemGrouping === "none"
      ? renderCards(displayed)
      : [
          ...[
            ...new Set(
              displayed
                .filter(isItemEntity)
                .map((entity) =>
                  itemGrouping === "category" ? entity.category : entity.subcategory
                )
            )
          ].map((groupValue) => {
            const categoryItems = displayed
              .filter(isItemEntity)
              .filter((entity) =>
                itemGrouping === "category"
                  ? entity.category === groupValue
                  : entity.subcategory === groupValue
              );
            return (
              <section
                className="catalog-group"
                key={groupValue}
                data-category={itemGrouping === "category" ? groupValue : undefined}
                data-subcategory={itemGrouping === "subcategory" ? groupValue : undefined}
              >
                <header>
                  <h3>
                    {itemGrouping === "category"
                      ? formatItemCategory(groupValue as ItemEntity["category"])
                      : formatItemSubcategory(groupValue as ItemEntity["subcategory"])}
                  </h3>
                  <span>{categoryItems.length}</span>
                </header>
                {subgroupByTechnology
                  ? [...new Set(categoryItems.map((item) => item.technologyLevel))].map(
                      (technology) => (
                        <section
                          className="catalog-subgroup"
                          key={technology}
                          data-technology={technology}
                        >
                          <h4>
                            {formatTechnologyLevel(technology)}
                            <span>
                              {
                                categoryItems.filter((item) => item.technologyLevel === technology)
                                  .length
                              }
                            </span>
                          </h4>
                          {renderCards(
                            categoryItems.filter((item) => item.technologyLevel === technology)
                          )}
                        </section>
                      )
                    )
                  : renderCards(categoryItems)}
              </section>
            );
          }),
          ...(displayed.some((entity) => !isItemEntity(entity))
            ? [
                <section className="catalog-group" key="other">
                  <header>
                    <h3>Weitere Inhalte</h3>
                    <span>{displayed.filter((entity) => !isItemEntity(entity)).length}</span>
                  </header>
                  {renderCards(displayed.filter((entity) => !isItemEntity(entity)))}
                </section>
              ]
            : [])
        ];
  return (
    <section className="workspace-section compendium" data-testid="compendium">
      <header className="section-heading">
        <div>
          <h2>Kompendium</h2>
          <p>Alle Regeln, Optionen, Gegenstände und Settinginhalte des geprüften Katalogs</p>
        </div>
        <span className="count">{String(visible.length)}</span>
      </header>
      <div className="compendium__filters">
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setLimit(96);
          }}
          onReset={activeFilters === 0 ? undefined : reset}
        />
        <label>
          <span>Inhaltstyp</span>
          <select
            aria-label="Inhaltstyp"
            value={type}
            onChange={(event) => {
              setType(event.target.value as ContentEntity["type"] | "all");
              setLimit(96);
            }}
          >
            <option value="all">Alle Inhaltstypen</option>
            {(
              [...new Set(catalog.entities.map((entity) => entity.type))] as ContentEntity["type"][]
            )
              .sort((left, right) => formatEntityType(left).localeCompare(formatEntityType(right)))
              .map((entityType) => (
                <option key={entityType} value={entityType}>
                  {formatEntityType(entityType)}
                </option>
              ))}
          </select>
        </label>
        <label>
          <span>Inhaltsstatus</span>
          <select
            aria-label="Inhaltsstatus"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ContentEntity["status"] | "all");
              setLimit(96);
            }}
          >
            <option value="all">Alle Statuswerte</option>
            {(["canonical", "playtest", "legacy", "draft"] as ContentEntity["status"][]).map(
              (contentStatus) => (
                <option key={contentStatus} value={contentStatus}>
                  {formatContentStatus(contentStatus)}
                </option>
              )
            )}
          </select>
        </label>
      </div>
      <ItemCatalogControls
        items={itemCandidates}
        filters={itemFilters}
        onFiltersChange={(value) => {
          setItemFilters(value);
          setLimit(96);
        }}
        sort={itemSort}
        onSortChange={setItemSort}
        grouping={itemGrouping}
        onGroupingChange={setItemGrouping}
        subgroupByTechnology={subgroupByTechnology}
        onSubgroupByTechnologyChange={setSubgroupByTechnology}
      />
      {activeFilters > 0 ? (
        <div className="active-filters">
          <Filter size={15} />
          {String(activeFilters)} aktive {activeFilters === 1 ? "Eingrenzung" : "Eingrenzungen"}
        </div>
      ) : null}
      <div className="catalog-groups">{groupedContent}</div>
      {visible.length === 0 ? (
        <p className="empty-state">Keine Einträge entsprechen den gewählten Filtern.</p>
      ) : null}
      {visible.length > limit ? (
        <button className="load-more" type="button" onClick={() => setLimit(visible.length)}>
          Alle {String(visible.length)} Einträge anzeigen
        </button>
      ) : null}
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
        <strong>{result.speed.value} Fuß</strong>
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
            <span>{formatSave(id as SaveId)}</span>
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
        <h3>Fertigkeiten</h3>
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
        <h3>Talente und Merkmale</h3>
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
      {String(catalog.entities.length)} geprüfte Inhalte · Status{" "}
      {validationStateLabels[result.state]}
    </footer>
  </article>
);
