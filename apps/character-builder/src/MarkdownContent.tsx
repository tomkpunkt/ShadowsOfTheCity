import type { MouseEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const internalReferencePattern = /\[\[([a-z][a-z0-9.-]+)(?:\|([^\]]+))?\]\]/g;

const localizeLegacyTerms = (markdown: string): string =>
  markdown
    .replace(/\bSpell-Info\b/g, "Zauberinformationen")
    .replace(/\bArcane\b/g, "Arkan")
    .replace(/\bPrimal\b/g, "Naturmagisch")
    .replace(/\bOccult\b/g, "Okkult")
    .replace(/\bDivine\b/g, "Göttlich")
    .replace(/\bBackgrounds?\b/g, "Hintergrund")
    .replace(/\bFeats?\b/g, "Talent")
    .replace(/\bSkills?\b/g, "Fertigkeit")
    .replace(/\bFeatures?\b/g, "Merkmale")
    .replace(/\bLegacy-Beschreibung\b/g, "Altbestandsbeschreibung");

export const prepareInternalReferences = (markdown: string): string =>
  localizeLegacyTerms(markdown).replace(
    internalReferencePattern,
    (_match, id: string, label: string | undefined) =>
      `[${label ?? id}](#entity=${encodeURIComponent(id)})`
  );

export const MarkdownContent = ({
  markdown,
  onOpenEntity
}: {
  markdown: string;
  onOpenEntity: (id: string) => void;
}) => (
  <div className="markdown-content">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => {
          const internalId =
            href?.startsWith("#entity=") === true
              ? decodeURIComponent(href.slice("#entity=".length))
              : undefined;
          const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
            if (internalId !== undefined) {
              event.preventDefault();
              onOpenEntity(internalId);
            }
          };
          return (
            <a
              href={href}
              onClick={handleClick}
              {...(internalId === undefined && href?.startsWith("http")
                ? { target: "_blank", rel: "noreferrer noopener" }
                : {})}
            >
              {children}
            </a>
          );
        },
        table: ({ children }) => (
          <div className="markdown-content__table">
            <table>{children}</table>
          </div>
        )
      }}
    >
      {prepareInternalReferences(markdown)}
    </ReactMarkdown>
  </div>
);
