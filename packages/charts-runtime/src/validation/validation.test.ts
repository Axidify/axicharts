import { describe, expect, it } from "vitest";
import { serializeDashboardExport } from "../workspace/share";
import { validateShareImportJson } from "./index";

const spec = {
  layout: "embed" as const,
  dashboard: {
    template: "ops-2x2" as const,
    title: "Import test",
  },
};

describe("validateShareImportJson", () => {
  it("passes dual gate for valid share exports", () => {
    const json = serializeDashboardExport("Ops", spec);
    const result = validateShareImportJson(json);
    expect(result.ok).toBe(true);
    expect(result.schemaOk).toBe(true);
    expect(result.semanticOk).toBe(true);
    expect(result.export?.name).toBe("Ops");
  });

  it("surfaces schema and semantic errors separately", () => {
    const json = JSON.stringify({
      $schema: "https://axidify.github.io/axicharts/schema/share-export.schema.json",
      version: 1,
      kind: "dashboard",
      exportedAt: "2026-01-01T00:00:00.000Z",
      name: "Broken",
      spec: { layout: "embed", dashboard: { template: "not-real" } },
    });
    const result = validateShareImportJson(json);
    expect(result.schemaOk).toBe(true);
    expect(result.semanticOk).toBe(false);
    expect(result.ok).toBe(false);
    expect(result.semanticErrors.length).toBeGreaterThan(0);
  });

  it("flags schema shape issues before semantic checks", () => {
    const json = JSON.stringify({
      version: 1,
      kind: "dashboard",
      name: "Missing fields",
      spec: { layout: "embed", dashboard: { template: "ops-2x2" } },
    });
    const result = validateShareImportJson(json);
    expect(result.schemaOk).toBe(false);
    expect(result.schemaErrors.length).toBeGreaterThan(0);
  });
});
