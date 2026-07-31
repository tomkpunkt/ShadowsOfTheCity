import type { CalculatedCharacter } from "@sotc/rules-engine";
import type { CharacterDocument } from "@sotc/shared";
import type { ReactNode } from "react";

import {
  attributeLabels,
  formatDamageType,
  formatItemCategory,
  formatSave,
  proficiencyRankLabels
} from "../i18n/de.js";
import { entityLevel } from "../entity-presentation.js";
import type { CharacterSheetModel } from "./model.js";
import { buildCharacterPrintModel, type CharacterPrintModel } from "./print-model.js";

const signed = (value: number): string => `${value >= 0 ? "+" : ""}${String(value)}`;

const PrintHeader = ({ printModel, page }: { printModel: CharacterPrintModel; page: string }) => (
  <header className="print-sheet__header">
    <div>
      <strong>Shadows of the City</strong>
      <span>{page}</span>
    </div>
    <div>
      <strong>{printModel.identity.name}</strong>
      <span>
        Stufe {String(printModel.identity.level)} · {printModel.identity.className}
      </span>
    </div>
  </header>
);

const PrintSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="print-section">
    <h2>{title}</h2>
    {children}
  </section>
);

const PrintPage = ({
  printModel,
  page,
  children,
  className = ""
}: {
  printModel: CharacterPrintModel;
  page: string;
  children: ReactNode;
  className?: string;
}) => (
  <section className={`print-page ${className}`} data-print-page={page}>
    <PrintHeader printModel={printModel} page={page} />
    {children}
  </section>
);

export const PrintCharacterSheet = ({
  document,
  result,
  model
}: {
  document: CharacterDocument;
  result: CalculatedCharacter;
  model: CharacterSheetModel;
}) => {
  const printModel = buildCharacterPrintModel(document, result, model);

  return (
    <article className="print-sheet" aria-hidden="true">
      <PrintPage printModel={printModel} page="Kernwerte">
        <div className="print-identity">
          <h1>{printModel.identity.name}</h1>
          <p>
            {printModel.identity.ancestry} · {printModel.identity.heritage} ·{" "}
            {printModel.identity.background}
          </p>
        </div>
        <div className="print-value-grid">
          {printModel.coreValues.map((entry) => (
            <div key={entry.label}>
              <span>{entry.label}</span>
              <strong>{entry.value}</strong>
            </div>
          ))}
        </div>
        <div className="print-columns">
          <PrintSection title="Attribute">
            <dl className="print-list">
              {printModel.attributes.map((entry) => (
                <div key={entry.label}>
                  <dt>{attributeLabels[entry.label as keyof typeof attributeLabels]}</dt>
                  <dd>{entry.value}</dd>
                </div>
              ))}
            </dl>
          </PrintSection>
          <PrintSection title="Rettungswürfe">
            <dl className="print-list">
              {printModel.saves.map((entry) => (
                <div key={entry.label}>
                  <dt>{formatSave(entry.label as never)}</dt>
                  <dd>{entry.value}</dd>
                </div>
              ))}
            </dl>
          </PrintSection>
        </div>
        <PrintSection title="Fertigkeiten">
          <div className="print-skill-grid">
            {printModel.skills.map((skill) => (
              <div key={skill.id}>
                <span>{skill.name}</span>
                <small>{proficiencyRankLabels[skill.rank]}</small>
                <strong>{signed(skill.value.value)}</strong>
              </div>
            ))}
          </div>
        </PrintSection>
        <PrintSection title="Aktive Zustände">
          <p>
            {printModel.conditions
              .map(
                (condition) =>
                  `${condition.name}${condition.value === undefined ? "" : ` ${String(condition.value)}`}`
              )
              .join(", ") || "Keine"}
          </p>
        </PrintSection>
      </PrintPage>

      <PrintPage printModel={printModel} page="Kampf und Aktionen">
        <div className="print-value-grid">
          <div>
            <span>Trefferpunkte</span>
            <strong>
              {String(result.session.currentHp)} / {String(result.hitPoints.value)}
            </strong>
          </div>
          <div>
            <span>Rüstungsklasse</span>
            <strong>{String(result.armorClass.value)}</strong>
          </div>
          <div>
            <span>Wahrnehmung</span>
            <strong>{signed(result.perception.value)}</strong>
          </div>
          <div>
            <span>Bewegung</span>
            <strong>{String(result.speed.value)} Fuß</strong>
          </div>
        </div>
        <PrintSection title="Angriffe">
          <div className="print-rows">
            {printModel.attacks.map((attack) => (
              <article key={attack.id}>
                <header>
                  <strong>{attack.name}</strong>
                  <b>{signed(attack.attack.value)}</b>
                </header>
                <p>
                  {attack.damage.dice}
                  {signed(attack.damage.flat.value)} {formatDamageType(attack.damage.type)}
                  {attack.range === undefined ? "" : ` · ${attack.range}`}
                  {` · ${String(attack.hands)} Hand/Hände`}
                </p>
                <small>{attack.traits.map(model.name).join(", ")}</small>
              </article>
            ))}
            {printModel.attacks.length === 0 ? <p>Keine Angriffe.</p> : null}
          </div>
        </PrintSection>
        <PrintSection title="Ausrüstung und Zustände">
          <div className="print-columns">
            <p>
              <strong>Ausgerüstet:</strong>{" "}
              {printModel.inventory
                .filter((item) => item.equipped)
                .map((item) => item.name)
                .join(", ") || "Nichts"}
            </p>
            <p>
              <strong>Zustände:</strong>{" "}
              {printModel.conditions.map((condition) => condition.name).join(", ") || "Keine"}
            </p>
          </div>
        </PrintSection>
        <PrintSection title="Aktionen und Reaktionen">
          <div className="print-rows print-rows--dense">
            {printModel.actions
              .filter((action) => action.category !== "passive")
              .map((action) => (
                <article key={action.id}>
                  <header>
                    <strong>{action.name}</strong>
                    <b>{action.cost}</b>
                  </header>
                  <p>{action.summary}</p>
                  <small>Quelle: {action.sourceName}</small>
                </article>
              ))}
          </div>
        </PrintSection>
        <PrintSection title="Ressourcen">
          <div className="print-value-grid print-value-grid--compact">
            {printModel.resources.map((resource) => (
              <div key={resource.id}>
                <span>{resource.name}</span>
                <strong>
                  {String(resource.current)} / {String(resource.maximum)}
                </strong>
                <small>{resource.recovery}</small>
              </div>
            ))}
          </div>
        </PrintSection>
      </PrintPage>

      <PrintPage printModel={printModel} page="Talente und Merkmale">
        <div className="print-rows print-rows--dense">
          {printModel.features.map((feature) => (
            <article key={feature.id}>
              <header>
                <strong>{feature.name}</strong>
                {entityLevel(feature) === undefined ? null : (
                  <b>Stufe {String(entityLevel(feature))}</b>
                )}
              </header>
              <p>{feature.summary}</p>
              <small>{feature.traits.map(model.name).join(", ")}</small>
            </article>
          ))}
        </div>
      </PrintPage>

      {printModel.hasSpells ? (
        <PrintPage printModel={printModel} page="Zauber" className="print-page--spells">
          <PrintSection title="Zauberwerte und Plätze">
            <div className="print-value-grid print-value-grid--compact">
              {printModel.spellSlots.map((slot) => (
                <div key={slot.rank}>
                  <span>Rang {String(slot.rank)}</span>
                  <strong>
                    {String(slot.maximum - slot.used)} / {String(slot.maximum)}
                  </strong>
                </div>
              ))}
            </div>
          </PrintSection>
          <PrintSection title="Bekannte Zauber">
            <div className="print-rows print-rows--dense">
              {printModel.spells.map((spell) => (
                <article key={spell.id}>
                  <header>
                    <strong>{spell.name}</strong>
                    <b>Rang {String(spell.rank)}</b>
                  </header>
                  <p>{spell.summary}</p>
                  <small>{spell.traditions.map(model.name).join(", ")}</small>
                </article>
              ))}
            </div>
          </PrintSection>
        </PrintPage>
      ) : null}

      <PrintPage printModel={printModel} page="Inventar und Notizen">
        <PrintSection title={`Inventar · Last ${String(result.bulk.value)}`}>
          <table className="print-table">
            <thead>
              <tr>
                <th>Gegenstand</th>
                <th>Kategorie</th>
                <th>Anzahl</th>
                <th>Last</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {printModel.inventory.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{formatItemCategory(item.category)}</td>
                  <td>{String(item.quantity)}</td>
                  <td>{String(item.bulk)}</td>
                  <td>{item.equipped ? "Ausgerüstet" : item.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PrintSection>
        <div className="print-columns">
          <PrintSection title="Biografie">
            <p>{printModel.biography.description || "–"}</p>
            <p>{printModel.biography.motivation}</p>
            <p>{printModel.biography.goals}</p>
          </PrintSection>
          <PrintSection title="Sitzungsnotizen">
            {printModel.notes.map((note) => (
              <article key={note.id} className="print-note">
                <strong>{note.title}</strong>
                <p>{note.body}</p>
              </article>
            ))}
            {printModel.notes.length === 0 ? <p>Keine Notizen.</p> : null}
          </PrintSection>
        </div>
        <PrintSection title="Kompakter Statblock">
          <pre className="print-statblock">{printModel.statblock}</pre>
        </PrintSection>
      </PrintPage>
    </article>
  );
};
