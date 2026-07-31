import {
  Activity,
  Archive,
  Backpack,
  BatteryCharging,
  Check,
  ChevronDown,
  CirclePlus,
  Clipboard,
  Crosshair,
  Dices,
  FileText,
  HeartPulse,
  Info,
  Minus,
  Moon,
  NotebookPen,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Search,
  Shield,
  Sparkles,
  Swords,
  ToggleLeft,
  Trash2,
  UserRoundCog,
  WandSparkles
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import {
  addCondition,
  applyDamage,
  applyHealing,
  changeResource,
  removeCondition,
  removeManualModifier,
  recordActionUse,
  resetResources,
  restoreLimitedAction,
  restoreSpellSlot,
  rollDiceFormula,
  setConditionActive,
  setItemState,
  setManualModifierActive,
  setTemporaryHp,
  undoLastHpChange,
  upsertManualModifier,
  useLimitedAction,
  useSpellSlot,
  type CalculatedCharacter,
  type ExplainedValue
} from "@sotc/rules-engine";
import type { Catalog, CharacterDocument, CharacterSessionState } from "@sotc/shared";

import {
  attributeLabels,
  formatDamageType,
  formatItemCategory,
  formatSave,
  proficiencyRankLabels,
  traditionLabels,
  validationStateLabels
} from "../i18n/de.js";
import { buildSheetModel, type SheetView } from "./model.js";
import { PrintCharacterSheet } from "./PrintCharacterSheet.js";
import { createStatblock } from "./statblock.js";

interface CharacterSheetProps {
  catalog: Catalog;
  document: CharacterDocument;
  result: CalculatedCharacter;
  onChange: (document: CharacterDocument) => void;
  onEdit: (target?: "overview" | "spells" | "equipment" | "feats") => void;
  onDetails: (id: string) => void;
  onPrint: () => void;
  onSave: () => void;
  onExportJson: () => void;
}

const viewDefinitions: Array<{
  id: SheetView;
  label: string;
  icon: typeof Activity;
}> = [
  { id: "overview", label: "Übersicht", icon: Activity },
  { id: "combat", label: "Kampf", icon: Swords },
  { id: "actions", label: "Aktionen", icon: Crosshair },
  { id: "skills", label: "Fertigkeiten", icon: Dices },
  { id: "features", label: "Talente & Merkmale", icon: Sparkles },
  { id: "spells", label: "Zauber", icon: WandSparkles },
  { id: "inventory", label: "Inventar", icon: Backpack },
  { id: "resources", label: "Ressourcen", icon: BatteryCharging },
  { id: "biography", label: "Biografie & Notizen", icon: NotebookPen },
  { id: "export", label: "Bogen & Export", icon: FileText }
];

const signed = (value: number): string => `${value >= 0 ? "+" : ""}${String(value)}`;

const sessionId = (prefix: string): string => {
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${String(Date.now())}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}:${suffix.toLowerCase()}`;
};

const eventContext = (prefix: string, source?: string) => ({
  id: sessionId(prefix),
  createdAt: new Date().toISOString(),
  ...(source === undefined ? {} : { source })
});

const IconButton = ({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  tone = "quiet"
}: {
  icon: typeof Activity;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "quiet" | "primary" | "danger";
}) => (
  <button
    className={`sheet-icon-button sheet-icon-button--${tone}`}
    type="button"
    title={label}
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
  >
    <Icon size={17} />
  </button>
);

const SheetSection = ({
  title,
  subtitle,
  action,
  children,
  className = ""
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section className={`play-section ${className}`}>
    <header className="play-section__header">
      <div>
        <h3>{title}</h3>
        {subtitle === undefined ? null : <p>{subtitle}</p>}
      </div>
      {action}
    </header>
    {children}
  </section>
);

const Breakdown = ({ label, value }: { label: string; value: ExplainedValue }) => (
  <details className="value-breakdown">
    <summary>
      <span>{label}</span>
      <strong>{signed(value.value)}</strong>
      <ChevronDown size={15} />
    </summary>
    <div>
      {value.breakdown.length === 0 ? (
        <p>Keine Beiträge.</p>
      ) : (
        value.breakdown.map((entry, index) => (
          <p key={`${entry.sourceId}-${String(index)}`}>
            <span>{entry.label}</span>
            <strong>{signed(entry.value)}</strong>
          </p>
        ))
      )}
    </div>
  </details>
);

const EmptyMessage = ({ children }: { children: ReactNode }) => (
  <p className="sheet-empty">{children}</p>
);

export const CharacterSheet = ({
  catalog,
  document,
  result,
  onChange,
  onEdit,
  onDetails,
  onPrint,
  onSave,
  onExportJson
}: CharacterSheetProps) => {
  const model = useMemo(
    () => buildSheetModel(catalog, document, result),
    [catalog, document, result]
  );
  const [hpAmount, setHpAmount] = useState("1");
  const [conditionName, setConditionName] = useState("");
  const [conditionSource, setConditionSource] = useState("");
  const [conditionDuration, setConditionDuration] = useState("");
  const [conditionValue, setConditionValue] = useState("");
  const [conditionNote, setConditionNote] = useState("");
  const [actionSearch, setActionSearch] = useState("");
  const [actionCategory, setActionCategory] = useState("all");
  const [actionSource, setActionSource] = useState("all");
  const [actionAvailability, setActionAvailability] = useState("all");
  const [skillSort, setSkillSort] = useState<"name" | "value" | "attribute" | "rank">("name");
  const [trainedOnly, setTrainedOnly] = useState(false);
  const [featureSearch, setFeatureSearch] = useState("");
  const [diceFormula, setDiceFormula] = useState("1d20");
  const [modifierSource, setModifierSource] = useState("");
  const [modifierValue, setModifierValue] = useState("1");
  const [modifierTarget, setModifierTarget] =
    useState<CharacterSessionState["manualModifiers"][number]["target"]>("armor-class");
  const [modifierSelector, setModifierSelector] = useState("");
  const [modifierBonusType, setModifierBonusType] =
    useState<CharacterSessionState["manualModifiers"][number]["bonusType"]>("circumstance");
  const [modifierCondition, setModifierCondition] = useState("");
  const [modifierDuration, setModifierDuration] = useState("");
  const [modifierNote, setModifierNote] = useState("");
  const [resourceName, setResourceName] = useState("");
  const [resourceMaximum, setResourceMaximum] = useState("1");
  const [resourceRecovery, setResourceRecovery] =
    useState<CharacterSessionState["resources"][string]["recovery"]>("manual");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [liveMessage, setLiveMessage] = useState("");
  const [diceError, setDiceError] = useState("");

  const updateSession = (
    updater: (session: CharacterSessionState) => CharacterSessionState,
    message?: string,
    logEntry?: {
      kind: CharacterSessionState["log"][number]["kind"];
      label: string;
      detail?: string;
    }
  ): void => {
    const nextSession = updater(document.session);
    onChange({
      ...document,
      session:
        logEntry === undefined
          ? nextSession
          : {
              ...nextSession,
              log: [
                ...nextSession.log,
                {
                  id: sessionId("log"),
                  kind: logEntry.kind,
                  label: logEntry.label,
                  ...(logEntry.detail === undefined ? {} : { detail: logEntry.detail }),
                  createdAt: new Date().toISOString()
                }
              ].slice(-250)
            }
    });
    if (message !== undefined) {
      setLiveMessage(message);
    }
  };

  const setView = (view: SheetView): void => {
    updateSession((session) => ({ ...session, activeView: view }));
  };

  const numericHpAmount = (): number | undefined => {
    const amount = Number(hpAmount);
    return Number.isFinite(amount) && amount >= 0 ? amount : undefined;
  };

  const roll = (formula: string, source: string): void => {
    try {
      const rolled = rollDiceFormula(formula);
      setDiceError("");
      updateSession(
        (session) => ({
          ...session,
          diceHistory: [
            ...session.diceHistory,
            {
              id: sessionId("dice"),
              formula: rolled.formula,
              rolls: rolled.rolls,
              modifier: rolled.modifier,
              total: rolled.total,
              source,
              createdAt: new Date().toISOString()
            }
          ].slice(-100)
        }),
        `${source}: Zufallsergebnis ${String(rolled.total)}.`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Die Würfelformel ist ungültig.";
      setDiceError(message);
      setLiveMessage(`Fehler: ${message}`);
    }
  };

  const activeConditions = document.session.conditions.filter((condition) => condition.active);
  const primaryResource = Object.entries(result.session.resources)[0];
  const resourceLabel = (id: string): string =>
    document.session.resources[id]?.group ?? model.name(id);
  const removeOrphanedEntry = (
    session: CharacterSessionState,
    kind: CalculatedCharacter["session"]["orphanedEntries"][number]["kind"],
    id: string
  ): CharacterSessionState => {
    if (kind === "condition") {
      return { ...session, conditions: session.conditions.filter((entry) => entry.id !== id) };
    }
    if (kind === "modifier") {
      return {
        ...session,
        manualModifiers: session.manualModifiers.filter((entry) => entry.id !== id)
      };
    }
    const field = {
      resource: "resources",
      "spell-slot": "spellSlotUsage",
      action: "actionUses",
      item: "itemStates"
    }[kind] as "resources" | "spellSlotUsage" | "actionUses" | "itemStates";
    const entries = { ...session[field] };
    delete entries[id as keyof typeof entries];
    return { ...session, [field]: entries };
  };

  const hpControls = (
    <div className="hp-controls" aria-label="Trefferpunkte verwalten">
      <label>
        <span>Betrag</span>
        <input
          aria-label="Trefferpunkte-Betrag"
          type="number"
          min="0"
          step="1"
          value={hpAmount}
          onChange={(event) => setHpAmount(event.target.value)}
        />
      </label>
      <button
        type="button"
        className="command-button command-button--damage"
        onClick={() => {
          const amount = numericHpAmount();
          if (amount === undefined) {
            setLiveMessage("Fehler: Bitte einen gültigen Schadenswert eingeben.");
            return;
          }
          updateSession(
            (session) =>
              applyDamage(
                session,
                result.hitPoints.value,
                amount,
                eventContext("hp-damage", "Manueller Schaden")
              ),
            `${String(amount)} Schaden angewendet.`
          );
        }}
      >
        <Minus size={16} />
        Schaden
      </button>
      <button
        type="button"
        className="command-button command-button--heal"
        onClick={() => {
          const amount = numericHpAmount();
          if (amount === undefined) {
            setLiveMessage("Fehler: Bitte einen gültigen Heilwert eingeben.");
            return;
          }
          updateSession(
            (session) =>
              applyHealing(
                session,
                result.hitPoints.value,
                amount,
                eventContext("hp-healing", "Manuelle Heilung")
              ),
            `${String(amount)} Heilung angewendet.`
          );
        }}
      >
        <Plus size={16} />
        Heilung
      </button>
      <button
        type="button"
        className="command-button"
        onClick={() => {
          const amount = numericHpAmount();
          if (amount === undefined) {
            setLiveMessage("Fehler: Bitte gültige temporäre Trefferpunkte eingeben.");
            return;
          }
          updateSession(
            (session) =>
              setTemporaryHp(
                session,
                result.hitPoints.value,
                amount,
                eventContext("hp-temporary", "Temporäre Trefferpunkte")
              ),
            `Temporäre Trefferpunkte auf ${String(amount)} gesetzt.`
          );
        }}
      >
        <Shield size={16} />
        Temporär
      </button>
      <IconButton
        icon={RotateCcw}
        label="Letzte TP-Änderung rückgängig"
        onClick={() =>
          updateSession(
            (session) => undoLastHpChange(session, eventContext("hp-undo", "Rückgängig")),
            "Letzte Trefferpunkte-Änderung rückgängig gemacht."
          )
        }
        disabled={document.session.hpHistory.length === 0}
      />
    </div>
  );

  const conditionsPanel = (
    <SheetSection
      title="Zustände"
      subtitle={`${String(activeConditions.length)} aktiv`}
      className="conditions-panel"
    >
      <form
        className="condition-form"
        onSubmit={(event) => {
          event.preventDefault();
          const name = conditionName.trim();
          if (name.length === 0) {
            return;
          }
          const parsedValue =
            conditionValue.trim() === "" ? undefined : Number(conditionValue.trim());
          if (parsedValue !== undefined && !Number.isFinite(parsedValue)) {
            setLiveMessage("Fehler: Der Zustandswert muss eine gültige Zahl sein.");
            return;
          }
          const catalogCondition = model.conditionEntities.find(
            (condition) => condition.name === name
          );
          updateSession(
            (session) =>
              addCondition(session, {
                id: sessionId("condition"),
                ...(catalogCondition === undefined ? {} : { conditionId: catalogCondition.id }),
                name,
                source: conditionSource.trim() || "Manuell",
                ...(parsedValue === undefined ? {} : { value: parsedValue }),
                ...(conditionDuration.trim() === "" ? {} : { duration: conditionDuration.trim() }),
                ...(conditionNote.trim() === "" ? {} : { note: conditionNote.trim() }),
                startedAt: new Date().toISOString(),
                active: true
              }),
            `Zustand ${name} hinzugefügt.`,
            {
              kind: "condition",
              label: `${name} hinzugefügt`,
              detail: conditionSource.trim() || "Manuell"
            }
          );
          setConditionName("");
          setConditionSource("");
          setConditionDuration("");
          setConditionValue("");
          setConditionNote("");
        }}
      >
        <label>
          <span>Zustand</span>
          <input
            list="sheet-condition-options"
            value={conditionName}
            onChange={(event) => setConditionName(event.target.value)}
            placeholder="z. B. Benommen"
          />
          <datalist id="sheet-condition-options">
            {model.conditionEntities.map((condition) => (
              <option key={condition.id} value={condition.name} />
            ))}
          </datalist>
        </label>
        <label>
          <span>Quelle</span>
          <input
            value={conditionSource}
            onChange={(event) => setConditionSource(event.target.value)}
            placeholder="Manuell"
          />
        </label>
        <label>
          <span>Wert</span>
          <input
            type="number"
            value={conditionValue}
            onChange={(event) => setConditionValue(event.target.value)}
            placeholder="optional"
          />
        </label>
        <label>
          <span>Dauer</span>
          <input
            value={conditionDuration}
            onChange={(event) => setConditionDuration(event.target.value)}
            placeholder="z. B. 2 Runden"
          />
        </label>
        <label>
          <span>Notiz</span>
          <input
            value={conditionNote}
            onChange={(event) => setConditionNote(event.target.value)}
            placeholder="optional"
          />
        </label>
        <button
          type="submit"
          className="sheet-icon-button sheet-icon-button--primary"
          title="Zustand hinzufügen"
          aria-label="Zustand hinzufügen"
        >
          <CirclePlus size={17} />
        </button>
      </form>
      <div className="condition-list">
        {document.session.conditions.length === 0 ? (
          <EmptyMessage>Keine Zustände aktiv.</EmptyMessage>
        ) : (
          document.session.conditions.map((condition) => (
            <article
              className={condition.active ? "condition-row" : "condition-row is-inactive"}
              key={condition.id}
            >
              <button
                type="button"
                className="condition-row__toggle"
                onClick={() =>
                  updateSession(
                    (session) => setConditionActive(session, condition.id, !condition.active),
                    `${condition.name} ${condition.active ? "deaktiviert" : "aktiviert"}.`
                  )
                }
                aria-pressed={condition.active}
              >
                {condition.active ? <Check size={15} /> : <ToggleLeft size={15} />}
                <span>
                  <strong>{condition.name}</strong>
                  <small>
                    {condition.source}
                    {condition.duration === undefined ? "" : ` · ${condition.duration}`}
                  </small>
                </span>
              </button>
              <details className="condition-row__editor">
                <summary title={`${condition.name} bearbeiten`}>
                  <Pencil size={15} />
                  <span className="visually-hidden">{condition.name} bearbeiten</span>
                </summary>
                <div>
                  <label>
                    <span>Wert</span>
                    <input
                      type="number"
                      value={condition.value ?? ""}
                      onChange={(event) => {
                        const value =
                          event.target.value === "" ? undefined : Number(event.target.value);
                        updateSession((session) => ({
                          ...session,
                          conditions: session.conditions.map((entry) =>
                            entry.id === condition.id ? { ...entry, value } : entry
                          )
                        }));
                      }}
                    />
                  </label>
                  <label>
                    <span>Dauer</span>
                    <input
                      value={condition.duration ?? ""}
                      onChange={(event) =>
                        updateSession((session) => ({
                          ...session,
                          conditions: session.conditions.map((entry) =>
                            entry.id === condition.id
                              ? {
                                  ...entry,
                                  duration: event.target.value || undefined
                                }
                              : entry
                          )
                        }))
                      }
                    />
                  </label>
                  <label>
                    <span>Notiz</span>
                    <input
                      value={condition.note ?? ""}
                      onChange={(event) =>
                        updateSession((session) => ({
                          ...session,
                          conditions: session.conditions.map((entry) =>
                            entry.id === condition.id
                              ? { ...entry, note: event.target.value || undefined }
                              : entry
                          )
                        }))
                      }
                    />
                  </label>
                </div>
              </details>
              {condition.conditionId === undefined ? null : (
                <IconButton
                  icon={Info}
                  label={`${condition.name} öffnen`}
                  onClick={() => onDetails(condition.conditionId as string)}
                />
              )}
              <IconButton
                icon={Trash2}
                label={`${condition.name} entfernen`}
                tone="danger"
                onClick={() =>
                  updateSession(
                    (session) => removeCondition(session, condition.id),
                    `Zustand ${condition.name} entfernt.`
                  )
                }
              />
            </article>
          ))
        )}
      </div>
    </SheetSection>
  );

  const overviewView = (
    <div className="sheet-view-grid">
      <div className="sheet-view-main">
        <SheetSection title="Kernwerte" subtitle="Jeder Wert öffnet seine Engine-Aufschlüsselung">
          <div className="breakdown-grid">
            <Breakdown label="Rüstungsklasse" value={result.armorClass} />
            <Breakdown label="Wahrnehmung" value={result.perception} />
            <Breakdown label="Initiative" value={result.initiative} />
            <Breakdown label="Bewegung" value={result.speed} />
            {result.classDc === undefined ? null : (
              <Breakdown label="Klassen-SG" value={result.classDc} />
            )}
            {result.spellDc === undefined ? null : (
              <Breakdown label="Zauber-SG" value={result.spellDc} />
            )}
            {result.spellAttack === undefined ? null : (
              <Breakdown label="Zauberangriff" value={result.spellAttack} />
            )}
            <Breakdown label="Last" value={result.bulk} />
          </div>
        </SheetSection>
        <SheetSection title="Attribute">
          <div className="attribute-sheet-grid">
            {Object.entries(result.attributes).map(([id, value]) => (
              <article key={id}>
                <span>{attributeLabels[id as keyof typeof attributeLabels]}</span>
                <strong>{String(value.value)}</strong>
                <small>
                  Modifikator{" "}
                  {signed(result.attributeModifiers[id as keyof typeof result.attributeModifiers])}
                </small>
              </article>
            ))}
          </div>
        </SheetSection>
        <SheetSection title="Häufige Aktionen">
          <div className="quick-list">
            {model.actions.slice(0, 6).map((action) => (
              <button key={action.id} type="button" onClick={() => onDetails(action.id)}>
                <span>
                  <strong>{action.name}</strong>
                  <small>{action.sourceName}</small>
                </span>
                <b>{action.cost}</b>
              </button>
            ))}
            {model.actions.length === 0 ? (
              <EmptyMessage>Keine strukturierten Aktionen vorhanden.</EmptyMessage>
            ) : null}
          </div>
        </SheetSection>
      </div>
      <aside className="sheet-context-column">
        {conditionsPanel}
        <SheetSection title="Ressourcen" subtitle="Aktueller Sitzungsstand">
          <div className="resource-compact-list">
            {Object.entries(result.session.resources).map(([id, resource]) => (
              <button key={id} type="button" onClick={() => setView("resources")}>
                <span>{resourceLabel(id)}</span>
                <strong>
                  {String(resource.current)} / {String(resource.maximum)}
                </strong>
              </button>
            ))}
            {Object.keys(result.session.resources).length === 0 ? (
              <EmptyMessage>Keine strukturierten Ressourcen.</EmptyMessage>
            ) : null}
          </div>
        </SheetSection>
        {result.session.orphanedEntries.length === 0 ? null : (
          <SheetSection title="Session-Konflikte" subtitle="Quelle im Build nicht mehr vorhanden">
            <div className="session-conflicts">
              {result.session.orphanedEntries.map((entry) => (
                <div key={`${entry.kind}-${entry.id}`}>
                  <Archive size={14} />
                  <span>{entry.reason}</span>
                  <IconButton
                    icon={Trash2}
                    label={`Verwaisten Eintrag ${entry.id} entfernen`}
                    tone="danger"
                    onClick={() =>
                      updateSession(
                        (session) => removeOrphanedEntry(session, entry.kind, entry.id),
                        `Verwaister Session-Eintrag ${entry.id} entfernt.`
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </SheetSection>
        )}
      </aside>
    </div>
  );

  const combatView = (
    <div className="sheet-view-grid">
      <div className="sheet-view-main">
        <SheetSection title="Angriffe" subtitle="Nur aktuell ausgerüstete Waffen">
          <div className="attack-list">
            {model.attacks.map((attack) => (
              <article className="attack-row" key={attack.id}>
                <header>
                  <div>
                    <strong>{attack.name}</strong>
                    <span>
                      {attack.hands > 0 ? `${String(attack.hands)} Hand` : "Spezial"}
                      {attack.range === undefined ? "" : ` · ${attack.range}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="roll-value"
                    onClick={() => roll(`1d20${signed(attack.attack.value)}`, attack.name)}
                  >
                    <Dices size={16} />
                    {signed(attack.attack.value)}
                  </button>
                </header>
                <div className="attack-row__damage">
                  <span>Schaden</span>
                  <button
                    type="button"
                    onClick={() =>
                      roll(
                        `${attack.damage.dice}${signed(attack.damage.flat.value)}`,
                        `${attack.name} Schaden`
                      )
                    }
                  >
                    {attack.damage.dice}
                    {signed(attack.damage.flat.value)}
                  </button>
                  <span>{formatDamageType(attack.damage.type)}</span>
                </div>
                <footer>
                  {attack.capacity === undefined ? null : (
                    <span>Kapazität {String(attack.capacity)}</span>
                  )}
                  {attack.reload === undefined ? null : (
                    <span>Nachladen {String(attack.reload)}</span>
                  )}
                  {attack.traits.map((trait) => (
                    <span key={trait}>{model.name(trait)}</span>
                  ))}
                  <IconButton
                    icon={Info}
                    label={`${attack.name} öffnen`}
                    onClick={() => onDetails(attack.id)}
                  />
                </footer>
              </article>
            ))}
            {model.attacks.length === 0 ? (
              <EmptyMessage>Keine ausgerüstete Waffe mit strukturiertem Angriff.</EmptyMessage>
            ) : null}
          </div>
        </SheetSection>
        <SheetSection title="Rettungswürfe und Verteidigung">
          <div className="save-grid">
            {Object.entries(result.saves).map(([id, value]) => (
              <button
                key={id}
                type="button"
                onClick={() => roll(`1d20${signed(value.value)}`, formatSave(id as never))}
              >
                <span>{formatSave(id as never)}</span>
                <strong>{signed(value.value)}</strong>
                <Dices size={15} />
              </button>
            ))}
            <Breakdown label="Rüstungsklasse" value={result.armorClass} />
            <Breakdown label="Wahrnehmung" value={result.perception} />
          </div>
        </SheetSection>
      </div>
      <aside className="sheet-context-column">
        <SheetSection title="Trefferpunkte">{hpControls}</SheetSection>
        {conditionsPanel}
        <SheetSection title="TP-Verlauf" subtitle="Letzte Änderungen">
          <div className="session-log">
            {[...document.session.hpHistory]
              .reverse()
              .slice(0, 8)
              .map((entry) => (
                <article key={entry.id}>
                  <span>
                    <strong>
                      {
                        {
                          damage: "Schaden",
                          healing: "Heilung",
                          "temporary-hp": "Temporäre TP",
                          rest: "Rast",
                          undo: "Rückgängig"
                        }[entry.kind]
                      }
                    </strong>
                    <small>
                      {entry.source ?? `${String(entry.previousHp)} → ${String(entry.nextHp)}`}
                    </small>
                  </span>
                  <b>{String(entry.amount)}</b>
                </article>
              ))}
            {document.session.hpHistory.length === 0 ? (
              <EmptyMessage>Noch keine TP-Änderung.</EmptyMessage>
            ) : null}
          </div>
        </SheetSection>
      </aside>
    </div>
  );

  const filteredActions = model.actions.filter(
    (action) =>
      (actionCategory === "all" || action.category === actionCategory) &&
      (actionSource === "all" || action.sourceId === actionSource) &&
      (actionAvailability === "all" ||
        (actionAvailability === "limited" && action.maximum !== undefined) ||
        (actionAvailability === "used" && action.used > 0) ||
        (actionAvailability === "available" &&
          (action.maximum === undefined || action.used < action.maximum)) ||
        (actionAvailability === "unavailable" &&
          action.maximum !== undefined &&
          action.used >= action.maximum)) &&
      `${action.name} ${action.sourceName} ${action.summary}`
        .toLocaleLowerCase("de")
        .includes(actionSearch.toLocaleLowerCase("de"))
  );
  const actionsView = (
    <SheetSection title="Aktionen" subtitle={`${String(filteredActions.length)} sichtbar`}>
      <div className="sheet-filterbar">
        <label className="sheet-search">
          <Search size={16} />
          <span className="visually-hidden">Aktionen durchsuchen</span>
          <input
            value={actionSearch}
            onChange={(event) => setActionSearch(event.target.value)}
            placeholder="Aktionen durchsuchen"
          />
        </label>
        <label>
          <span className="visually-hidden">Aktionstyp</span>
          <select
            value={actionCategory}
            onChange={(event) => setActionCategory(event.target.value)}
          >
            <option value="all">Alle Aktionstypen</option>
            <option value="one">1 Aktion</option>
            <option value="two">2 Aktionen</option>
            <option value="three">3 Aktionen</option>
            <option value="free">Freie Aktion</option>
            <option value="reaction">Reaktion</option>
            <option value="exploration">Erkundung</option>
            <option value="downtime">Ausfallzeit</option>
            <option value="passive">Passiv</option>
          </select>
        </label>
        <label>
          <span>Quelle</span>
          <select value={actionSource} onChange={(event) => setActionSource(event.target.value)}>
            <option value="all">Alle Quellen</option>
            {[...new Map(model.actions.map((action) => [action.sourceId, action.sourceName]))].map(
              ([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            )}
          </select>
        </label>
        <label>
          <span>Verfügbarkeit</span>
          <select
            value={actionAvailability}
            onChange={(event) => setActionAvailability(event.target.value)}
          >
            <option value="all">Alle</option>
            <option value="available">Verfügbar</option>
            <option value="unavailable">Nicht nutzbar</option>
            <option value="limited">Mit Nutzungslimit</option>
            <option value="used">Bereits verwendet</option>
          </select>
        </label>
      </div>
      <div className="action-list">
        {filteredActions.map((action) => (
          <article key={action.id} className="action-row">
            <header>
              <div>
                <strong>{action.name}</strong>
                <span>{action.sourceName}</span>
              </div>
              <b>{action.cost}</b>
            </header>
            <p>{action.summary}</p>
            <footer>
              <div className="trait-line">
                {action.traits.map((trait) => (
                  <span key={trait}>{model.name(trait)}</span>
                ))}
              </div>
              <div className="usage-control">
                <IconButton
                  icon={Minus}
                  label={`${action.name} Nutzung zurücknehmen`}
                  disabled={action.used === 0}
                  onClick={() =>
                    updateSession(
                      (session) => restoreLimitedAction(session, action.id),
                      `${action.name}: Nutzung zurückgenommen.`
                    )
                  }
                />
                <span>
                  {action.maximum === undefined
                    ? `${String(action.used)} protokolliert`
                    : `${String(action.used)} / ${String(action.maximum)} verwendet`}
                </span>
                <IconButton
                  icon={Plus}
                  label={`${action.name} als verwendet markieren`}
                  disabled={action.maximum !== undefined && action.used >= action.maximum}
                  onClick={() =>
                    updateSession(
                      (session) =>
                        action.maximum === undefined
                          ? recordActionUse(session, action.id)
                          : useLimitedAction(session, action.id, action.maximum),
                      `${action.name}: Verwendung markiert.`,
                      { kind: "action-use", label: action.name, detail: "Verwendung markiert" }
                    )
                  }
                />
              </div>
              <IconButton
                icon={Info}
                label={`${action.name} öffnen`}
                onClick={() => onDetails(action.id)}
              />
            </footer>
          </article>
        ))}
        {filteredActions.length === 0 ? (
          <EmptyMessage>Keine Aktionen entsprechen den Filtern.</EmptyMessage>
        ) : null}
      </div>
    </SheetSection>
  );

  const rankOrder = ["untrained", "trained", "expert", "master", "legendary"];
  const visibleSkills = [...model.skills]
    .filter((skill) => !trainedOnly || skill.rank !== "untrained")
    .sort((left, right) => {
      if (skillSort === "value") {
        return right.value.value - left.value.value;
      }
      if (skillSort === "attribute") {
        return left.attribute.localeCompare(right.attribute);
      }
      if (skillSort === "rank") {
        return rankOrder.indexOf(right.rank) - rankOrder.indexOf(left.rank);
      }
      return left.name.localeCompare(right.name, "de");
    });
  const skillsView = (
    <SheetSection title="Fertigkeiten" subtitle={`${String(visibleSkills.length)} sichtbar`}>
      <div className="sheet-filterbar">
        <label>
          <span>Sortierung</span>
          <select
            value={skillSort}
            onChange={(event) => setSkillSort(event.target.value as typeof skillSort)}
          >
            <option value="name">Alphabetisch</option>
            <option value="value">Gesamtwert</option>
            <option value="attribute">Attribut</option>
            <option value="rank">Kompetenzrang</option>
          </select>
        </label>
        <label className="sheet-checkbox">
          <input
            type="checkbox"
            checked={trainedOnly}
            onChange={(event) => setTrainedOnly(event.target.checked)}
          />
          Nur geübte
        </label>
      </div>
      <div className="skill-table" role="table" aria-label="Fertigkeiten">
        <div role="row" className="skill-table__head">
          <span role="columnheader">Fertigkeit</span>
          <span role="columnheader">Attribut</span>
          <span role="columnheader">Rang</span>
          <span role="columnheader">Wert</span>
        </div>
        {visibleSkills.map((skill) => (
          <div role="row" className="skill-row" key={skill.id}>
            <button type="button" onClick={() => onDetails(skill.id)} role="cell">
              {skill.name}
            </button>
            <span role="cell">
              {attributeLabels[skill.attribute as keyof typeof attributeLabels] ?? skill.attribute}
            </span>
            <span role="cell">{proficiencyRankLabels[skill.rank]}</span>
            <button
              type="button"
              className="roll-value"
              role="cell"
              onClick={() => roll(`1d20${signed(skill.value.value)}`, skill.name)}
            >
              {signed(skill.value.value)}
              <Dices size={15} />
            </button>
          </div>
        ))}
      </div>
    </SheetSection>
  );

  const visibleFeatures = model.features.filter((feature) =>
    `${feature.name} ${feature.summary} ${feature.rulesText}`
      .toLocaleLowerCase("de")
      .includes(featureSearch.toLocaleLowerCase("de"))
  );
  const featuresView = (
    <SheetSection
      title="Talente und Merkmale"
      subtitle={`${String(visibleFeatures.length)} Einträge`}
      action={
        <IconButton
          icon={Pencil}
          label="Talente im Creator bearbeiten"
          onClick={() => onEdit("feats")}
        />
      }
    >
      <label className="sheet-search sheet-search--wide">
        <Search size={16} />
        <span className="visually-hidden">Talente und Merkmale durchsuchen</span>
        <input
          value={featureSearch}
          onChange={(event) => setFeatureSearch(event.target.value)}
          placeholder="Talente und Merkmale durchsuchen"
        />
      </label>
      <div className="feature-list">
        {visibleFeatures.map((feature) => (
          <article key={feature.id}>
            <header>
              <div>
                <strong>{feature.name}</strong>
                <span>
                  {feature.type === "feat"
                    ? `${feature.category} · Stufe ${String(feature.level)}`
                    : "Klassenmerkmal"}
                </span>
              </div>
              <IconButton
                icon={Info}
                label={`${feature.name} öffnen`}
                onClick={() => onDetails(feature.id)}
              />
            </header>
            <p>{feature.summary}</p>
            <footer>
              {feature.traits.map((trait) => (
                <span key={trait}>{model.name(trait)}</span>
              ))}
            </footer>
          </article>
        ))}
      </div>
    </SheetSection>
  );

  const spellsView = (
    <div className="sheet-view-grid">
      <div className="sheet-view-main">
        <SheetSection title="Zauberplätze" subtitle="Verbrauch ist Session State">
          <div className="spell-slot-grid">
            {result.spellSlots.map((slot) => {
              const used = result.session.spellSlotUsage[String(slot.rank)] ?? 0;
              return (
                <article key={slot.rank}>
                  <header>
                    <span>Rang {String(slot.rank)}</span>
                    <strong>
                      {String(slot.slots.value - used)} / {String(slot.slots.value)}
                    </strong>
                  </header>
                  <div className="slot-pips" aria-label={`${String(used)} Plätze verbraucht`}>
                    {Array.from({ length: slot.slots.value }, (_, index) => (
                      <span key={index} className={index < used ? "is-used" : ""} />
                    ))}
                  </div>
                  <footer>
                    <IconButton
                      icon={RotateCcw}
                      label={`Zauberplatz Rang ${String(slot.rank)} wiederherstellen`}
                      disabled={used === 0}
                      onClick={() =>
                        updateSession(
                          (session) => restoreSpellSlot(session, slot.rank),
                          `Zauberplatz Rang ${String(slot.rank)} wiederhergestellt.`
                        )
                      }
                    />
                    <IconButton
                      icon={Minus}
                      label={`Zauberplatz Rang ${String(slot.rank)} verbrauchen`}
                      disabled={used >= slot.slots.value}
                      tone="primary"
                      onClick={() =>
                        updateSession(
                          (session) => useSpellSlot(session, slot.rank, slot.slots.value),
                          `Zauberplatz Rang ${String(slot.rank)} verbraucht.`,
                          {
                            kind: "spell-slot",
                            label: `Zauberplatz Rang ${String(slot.rank)}`,
                            detail: "Verbraucht"
                          }
                        )
                      }
                    />
                  </footer>
                </article>
              );
            })}
            {result.spellSlots.length === 0 ? (
              <EmptyMessage>Dieser Charakter besitzt keine Zauberplätze.</EmptyMessage>
            ) : null}
          </div>
        </SheetSection>
        <SheetSection
          title="Bekannte Zauber"
          subtitle={`${String(model.spells.length)} Zauber`}
          action={
            <IconButton
              icon={Pencil}
              label="Zauber im Creator bearbeiten"
              onClick={() => onEdit("spells")}
            />
          }
        >
          <div className="spell-list">
            {model.spells.map((spell) => {
              const used = result.session.spellSlotUsage[String(spell.rank)] ?? 0;
              const slot = result.spellSlots.find((entry) => entry.rank === spell.rank);
              return (
                <article key={spell.id}>
                  <header>
                    <div>
                      <strong>{spell.name}</strong>
                      <span>
                        {spell.rank === 0 ? "Zaubertrick" : `Rang ${String(spell.rank)}`} ·{" "}
                        {model.name(spell.source)}
                      </span>
                    </div>
                    <b>
                      {spell.actions.kind === "fixed"
                        ? `${String(spell.actions.value)}A`
                        : spell.actions.kind}
                    </b>
                  </header>
                  <p>{spell.summary}</p>
                  <footer>
                    <span>
                      {spell.traditions.map((tradition) => traditionLabels[tradition]).join(" · ")}
                    </span>
                    <IconButton
                      icon={Info}
                      label={`${spell.name} öffnen`}
                      onClick={() => onDetails(spell.id)}
                    />
                    {spell.rank === 0 || slot === undefined ? null : (
                      <button
                        type="button"
                        className="command-button"
                        disabled={used >= slot.slots.value}
                        onClick={() =>
                          updateSession(
                            (session) => useSpellSlot(session, spell.rank, slot.slots.value),
                            `${spell.name} gewirkt; Zauberplatz Rang ${String(spell.rank)} verbraucht.`,
                            { kind: "spell-slot", label: spell.name, detail: "Gewirkt" }
                          )
                        }
                      >
                        <WandSparkles size={15} />
                        Wirken
                      </button>
                    )}
                  </footer>
                </article>
              );
            })}
          </div>
        </SheetSection>
      </div>
      <aside className="sheet-context-column">
        <SheetSection title="Zauberwerte">
          {result.spellAttack === undefined ? (
            <EmptyMessage>Keine strukturierte Zauberprogression.</EmptyMessage>
          ) : (
            <div className="breakdown-stack">
              <Breakdown label="Zauberangriff" value={result.spellAttack} />
              {result.spellDc === undefined ? null : (
                <Breakdown label="Zauber-SG" value={result.spellDc} />
              )}
            </div>
          )}
        </SheetSection>
      </aside>
    </div>
  );

  const inventoryView = (
    <SheetSection
      title="Inventar"
      subtitle={`Last ${String(result.bulk.value)} · ${String(model.inventory.length)} Gegenstände`}
      action={
        <IconButton
          icon={Pencil}
          label="Ausrüstung im Creator bearbeiten"
          onClick={() => onEdit("equipment")}
        />
      }
    >
      <div className="inventory-list">
        {model.inventory.map((item) => {
          const state = document.session.itemStates[item.id] ?? {
            quantity: 1,
            equipped: false,
            active: false,
            consumed: 0,
            location: "carried" as const
          };
          return (
            <article key={item.id} className={state.equipped ? "is-equipped" : ""}>
              <header>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {formatItemCategory(item.category)} · Stufe {String(item.level)} ·{" "}
                    {String(item.bulk)} Last
                  </span>
                </div>
                <IconButton
                  icon={Info}
                  label={`${item.name} öffnen`}
                  onClick={() => onDetails(item.id)}
                />
              </header>
              <div className="inventory-controls">
                <label>
                  <span>Menge</span>
                  <input
                    type="number"
                    min="0"
                    value={state.quantity}
                    onChange={(event) =>
                      updateSession(
                        (session) =>
                          setItemState(session, item.id, {
                            quantity: Math.max(0, Number(event.target.value))
                          }),
                        `${item.name}: Menge geändert.`
                      )
                    }
                  />
                </label>
                <label className="sheet-checkbox">
                  <input
                    type="checkbox"
                    checked={state.equipped}
                    onChange={(event) =>
                      updateSession(
                        (session) =>
                          setItemState(session, item.id, {
                            equipped: event.target.checked,
                            location: event.target.checked ? "equipped" : "carried"
                          }),
                        `${item.name} ${event.target.checked ? "ausgerüstet" : "abgelegt"}.`
                      )
                    }
                  />
                  Ausgerüstet
                </label>
                <label className="sheet-checkbox">
                  <input
                    type="checkbox"
                    checked={state.active}
                    onChange={(event) =>
                      updateSession(
                        (session) =>
                          setItemState(session, item.id, { active: event.target.checked }),
                        `${item.name} ${event.target.checked ? "aktiviert" : "deaktiviert"}.`
                      )
                    }
                  />
                  Aktiv
                </label>
                <label>
                  <span>Ort</span>
                  <select
                    value={state.location}
                    onChange={(event) =>
                      updateSession(
                        (session) =>
                          setItemState(session, item.id, {
                            location: event.target.value as "equipped" | "carried" | "stowed",
                            equipped: event.target.value === "equipped"
                          }),
                        `${item.name}: Aufbewahrungsort geändert.`
                      )
                    }
                  >
                    <option value="equipped">Ausgerüstet</option>
                    <option value="carried">Getragen</option>
                    <option value="stowed">Verstaut</option>
                  </select>
                </label>
                <label>
                  <span>Verbraucht</span>
                  <input
                    type="number"
                    min="0"
                    max={state.quantity}
                    value={state.consumed}
                    onChange={(event) =>
                      updateSession(
                        (session) =>
                          setItemState(session, item.id, {
                            consumed: Math.max(
                              0,
                              Math.min(state.quantity, Number(event.target.value))
                            )
                          }),
                        `${item.name}: Verbrauch geändert.`
                      )
                    }
                  />
                </label>
                {"capacity" in item && item.capacity !== undefined ? (
                  <label>
                    <span>Munition</span>
                    <input
                      type="number"
                      min="0"
                      max={item.capacity}
                      value={state.ammunition ?? item.capacity}
                      onChange={(event) =>
                        updateSession(
                          (session) =>
                            setItemState(session, item.id, {
                              ammunition: Math.max(
                                0,
                                Math.min(item.capacity as number, Number(event.target.value))
                              )
                            }),
                          `${item.name}: Munition geändert.`
                        )
                      }
                    />
                  </label>
                ) : null}
                <label className="inventory-controls__notes">
                  <span>Notiz</span>
                  <input
                    value={state.notes ?? ""}
                    onChange={(event) =>
                      updateSession((session) =>
                        setItemState(session, item.id, {
                          notes: event.target.value || undefined
                        })
                      )
                    }
                    placeholder="Munition, Modifikation, Herkunft …"
                  />
                </label>
              </div>
            </article>
          );
        })}
        {model.inventory.length === 0 ? (
          <EmptyMessage>
            Das Buildinventar ist leer. Gegenstände werden im Creator erworben.
          </EmptyMessage>
        ) : null}
      </div>
    </SheetSection>
  );

  const resourcesView = (
    <div className="sheet-view-grid">
      <div className="sheet-view-main">
        <SheetSection
          title="Ressourcen"
          subtitle="Wiederherstellung folgt der strukturierten Ressourcenregel"
          action={
            <div className="rest-actions">
              <button
                type="button"
                onClick={() =>
                  updateSession(
                    (session) => resetResources(session, "encounter"),
                    "Begegnungsressourcen zurückgesetzt.",
                    { kind: "rest", label: "Begegnungsreset" }
                  )
                }
              >
                Begegnung
              </button>
              <button
                type="button"
                onClick={() =>
                  updateSession(
                    (session) => resetResources(session, "short-rest"),
                    "Ressourcen der kurzen Rast wiederhergestellt.",
                    { kind: "rest", label: "Kurze Rast" }
                  )
                }
              >
                Kurze Rast
              </button>
              <button
                type="button"
                onClick={() =>
                  updateSession(
                    (session) => resetResources(session, "daily"),
                    "Tagesressourcen wiederhergestellt.",
                    { kind: "rest", label: "Tagesrast" }
                  )
                }
              >
                Tagesrast
              </button>
            </div>
          }
        >
          <form
            className="resource-form"
            onSubmit={(event) => {
              event.preventDefault();
              const name = resourceName.trim();
              const maximum = Number(resourceMaximum);
              if (name === "" || !Number.isFinite(maximum) || maximum < 0) {
                setLiveMessage("Fehler: Ressource und gültiges Maximum angeben.");
                return;
              }
              const slug =
                name
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLocaleLowerCase("de")
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "") || "wert";
              const id = `resource.session-${slug}`;
              updateSession(
                (session) => ({
                  ...session,
                  resources: {
                    ...session.resources,
                    [id]: {
                      current: maximum,
                      maximum,
                      recovery: resourceRecovery,
                      group: name
                    }
                  }
                }),
                `Ressource ${name} hinzugefügt.`,
                { kind: "resource", label: name, detail: `Maximum ${String(maximum)}` }
              );
              setResourceName("");
              setResourceMaximum("1");
            }}
          >
            <label>
              <span>Ressource</span>
              <input
                value={resourceName}
                onChange={(event) => setResourceName(event.target.value)}
                placeholder="z. B. Fokus"
              />
            </label>
            <label>
              <span>Maximum</span>
              <input
                type="number"
                min="0"
                value={resourceMaximum}
                onChange={(event) => setResourceMaximum(event.target.value)}
              />
            </label>
            <label>
              <span>Regeneration</span>
              <select
                value={resourceRecovery}
                onChange={(event) =>
                  setResourceRecovery(
                    event.target.value as CharacterSessionState["resources"][string]["recovery"]
                  )
                }
              >
                <option value="encounter">Begegnung</option>
                <option value="short-rest">Kurze Rast</option>
                <option value="daily">Tagesrast</option>
                <option value="manual">Manuell</option>
                <option value="never">Keine</option>
              </select>
            </label>
            <button
              type="submit"
              className="sheet-icon-button sheet-icon-button--primary"
              title="Ressource hinzufügen"
              aria-label="Ressource hinzufügen"
            >
              <CirclePlus size={17} />
            </button>
          </form>
          <div className="resource-list">
            {Object.entries(result.session.resources).map(([id, resource]) => (
              <article key={id}>
                <header>
                  <div>
                    <strong>{resourceLabel(id)}</strong>
                    <span>{resource.recovery}</span>
                  </div>
                  <b>
                    {String(resource.current)} / {String(resource.maximum)}
                  </b>
                </header>
                <div className="resource-meter">
                  <span
                    style={{
                      width: `${
                        resource.maximum === 0
                          ? 0
                          : Math.round((resource.current / resource.maximum) * 100)
                      }%`
                    }}
                  />
                </div>
                <footer>
                  <IconButton
                    icon={Minus}
                    label={`${resourceLabel(id)} reduzieren`}
                    disabled={resource.current <= 0}
                    onClick={() =>
                      updateSession(
                        (session) =>
                          changeResource(
                            session,
                            id,
                            -1,
                            resource.maximum,
                            resource.recovery,
                            resource.sourceId
                          ),
                        `${resourceLabel(id)} reduziert.`,
                        { kind: "resource", label: resourceLabel(id), detail: "-1" }
                      )
                    }
                  />
                  <IconButton
                    icon={Plus}
                    label={`${resourceLabel(id)} erhöhen`}
                    disabled={resource.current >= resource.maximum}
                    onClick={() =>
                      updateSession(
                        (session) =>
                          changeResource(
                            session,
                            id,
                            1,
                            resource.maximum,
                            resource.recovery,
                            resource.sourceId
                          ),
                        `${resourceLabel(id)} erhöht.`,
                        { kind: "resource", label: resourceLabel(id), detail: "+1" }
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateSession(
                        (session) =>
                          changeResource(
                            session,
                            id,
                            resource.maximum,
                            resource.maximum,
                            resource.recovery,
                            resource.sourceId
                          ),
                        `${resourceLabel(id)} vollständig aufgefüllt.`,
                        { kind: "resource", label: resourceLabel(id), detail: "Aufgefüllt" }
                      )
                    }
                  >
                    Auffüllen
                  </button>
                </footer>
              </article>
            ))}
            {Object.keys(result.session.resources).length === 0 ? (
              <EmptyMessage>Der aktuelle Build stellt keine Ressourcen bereit.</EmptyMessage>
            ) : null}
          </div>
        </SheetSection>
        <SheetSection
          title="Temporäre Modifikatoren"
          subtitle="Immer sichtbar und einzeln schaltbar"
        >
          <form
            className="modifier-form"
            onSubmit={(event) => {
              event.preventDefault();
              const value = Number(modifierValue);
              if (!Number.isFinite(value) || modifierSource.trim() === "") {
                return;
              }
              updateSession(
                (session) =>
                  upsertManualModifier(session, {
                    id: sessionId("modifier"),
                    target: modifierTarget,
                    ...(modifierSelector === "" ? {} : { selector: modifierSelector }),
                    value,
                    bonusType: modifierBonusType,
                    source: modifierSource.trim(),
                    ...(modifierCondition.trim() === ""
                      ? {}
                      : { condition: modifierCondition.trim() }),
                    ...(modifierDuration.trim() === ""
                      ? {}
                      : { duration: modifierDuration.trim() }),
                    ...(modifierNote.trim() === "" ? {} : { note: modifierNote.trim() }),
                    active: true
                  }),
                `Modifikator ${modifierSource.trim()} hinzugefügt.`
              );
              setModifierSource("");
              setModifierValue("1");
              setModifierCondition("");
              setModifierDuration("");
              setModifierNote("");
            }}
          >
            <label>
              <span>Zielwert</span>
              <select
                value={modifierTarget}
                onChange={(event) => {
                  setModifierTarget(event.target.value as typeof modifierTarget);
                  setModifierSelector("");
                }}
              >
                <option value="armor-class">Rüstungsklasse</option>
                <option value="perception">Wahrnehmung</option>
                <option value="initiative">Initiative</option>
                <option value="speed">Bewegung</option>
                <option value="class-dc">Klassen-SG</option>
                <option value="spell-dc">Zauber-SG</option>
                <option value="spell-attack">Zauberangriff</option>
                <option value="hit-points">Trefferpunkte</option>
                <option value="skill">Fertigkeit</option>
                <option value="save">Rettungswurf</option>
                <option value="weapon-attack">Waffenangriff</option>
                <option value="weapon-damage">Waffenschaden</option>
                <option value="attribute-score">Attributswert</option>
              </select>
            </label>
            {modifierTarget === "attribute-score" ? (
              <label>
                <span>Attribut</span>
                <select
                  value={modifierSelector}
                  onChange={(event) => setModifierSelector(event.target.value)}
                >
                  <option value="">Alle</option>
                  {Object.keys(result.attributes).map((id) => (
                    <option key={id} value={id}>
                      {attributeLabels[id as keyof typeof attributeLabels]}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {modifierTarget === "skill" ? (
              <label>
                <span>Fertigkeit</span>
                <select
                  value={modifierSelector}
                  onChange={(event) => setModifierSelector(event.target.value)}
                >
                  <option value="">Alle</option>
                  {model.skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {modifierTarget === "save" ? (
              <label>
                <span>Rettungswurf</span>
                <select
                  value={modifierSelector}
                  onChange={(event) => setModifierSelector(event.target.value)}
                >
                  <option value="">Alle</option>
                  {Object.keys(result.saves).map((id) => (
                    <option key={id} value={id}>
                      {formatSave(id as never)}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {modifierTarget === "weapon-attack" || modifierTarget === "weapon-damage" ? (
              <label>
                <span>Waffe</span>
                <select
                  value={modifierSelector}
                  onChange={(event) => setModifierSelector(event.target.value)}
                >
                  <option value="">Alle</option>
                  {model.attacks.map((attack) => (
                    <option key={attack.id} value={attack.id}>
                      {attack.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label>
              <span>Wert</span>
              <input
                type="number"
                value={modifierValue}
                onChange={(event) => setModifierValue(event.target.value)}
              />
            </label>
            <label>
              <span>Bonustyp</span>
              <select
                value={modifierBonusType}
                onChange={(event) =>
                  setModifierBonusType(
                    event.target
                      .value as CharacterSessionState["manualModifiers"][number]["bonusType"]
                  )
                }
              >
                <option value="circumstance">Umstand</option>
                <option value="status">Status</option>
                <option value="item">Gegenstand</option>
                <option value="untyped">Unbenannt</option>
              </select>
            </label>
            <label>
              <span>Quelle</span>
              <input
                value={modifierSource}
                onChange={(event) => setModifierSource(event.target.value)}
                placeholder="z. B. Deckung"
              />
            </label>
            <label>
              <span>Bedingung</span>
              <input
                value={modifierCondition}
                onChange={(event) => setModifierCondition(event.target.value)}
                placeholder="optional"
              />
            </label>
            <label>
              <span>Dauer</span>
              <input
                value={modifierDuration}
                onChange={(event) => setModifierDuration(event.target.value)}
                placeholder="optional"
              />
            </label>
            <label>
              <span>Notiz</span>
              <input
                value={modifierNote}
                onChange={(event) => setModifierNote(event.target.value)}
                placeholder="optional"
              />
            </label>
            <button type="submit" className="command-button">
              <Plus size={15} />
              Hinzufügen
            </button>
          </form>
          <div className="modifier-list">
            {document.session.manualModifiers.map((modifier) => (
              <article key={modifier.id} className={modifier.active ? "" : "is-inactive"}>
                <button
                  type="button"
                  onClick={() =>
                    updateSession(
                      (session) => setManualModifierActive(session, modifier.id, !modifier.active),
                      `${modifier.source} ${modifier.active ? "deaktiviert" : "aktiviert"}.`
                    )
                  }
                >
                  <span>
                    <strong>{modifier.source}</strong>
                    <small>{modifier.target}</small>
                  </span>
                  <b>{signed(modifier.value)}</b>
                </button>
                <IconButton
                  icon={Trash2}
                  label={`${modifier.source} entfernen`}
                  tone="danger"
                  onClick={() =>
                    updateSession(
                      (session) => removeManualModifier(session, modifier.id),
                      `Modifikator ${modifier.source} entfernt.`
                    )
                  }
                />
              </article>
            ))}
          </div>
        </SheetSection>
      </div>
      <aside className="sheet-context-column">
        <SheetSection title="Würfelablage">
          <form
            className="dice-form"
            onSubmit={(event) => {
              event.preventDefault();
              roll(diceFormula, "Benutzerdefinierter Wurf");
            }}
          >
            <label>
              <span>Formel</span>
              <input
                value={diceFormula}
                onChange={(event) => setDiceFormula(event.target.value)}
                aria-invalid={diceError !== ""}
              />
            </label>
            <button type="submit" className="command-button command-button--primary">
              <Dices size={16} />
              Würfeln
            </button>
          </form>
          {diceError === "" ? null : <p className="field-error">{diceError}</p>}
          <div className="dice-history">
            {[...document.session.diceHistory]
              .reverse()
              .slice(0, 12)
              .map((entry) => (
                <article key={entry.id}>
                  <span>
                    <strong>{entry.source ?? "Wurf"}</strong>
                    <small>{entry.formula}</small>
                  </span>
                  <b>{String(entry.total)}</b>
                </article>
              ))}
          </div>
        </SheetSection>
        <SheetSection title="Sitzungsverlauf" subtitle="Ressourcen, Rast und Nutzungen">
          <div className="session-log">
            {[...document.session.log]
              .reverse()
              .slice(0, 20)
              .map((entry) => (
                <article key={entry.id}>
                  <span>
                    <strong>{entry.label}</strong>
                    <small>{entry.detail ?? entry.kind}</small>
                  </span>
                  <time dateTime={entry.createdAt}>
                    {new Date(entry.createdAt).toLocaleTimeString("de-DE", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </time>
                </article>
              ))}
            {document.session.log.length === 0 ? (
              <EmptyMessage>Noch keine protokollierten Ereignisse.</EmptyMessage>
            ) : null}
          </div>
        </SheetSection>
      </aside>
    </div>
  );

  const biographyFields = [
    ["description", "Charakterbeschreibung"],
    ["appearance", "Erscheinungsbild"],
    ["personality", "Persönlichkeit"],
    ["motivation", "Motivation"],
    ["relationships", "Beziehungen"],
    ["organizations", "Organisationen"],
    ["contacts", "Kontakte"],
    ["goals", "Ziele"],
    ["backgroundNotes", "Hintergrundnotizen"]
  ] as const;
  const biographyView = (
    <div className="sheet-view-grid">
      <div className="sheet-view-main">
        <SheetSection title="Biografie" subtitle="Dauerhafter Bestandteil des Builds">
          <div className="biography-form">
            {biographyFields.map(([key, label]) => (
              <label key={key}>
                <span>{label}</span>
                <textarea
                  value={document.build.biography[key]}
                  onChange={(event) =>
                    onChange({
                      ...document,
                      build: {
                        ...document.build,
                        biography: {
                          ...document.build.biography,
                          [key]: event.target.value
                        }
                      }
                    })
                  }
                />
              </label>
            ))}
          </div>
        </SheetSection>
      </div>
      <aside className="sheet-context-column">
        <SheetSection title="Sitzungsnotizen" subtitle="Mehrere datierte Einträge">
          <form
            className="note-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (noteTitle.trim() === "") {
                return;
              }
              const now = new Date().toISOString();
              updateSession(
                (session) => ({
                  ...session,
                  notes: [
                    ...session.notes,
                    {
                      id: sessionId("note"),
                      title: noteTitle.trim(),
                      body: noteBody,
                      createdAt: now,
                      updatedAt: now
                    }
                  ]
                }),
                `Notiz ${noteTitle.trim()} angelegt.`
              );
              setNoteTitle("");
              setNoteBody("");
            }}
          >
            <label>
              <span>Titel</span>
              <input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} />
            </label>
            <label>
              <span>Notiz</span>
              <textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} />
            </label>
            <button type="submit" className="command-button">
              <Plus size={15} />
              Eintrag anlegen
            </button>
          </form>
          <div className="note-list">
            {[...document.session.notes].reverse().map((note) => (
              <article key={note.id}>
                <header>
                  <div>
                    <strong>{note.title}</strong>
                    <span>{new Date(note.updatedAt).toLocaleDateString("de-DE")}</span>
                  </div>
                  <IconButton
                    icon={Trash2}
                    label={`${note.title} löschen`}
                    tone="danger"
                    onClick={() =>
                      updateSession(
                        (session) => ({
                          ...session,
                          notes: session.notes.filter((entry) => entry.id !== note.id)
                        }),
                        `Notiz ${note.title} gelöscht.`
                      )
                    }
                  />
                </header>
                <p>{note.body}</p>
              </article>
            ))}
          </div>
        </SheetSection>
      </aside>
    </div>
  );

  const statblockText = createStatblock(document, result, model);
  const exportView = (
    <div className="sheet-view-grid">
      <div className="sheet-view-main">
        <SheetSection
          title="Vollständiger Charakterbogen"
          subtitle="Mehrseitige Druckansicht auf A4"
        >
          <div className="export-actions">
            <button type="button" onClick={onPrint}>
              <Printer size={20} />
              <span>
                <strong>Drucken / PDF</strong>
                <small>Browserdruck mit eigenständigem Seitenlayout</small>
              </span>
            </button>
            <button type="button" onClick={onExportJson}>
              <FileText size={20} />
              <span>
                <strong>JSON exportieren</strong>
                <small>Build und vollständiger Session State</small>
              </span>
            </button>
          </div>
        </SheetSection>
        <SheetSection title="Kompakter Statblock" subtitle="Für schnelle Referenz und Weitergabe">
          <pre className="statblock-text">{statblockText}</pre>
          <button
            type="button"
            className="command-button"
            onClick={() => {
              void navigator.clipboard.writeText(statblockText);
              setLiveMessage("Statblock in die Zwischenablage kopiert.");
            }}
          >
            <Clipboard size={16} />
            Statblock kopieren
          </button>
        </SheetSection>
      </div>
      <aside className="sheet-context-column">
        <SheetSection title="Dokumentstatus">
          <dl className="document-status">
            <div>
              <dt>Build</dt>
              <dd>{validationStateLabels[result.state]}</dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>3 / Session 1</dd>
            </div>
            <div>
              <dt>Konflikte</dt>
              <dd>{String(result.session.orphanedEntries.length)}</dd>
            </div>
          </dl>
        </SheetSection>
      </aside>
    </div>
  );

  const viewContent: Record<SheetView, ReactNode> = {
    overview: overviewView,
    combat: combatView,
    actions: actionsView,
    skills: skillsView,
    features: featuresView,
    spells: spellsView,
    inventory: inventoryView,
    resources: resourcesView,
    biography: biographyView,
    export: exportView
  };

  return (
    <>
      <article className="play-sheet">
        <div className="visually-hidden" aria-live="polite" aria-atomic="true">
          {liveMessage}
        </div>
        <header className="play-sheet__header">
          <div className="play-sheet__identity">
            <span>SHADOWS OF THE CITY</span>
            <h2>{model.identity.name}</h2>
            <p>
              Stufe {String(model.identity.level)} · {model.identity.ancestry} ·{" "}
              {model.identity.className} · {model.identity.background}
            </p>
          </div>
          <div className="play-sheet__vitals" aria-label="Kernwerte">
            <div className="hp-vital">
              <HeartPulse size={18} />
              <span>TP</span>
              <strong>
                {String(result.session.currentHp)} / {String(result.hitPoints.value)}
              </strong>
              {result.session.temporaryHp > 0 ? (
                <small>+{String(result.session.temporaryHp)} temporär</small>
              ) : null}
            </div>
            <div>
              <Shield size={18} />
              <span>RK</span>
              <strong>{String(result.armorClass.value)}</strong>
            </div>
            <div>
              <Search size={18} />
              <span>Wahrnehmung</span>
              <strong>{signed(result.perception.value)}</strong>
            </div>
            <div>
              <Activity size={18} />
              <span>Bewegung</span>
              <strong>{String(result.speed.value)} Fuß</strong>
            </div>
            {primaryResource === undefined ? null : (
              <div>
                <BatteryCharging size={18} />
                <span>{resourceLabel(primaryResource[0])}</span>
                <strong>
                  {String(primaryResource[1].current)} / {String(primaryResource[1].maximum)}
                </strong>
              </div>
            )}
          </div>
          <div className="play-sheet__commands">
            <IconButton
              icon={UserRoundCog}
              label="Charakter bearbeiten"
              onClick={() => onEdit("overview")}
            />
            <IconButton icon={Save} label="Sitzung speichern" onClick={onSave} />
            <IconButton
              icon={FileText}
              label="Charakter als JSON exportieren"
              onClick={onExportJson}
            />
            <IconButton icon={Printer} label="Charakterbogen drucken" onClick={onPrint} />
          </div>
        </header>
        <div className="play-sheet__quickbar">
          {hpControls}
          <button type="button" onClick={() => setView("resources")}>
            <BatteryCharging size={16} />
            Ressourcen
          </button>
          <button
            type="button"
            onClick={() =>
              updateSession(
                (session) => resetResources(session, "daily"),
                "Tagesrast durchgeführt; passende Ressourcen wiederhergestellt.",
                { kind: "rest", label: "Tagesrast" }
              )
            }
          >
            <Moon size={16} />
            Rast
          </button>
          <button type="button" onClick={() => setView("combat")}>
            <CirclePlus size={16} />
            Zustand
          </button>
        </div>
        <nav className="play-sheet__nav" aria-label="Charakterbogen">
          {viewDefinitions.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                type="button"
                className={document.session.activeView === view.id ? "is-active" : ""}
                aria-current={document.session.activeView === view.id ? "page" : undefined}
                onClick={() => setView(view.id)}
              >
                <Icon size={17} />
                <span>{view.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="play-sheet__content">{viewContent[document.session.activeView]}</div>
      </article>
      <PrintCharacterSheet document={document} result={result} model={model} />
    </>
  );
};
