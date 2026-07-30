import { describe, expect, it } from "vitest";

import { catalog } from "../catalog.js";
import {
  contentStatusLabels,
  entityTypeLabels,
  formatContentStatus,
  formatEntityType
} from "./de.js";

describe("deutsche UI-Labels", () => {
  it("covers every entity type and content status used by the active catalog", () => {
    for (const entity of catalog.entities) {
      expect(formatEntityType(entity.type)).not.toBe("Nicht lokalisierter Wert");
      expect(formatContentStatus(entity.status)).not.toBe("Nicht lokalisierter Wert");
    }
  });

  it("contains no technical fallback labels", () => {
    expect(Object.values(entityTypeLabels)).not.toContain("class-feature");
    expect(Object.values(contentStatusLabels)).not.toContain("legacy");
    expect(entityTypeLabels["class-feature"]).toBe("Klassenmerkmal");
    expect(contentStatusLabels.legacy).toBe("Aus dem Altbestand");
  });
});
