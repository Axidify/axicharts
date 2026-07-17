import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  dashboarderImportDeepLink,
  findImportPreset,
  hostedImportPresetUrl,
  HOSTED_IMPORT_PRESETS,
  importGalleryDeepLink,
  localImportPresetUrl,
  parseImportPresetQuery,
} from "../schemaUrls";
import { serializeDashboardExport } from "../workspace/share";
import {
  detectImportShape,
  validatePortableImportJson,
  validateRuntimeSpecDualJson,
  validateShareExportDualJson,
} from "./index";

const spec = {
  layout: "embed" as const,
  dashboard: {
    template: "ops-2x2" as const,
    title: "Import test",
  },
};

const examplesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "examples");

function readExample(name: string): string {
  return readFileSync(join(examplesDir, name), "utf8");
}

describe("validatePortableImportJson", () => {
  it("passes dual gate for valid share exports", () => {
    const json = serializeDashboardExport("Ops", spec);
    const result = validatePortableImportJson(json);
    expect(result.ok).toBe(true);
    expect(result.shape).toBe("share");
    expect(result.schemaOk).toBe(true);
    expect(result.semanticOk).toBe(true);
    expect(result.export?.name).toBe("Ops");
  });

  it("imports workspace bundle exports", () => {
    const json = readExample("ops-workspace.workspace.json");
    const result = validatePortableImportJson(json);
    expect(result.shape).toBe("share");
    expect(result.ok).toBe(true);
    expect(result.export?.kind).toBe("workspace");
    if (result.export?.kind !== "workspace") return;
    expect(result.export.dashboards).toHaveLength(2);
  });

  it("imports bare runtime JSON with runtime-spec schema gate", () => {
    const json = readExample("ops-embed.runtime.json");
    expect(detectImportShape(JSON.parse(json))).toBe("runtime");
    const result = validatePortableImportJson(json);
    expect(result.shape).toBe("runtime");
    expect(result.schemaKind).toBe("runtime-spec");
    expect(result.schemaOk).toBe(true);
    expect(result.semanticOk).toBe(true);
    expect(result.ok).toBe(true);
    expect(result.export?.spec.dashboard?.template).toBe("ops-2x2");
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
    const result = validatePortableImportJson(json);
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
    const result = validatePortableImportJson(json);
    expect(result.schemaOk).toBe(false);
    expect(result.schemaErrors.length).toBeGreaterThan(0);
  });
});

describe("validateShareExportDualJson", () => {
  it("validates share exports for export dialogs", () => {
    const json = serializeDashboardExport("Ops", spec);
    const result = validateShareExportDualJson(json);
    expect(result.ok).toBe(true);
    expect(result.shape).toBe("share");
  });
});

describe("validateRuntimeSpecDualJson", () => {
  it("passes dual gate for shipped runtime examples", () => {
    const json = readExample("ops-embed.runtime.json");
    const result = validateRuntimeSpecDualJson(json);
    expect(result.ok).toBe(true);
    expect(result.schemaOk).toBe(true);
    expect(result.semanticOk).toBe(true);
    expect(result.spec?.dashboard?.template).toBe("ops-2x2");
  });
});

describe("hosted import presets", () => {
  it("maps presets to GitHub Pages example URLs", () => {
    const preset = HOSTED_IMPORT_PRESETS[0]!;
    expect(hostedImportPresetUrl(preset)).toBe(
      "https://axidify.github.io/axicharts/examples/ops-embed.runtime.json",
    );
  });

  it("builds local mirror URLs", () => {
    const preset = HOSTED_IMPORT_PRESETS[0]!;
    expect(localImportPresetUrl(preset, "/axicharts/examples/")).toBe(
      "/axicharts/examples/ops-embed.runtime.json",
    );
  });

  it("builds gallery and dashboarder deep links", () => {
    expect(importGalleryDeepLink("ops-embed")).toBe("/runtime/import?preset=ops-embed");
    expect(dashboarderImportDeepLink("ops-workspace")).toBe(
      "http://localhost:3000/?import=ops-workspace",
    );
    expect(parseImportPresetQuery("?import=ops-mosaic")).toBe("ops-mosaic");
    expect(findImportPreset("ops-workspace")?.filename).toBe("ops-workspace.workspace.json");
  });
});
