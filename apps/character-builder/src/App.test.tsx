// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Character Builder", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("selects an ancestry from the compiled catalog and recalculates immediately", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Abstammung" }));
    const elfTitle = screen.getByText("Elf", { selector: "strong" });
    const card = elfTitle.closest("article");
    expect(card).not.toBeNull();
    await user.click(within(card as HTMLElement).getByRole("button", { name: "Auswählen" }));

    await user.click(screen.getByRole("button", { name: "Übersicht" }));
    expect(screen.getByText("Elf", { selector: ".identity-band strong" })).toBeInTheDocument();
    const hitPoints = screen.getByText("Trefferpunkte").closest(".metric");
    expect(hitPoints).not.toBeNull();
    expect(within(hitPoints as HTMLElement).getByText("5")).toBeInTheDocument();
  });

  it("opens every main area with a German heading", async () => {
    const user = userEvent.setup();
    render(<App />);
    const areas = [
      ["ancestry", "Abstammung"],
      ["background", "Hintergrund"],
      ["class", "Klasse"],
      ["attributes", "Attribute"],
      ["skills", "Fertigkeiten"],
      ["feats", "Talente und Merkmale"],
      ["spells", "Zauber"],
      ["equipment", "Ausrüstung"],
      ["compendium", "Kompendium"],
      ["review", "Abschlussprüfung"],
      ["sheet", "Charakterbogen"]
    ];

    for (const [id, label] of areas) {
      const navigationButton = document.querySelector(`[data-step-id="${id}"]`);
      expect(navigationButton).not.toBeNull();
      await user.click(navigationButton as HTMLElement);
      expect(screen.getByRole("heading", { level: 1, name: label })).toBeInTheDocument();
    }
  });

  it("finds structured content in the compendium and renders a typed Markdown detail", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Kompendium" }));
    await user.type(screen.getByPlaceholderText("Suchen"), "Feuerball");
    const card = screen.getByText("Feuerball", { selector: "strong" }).closest("article");
    expect(card).not.toBeNull();
    await user.click(within(card as HTMLElement).getByRole("button"));

    expect(screen.getByRole("heading", { level: 2, name: "Feuerball" })).toBeInTheDocument();
    expect(await screen.findByText("Rang", { selector: "dt" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Diese Regel ist derzeit als Textregel hinterlegt und wird nicht automatisch berechnet."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryByText("spell.feuerball")).not.toBeInTheDocument();
    expect(screen.queryByText("legacy")).not.toBeInTheDocument();
  });

  it("resets compendium filters and shows a concrete empty state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Kompendium" }));
    await user.selectOptions(screen.getByLabelText("Inhaltstyp"), "spell");
    await user.type(screen.getByPlaceholderText("Suchen"), "nicht-vorhandener-inhalt");
    expect(
      screen.getByText("Keine Einträge entsprechen den gewählten Filtern.")
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Zurücksetzen" }));
    expect(screen.getByLabelText("Inhaltstyp")).toHaveValue("all");
  });

  it("places the save indicator before status and starts a confirmed new character", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<App />);

    const toolbarStatus = document.querySelector(".topbar__status");
    expect(toolbarStatus?.children[0]).toHaveClass("save-indicator");
    expect(toolbarStatus?.children[1]).toHaveClass("status");

    await user.click(screen.getByRole("button", { name: "Abstammung" }));
    const elfCard = screen.getByText("Elf", { selector: "strong" }).closest("article");
    expect(elfCard).not.toBeNull();
    await user.click(within(elfCard as HTMLElement).getByRole("button", { name: "Auswählen" }));

    await user.click(screen.getByRole("button", { name: "Neuen Charakter anlegen" }));

    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(screen.getByRole("heading", { level: 1, name: "Übersicht" })).toBeInTheDocument();
    expect(
      screen.getByText("Neuer Charakter", { selector: ".sidebar__character strong" })
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Elf", { selector: ".identity-band strong" })
    ).not.toBeInTheDocument();
  });
});
