import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

import type { EffectNode, PredicateNode, ProficiencyRank, SaveId } from "@sotc/rules-engine";
import type { ContentEntity } from "@sotc/shared";

import { catalog, entities } from "./catalog.js";
import { entityMatchesChoice, hasTextRule } from "./entity-presentation.js";
import {
  formatActionCost,
  formatAttribute,
  formatChoiceType,
  formatContentStatus,
  formatEffect,
  formatEntityReference,
  formatPrerequisite,
  formatProficiencyRank,
  formatRange,
  formatSave,
  formatTradition
} from "./i18n/de.js";
import { MarkdownContent } from "./MarkdownContent.js";

const resolveName = (id: string): string | undefined => entities.get(id)?.name;

const DetailGrid = ({ children }: { children: ReactNode }) => (
  <dl className="entity-details__grid">{children}</dl>
);

const DetailValue = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
);

const ReferenceButton = ({
  id,
  onOpenEntity
}: {
  id: string;
  onOpenEntity: (id: string) => void;
}) => (
  <button className="entity-reference" type="button" onClick={() => onOpenEntity(id)}>
    {formatEntityReference(id, resolveName)}
    <ExternalLink size={13} />
  </button>
);

const ReferenceList = ({
  ids,
  empty,
  onOpenEntity
}: {
  ids: string[];
  empty: string;
  onOpenEntity: (id: string) => void;
}) =>
  ids.length === 0 ? (
    <span className="detail-empty">{empty}</span>
  ) : (
    <div className="entity-reference-list">
      {ids.map((id) => (
        <ReferenceButton key={id} id={id} onOpenEntity={onOpenEntity} />
      ))}
    </div>
  );

const Effects = ({
  effects,
  onOpenEntity
}: {
  effects: unknown[];
  onOpenEntity: (id: string) => void;
}) => {
  const typed = effects as EffectNode[];
  if (typed.length === 0) {
    return null;
  }
  return (
    <section className="entity-details__section">
      <h3>Auswirkungen</h3>
      <ul className="detail-list">
        {typed.map((effect, index) => (
          <li key={`${effect.kind}-${String(index)}`}>
            {effect.kind === "grant-feat" ? (
              <ReferenceButton id={effect.featId} onOpenEntity={onOpenEntity} />
            ) : effect.kind === "grant-feature" ? (
              <ReferenceButton id={effect.featureId} onOpenEntity={onOpenEntity} />
            ) : effect.kind === "unlock-choice" ? (
              <ReferenceButton id={effect.choiceId} onOpenEntity={onOpenEntity} />
            ) : (
              formatEffect(effect, resolveName)
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

const Prerequisites = ({ prerequisites }: { prerequisites: unknown[] }) => {
  const typed = prerequisites as PredicateNode[];
  if (typed.length === 0) {
    return null;
  }
  return (
    <section className="entity-details__section">
      <h3>Voraussetzungen</h3>
      <ul className="detail-list">
        {typed.map((predicate, index) => (
          <li key={String(index)}>{formatPrerequisite(predicate, resolveName)}</li>
        ))}
      </ul>
    </section>
  );
};

const Progression = ({
  entity,
  onOpenEntity
}: {
  entity: Extract<ContentEntity, { type: "class" }>;
  onOpenEntity: (id: string) => void;
}) => {
  const features = entity.featureIds
    .map((id) => entities.get(id))
    .filter(
      (candidate): candidate is Extract<ContentEntity, { type: "class-feature" }> =>
        candidate?.type === "class-feature"
    );
  const choices = entity.choiceIds
    .map((id) => entities.get(id))
    .filter(
      (candidate): candidate is Extract<ContentEntity, { type: "choice" }> =>
        candidate?.type === "choice"
    );
  const levels = [
    ...new Set([
      ...features.map((feature) => feature.level),
      ...choices.map((choice) => choice.choice.level)
    ])
  ].sort((left, right) => left - right);
  return (
    <section className="entity-details__section">
      <h3>Klassenprogression</h3>
      <div className="detail-table-wrap">
        <table className="detail-table">
          <thead>
            <tr>
              <th>Stufe</th>
              <th>Automatische Merkmale</th>
              <th>Auswahlen</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr key={level}>
                <th>{level}</th>
                <td>
                  <ReferenceList
                    ids={features
                      .filter((feature) => feature.level === level)
                      .map((feature) => feature.id)}
                    empty="Keine"
                    onOpenEntity={onOpenEntity}
                  />
                </td>
                <td>
                  <ReferenceList
                    ids={choices
                      .filter((choice) => choice.choice.level === level)
                      .map((choice) => choice.id)}
                    empty="Keine"
                    onOpenEntity={onOpenEntity}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const ClassDetails = ({
  entity,
  onOpenEntity
}: {
  entity: Extract<ContentEntity, { type: "class" }>;
  onOpenEntity: (id: string) => void;
}) => (
  <>
    <DetailGrid>
      <DetailValue label="Trefferpunkte pro Stufe">{entity.hpPerLevel}</DetailValue>
      <DetailValue label="Schlüsselattribut">
        {entity.keyAttributes.map((attribute) => formatAttribute(attribute)).join(", ")}
      </DetailValue>
      <DetailValue label="Freie Fertigkeitstrainings">{entity.trainedSkillChoices}</DetailValue>
      <DetailValue label="Wahrnehmung">
        {formatProficiencyRank(entity.initialProficiencies.perception)}
      </DetailValue>
      {(Object.entries(entity.initialProficiencies.saves) as Array<[SaveId, ProficiencyRank]>).map(
        ([save, rank]) => (
          <DetailValue key={save} label={formatSave(save)}>
            {formatProficiencyRank(rank)}
          </DetailValue>
        )
      )}
    </DetailGrid>
    {entity.spellcastingProgressionId === undefined ? null : (
      <section className="entity-details__section">
        <h3>Zauberprogression</h3>
        <ReferenceButton id={entity.spellcastingProgressionId} onOpenEntity={onOpenEntity} />
      </section>
    )}
    <Progression entity={entity} onOpenEntity={onOpenEntity} />
  </>
);

const BackgroundDetails = ({
  entity,
  onOpenEntity
}: {
  entity: Extract<ContentEntity, { type: "background" }>;
  onOpenEntity: (id: string) => void;
}) => (
  <>
    <DetailGrid>
      <DetailValue label="Attributsverbesserungen">
        {entity.boosts.map((attribute) => formatAttribute(attribute)).join(", ") || "Keine festen"}
      </DetailValue>
      <DetailValue label="Freie Verbesserungen">{entity.freeBoosts}</DetailValue>
    </DetailGrid>
    <section className="entity-details__section">
      <h3>Trainierte Fertigkeiten</h3>
      <ReferenceList
        ids={entity.trainedSkillIds}
        empty="Keine trainierte Fertigkeit hinterlegt."
        onOpenEntity={onOpenEntity}
      />
    </section>
    <section className="entity-details__section">
      <h3>Gewährte Talente</h3>
      <ReferenceList
        ids={entity.grantedFeatIds}
        empty="Kein automatisches Talent hinterlegt."
        onOpenEntity={onOpenEntity}
      />
    </section>
    <Effects effects={entity.effects} onOpenEntity={onOpenEntity} />
  </>
);

const AncestryDetails = ({
  entity,
  onOpenEntity
}: {
  entity: Extract<ContentEntity, { type: "ancestry" }>;
  onOpenEntity: (id: string) => void;
}) => (
  <>
    <DetailGrid>
      <DetailValue label="Trefferpunkte">{entity.hp}</DetailValue>
      <DetailValue label="Größe">
        {{ tiny: "Winzig", small: "Klein", medium: "Mittel", large: "Groß" }[entity.size]}
      </DetailValue>
      <DetailValue label="Bewegung">{entity.speed} Fuß</DetailValue>
      <DetailValue label="Attributsverbesserungen">
        {entity.boosts.map((attribute) => formatAttribute(attribute)).join(", ")}
        {entity.freeBoosts > 0 ? `, ${String(entity.freeBoosts)} frei` : ""}
      </DetailValue>
      <DetailValue label="Attributsschwächen">
        {entity.flaws.map((attribute) => formatAttribute(attribute)).join(", ") || "Keine"}
      </DetailValue>
    </DetailGrid>
    <section className="entity-details__section">
      <h3>Sprachen</h3>
      <ReferenceList ids={entity.languageIds} empty="Keine" onOpenEntity={onOpenEntity} />
    </section>
    <section className="entity-details__section">
      <h3>Herkünfte</h3>
      <ReferenceList ids={entity.heritageIds} empty="Keine" onOpenEntity={onOpenEntity} />
    </section>
  </>
);

const SpellDetails = ({ entity }: { entity: Extract<ContentEntity, { type: "spell" }> }) => (
  <DetailGrid>
    <DetailValue label="Rang">{entity.rank}</DetailValue>
    <DetailValue label="Traditionen">
      {entity.traditions.map(formatTradition).join(", ")}
    </DetailValue>
    <DetailValue label="Aktionen">{formatActionCost(entity.actions)}</DetailValue>
    <DetailValue label="Reichweite">{formatRange(entity.range)}</DetailValue>
    <DetailValue label="Ziel">
      {entity.target.text ??
        {
          self: "Selbst",
          creature: "Kreatur",
          object: "Objekt",
          effect: "Effekt",
          area: "Bereich",
          mixed: "Gemischt"
        }[entity.target.kind]}
    </DetailValue>
    <DetailValue label="Dauer">
      {entity.duration === "Siehe Legacy-Beschreibung"
        ? "Im vollständigen Regeltext beschrieben"
        : entity.duration}
    </DetailValue>
    <DetailValue label="Verteidigung">
      {entity.defense.kind === "none"
        ? "Keine"
        : entity.defense.kind === "armor-class"
          ? "Rüstungsklasse"
          : `${entity.defense.basic === true ? "Einfacher " : ""}${formatSave(entity.defense.save ?? "reflex")}-Rettungswurf`}
    </DetailValue>
  </DetailGrid>
);

const ItemDetails = ({
  entity
}: {
  entity: Extract<ContentEntity, { type: "weapon" | "armor" | "equipment" }>;
}) => (
  <DetailGrid>
    <DetailValue label="Stufe">{entity.level}</DetailValue>
    <DetailValue label="Preis">{entity.priceGp} GP</DetailValue>
    <DetailValue label="Last">{entity.bulk}</DetailValue>
    <DetailValue label="Hände">{entity.hands}</DetailValue>
    <DetailValue label="Kategorie">
      {formatEntityReference(entity.categoryId, resolveName)}
    </DetailValue>
    {entity.type === "weapon" ? (
      <>
        <DetailValue label="Schaden">
          {entity.damage.dice}
          {entity.damage.die} {formatEntityReference(entity.damage.type, resolveName)}
        </DetailValue>
        <DetailValue label="Gruppe">
          {formatEntityReference(entity.groupId, resolveName)}
        </DetailValue>
      </>
    ) : entity.type === "armor" ? (
      <>
        <DetailValue label="Gegenstandsbonus">+{entity.itemBonus}</DetailValue>
        <DetailValue label="GE-Limit">{entity.dexterityCap}</DetailValue>
      </>
    ) : null}
  </DetailGrid>
);

const ChoiceDetails = ({
  entity,
  onOpenEntity
}: {
  entity: Extract<ContentEntity, { type: "choice" }>;
  onOpenEntity: (id: string) => void;
}) => {
  const options = catalog.entities.filter((candidate) => entityMatchesChoice(candidate, entity));
  return (
    <>
      <DetailGrid>
        <DetailValue label="Auswahlart">{formatChoiceType(entity.choice.kind)}</DetailValue>
        <DetailValue label="Stufe">{entity.choice.level}</DetailValue>
        <DetailValue label="Umfang">
          {entity.choice.min === entity.choice.max
            ? String(entity.choice.min)
            : `${String(entity.choice.min)} bis ${String(entity.choice.max)}`}
        </DetailValue>
        <DetailValue label="Wiederholbar">{entity.choice.repeatable ? "Ja" : "Nein"}</DetailValue>
      </DetailGrid>
      <Prerequisites prerequisites={entity.choice.prerequisites} />
      <section className="entity-details__section">
        <h3>Gültige Optionen ({options.length})</h3>
        <ReferenceList
          ids={options.map((option) => option.id)}
          empty="Keine"
          onOpenEntity={onOpenEntity}
        />
      </section>
    </>
  );
};

const TypeDetails = ({
  entity,
  onOpenEntity
}: {
  entity: ContentEntity;
  onOpenEntity: (id: string) => void;
}) => {
  switch (entity.type) {
    case "class":
      return <ClassDetails entity={entity} onOpenEntity={onOpenEntity} />;
    case "background":
      return <BackgroundDetails entity={entity} onOpenEntity={onOpenEntity} />;
    case "ancestry":
      return <AncestryDetails entity={entity} onOpenEntity={onOpenEntity} />;
    case "spell":
      return <SpellDetails entity={entity} />;
    case "weapon":
    case "armor":
    case "equipment":
      return <ItemDetails entity={entity} />;
    case "choice":
      return <ChoiceDetails entity={entity} onOpenEntity={onOpenEntity} />;
    case "heritage":
    case "feat":
    case "class-feature":
      return (
        <>
          {"actionCost" in entity && entity.actionCost !== undefined ? (
            <DetailGrid>
              <DetailValue label="Aktionen">{formatActionCost(entity.actionCost)}</DetailValue>
            </DetailGrid>
          ) : null}
          <Prerequisites prerequisites={entity.prerequisites} />
          <Effects effects={entity.effects} onOpenEntity={onOpenEntity} />
        </>
      );
    case "skill":
      return (
        <DetailGrid>
          <DetailValue label="Typisches Attribut">{formatAttribute(entity.attribute)}</DetailValue>
        </DetailGrid>
      );
    case "spellcasting-progression":
      return (
        <DetailGrid>
          <DetailValue label="Klasse">
            <ReferenceButton id={entity.classId} onOpenEntity={onOpenEntity} />
          </DetailValue>
          <DetailValue label="Tradition">{formatTradition(entity.tradition)}</DetailValue>
          <DetailValue label="Zauberattribut">
            {formatAttribute(entity.castingAttribute)}
          </DetailValue>
          <DetailValue label="Vorbereitung">
            {entity.mode === "prepared" ? "Vorbereitet" : "Spontan"}
          </DetailValue>
        </DetailGrid>
      );
    case "creature":
      return (
        <DetailGrid>
          <DetailValue label="Stufe">{entity.level}</DetailValue>
          <DetailValue label="Trefferpunkte">{entity.hp}</DetailValue>
          <DetailValue label="Rüstungsklasse">{entity.armorClass}</DetailValue>
          <DetailValue label="Bewegung">{entity.speed} Fuß</DetailValue>
          <DetailValue label="Regelsystem">
            {entity.legacySystem === "dnd5e" ? "Legacy-Bestiarium (D&D 5e)" : "Shadows of the City"}
          </DetailValue>
        </DetailGrid>
      );
    default:
      return null;
  }
};

export const EntityDetails = ({
  entity,
  provenance,
  onOpenEntity
}: {
  entity: ContentEntity;
  provenance: string[];
  onOpenEntity: (id: string) => void;
}) => (
  <div className="entity-details">
    <p className="entity-details__summary">{entity.summary}</p>
    {provenance.length === 0 ? null : (
      <section className="entity-details__provenance">
        <h3>Herkunft im Charakter</h3>
        {provenance.map((entry) => (
          <p key={entry}>
            <CheckCircle2 size={15} />
            {entry}
          </p>
        ))}
      </section>
    )}
    <TypeDetails entity={entity} onOpenEntity={onOpenEntity} />
    {hasTextRule(entity) ? (
      <p className="text-rule-notice">
        <AlertCircle size={17} />
        Diese Regel ist derzeit als Textregel hinterlegt und wird nicht automatisch berechnet.
      </p>
    ) : null}
    <section className="entity-details__section">
      <h3>Vollständiger Inhalt</h3>
      <MarkdownContent markdown={entity.description} onOpenEntity={onOpenEntity} />
    </section>
    <footer className="entity-details__footer">
      <span>Quelle</span>
      <strong>
        {entity.source === "legacy.world-rules" ? "Welt-Regelwerk" : "Geprüfte Contentquelle"}
      </strong>
      <span>Status</span>
      <strong>{formatContentStatus(entity.status)}</strong>
    </footer>
  </div>
);
