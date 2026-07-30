// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { App } from "./App.js";

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
});
