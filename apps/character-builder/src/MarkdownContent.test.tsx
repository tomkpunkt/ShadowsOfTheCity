// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MarkdownContent, prepareInternalReferences } from "./MarkdownContent.js";

afterEach(cleanup);

const fixture = `# Überschrift

Ein Absatz mit **Fettdruck**, *Kursivschrift* und \`Inline-Code\`.

- Erster Punkt
  - Verschachtelter Punkt

1. Erster Schritt
2. Zweiter Schritt

| Wert | Bedeutung |
|:--|:--|
| A | Alpha |

> Ein hervorgehobener Hinweis.

\`\`\`ts
const sicher = true;
\`\`\`

---

[Extern](https://example.com) und [[feat.general.diplomat|Diplomat]].

<script>alert("nicht ausführen")</script>

[Unsicher](javascript:alert("x"))
`;

describe("MarkdownContent", () => {
  it("renders the supported GFM structure without executing embedded HTML", () => {
    const { container } = render(
      <MarkdownContent markdown={fixture} onOpenEntity={() => undefined} />
    );

    expect(screen.getByRole("heading", { name: "Überschrift" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(container.querySelector("blockquote")).not.toBeNull();
    expect(container.querySelector("pre code")).toHaveTextContent("const sicher = true");
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByRole("link", { name: "Extern" })).toHaveAttribute(
      "rel",
      "noreferrer noopener"
    );
    expect(screen.getByText('<script>alert("nicht ausführen")</script>')).toBeInTheDocument();
    const unsafe = screen.getByText("Unsicher").closest("a");
    expect(unsafe?.getAttribute("href") ?? "").not.toMatch(/^javascript:/i);
  });

  it("opens internal entity references without exposing an entity ID", () => {
    const open = vi.fn();
    render(<MarkdownContent markdown={fixture} onOpenEntity={open} />);

    const link = screen.getByRole("link", { name: "Diplomat" });
    fireEvent.click(link);

    expect(open).toHaveBeenCalledWith("feat.general.diplomat");
    expect(within(link).queryByText("feat.general.diplomat")).not.toBeInTheDocument();
  });

  it("compiles both supported internal-reference forms", () => {
    expect(prepareInternalReferences("[[skill.science]]")).toBe(
      "[skill.science](#entity=skill.science)"
    );
    expect(prepareInternalReferences("[[skill.science|Wissenschaft]]")).toBe(
      "[Wissenschaft](#entity=skill.science)"
    );
  });
});
