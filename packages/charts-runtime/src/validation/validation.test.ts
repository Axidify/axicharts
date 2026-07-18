import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  dashboarderImportDeepLink,
  docsImportGalleryDeepLink,
  findImportPreset,
  filterImportPresets,
  hostedImportPresetUrl,
  HOSTED_IMPORT_PRESETS,
  importGalleryDeepLink,
  importGalleryFilterPath,
  IMPORT_GALLERY_ADAPTER_FILTERS,
  isImportGalleryFilterActive,
  listImportDeepLinks,
  localImportPresetUrl,
  parseImportGalleryFilter,
  parseImportPresetQuery,
  shareExportReferencePreset,
  runtimeEmbedReferencePreset,
  plannerAdapterReferencePreset,
  PLANNER_FEED_ROWS,
  PLANNER_MOSAIC_INTENT_SAMPLE,
  plannerAdapterFixtures,
  plannerFeedGalleryDeepLink,
  plannerFeedGalleryIndexDeepLink,
  runtimeShareImportDeepLink,
  runtimeSchemaShareMetaDeepLink,
  runtimeDeepLinkShareImportDeepLink,
  runtimeImportGalleryShareImportTrackDeepLink,
  startShareImportDeepLink,
  verticalsStorybookRound3DeepLink,
  feedAdapterGalleryDeepLink,
  adapterFixtureGalleryDeepLink,
  formatValidatePresetCommand,
  formatValidateFileCommand,
  isShareImportPreset,
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
    expect(docsImportGalleryDeepLink("ops-workspace")).toBe(
      "https://axidify.github.io/axicharts/runtime/import?preset=ops-workspace",
    );
    expect(dashboarderImportDeepLink("ops-workspace")).toBe(
      "http://localhost:3000/?import=ops-workspace",
    );
    expect(parseImportPresetQuery("?import=ops-mosaic")).toBe("ops-mosaic");
    expect(findImportPreset("ops-workspace")?.kind).toBe("workspace");
    expect(shareExportReferencePreset("workspace")?.id).toBe("ops-workspace");
    expect(runtimeEmbedReferencePreset("embed")?.id).toBe("ops-embed");
    expect(runtimeEmbedReferencePreset("mosaic")?.id).toBe("ops-mosaic");
    expect(plannerAdapterReferencePreset({ layout: "mosaic", feed: "historian" })?.id).toBe(
      "ops-mosaic",
    );
    expect(plannerAdapterReferencePreset({ layout: "embed", feed: "static" })?.id).toBe(
      "ops-embed",
    );
    expect(plannerAdapterReferencePreset({ layout: "embed", feed: "historian" })?.id).toBe(
      "ops-historian",
    );
    expect(plannerAdapterReferencePreset({ layout: "embed", feed: "websocket" })?.id).toBe(
      "ops-websocket",
    );
    expect(plannerAdapterReferencePreset({ layout: "embed", feed: "mqtt" })?.id).toBe("ops-mqtt");
    expect(plannerAdapterReferencePreset({ layout: "embed", feed: "rest" })?.id).toBe("ops-rest");
    expect(plannerAdapterReferencePreset({ layout: "embed", feed: "mock-live" })?.id).toBe(
      "ops-mock-live",
    );
    const mosaicFixtures = plannerAdapterFixtures({ layout: "mosaic", feed: "historian" });
    expect(mosaicFixtures.map((item) => item.preset.id)).toEqual(["ops-mosaic", "ops-historian"]);
    expect(mosaicFixtures.map((item) => item.role)).toEqual(["mosaic wall", "historian bind"]);
    const embedFixtures = plannerAdapterFixtures({ layout: "embed", feed: "mock-live" });
    expect(embedFixtures).toHaveLength(1);
    expect(embedFixtures[0]?.preset.id).toBe("ops-mock-live");
    expect(PLANNER_FEED_ROWS.map((row) => row.feed)).toEqual([
      "static",
      "historian",
      "rest",
      "websocket",
      "mqtt",
      "mock-live",
    ]);
    expect(plannerFeedGalleryDeepLink("rest")).toBe(
      "https://axidify.github.io/axicharts/runtime/import?preset=ops-rest",
    );
    expect(plannerFeedGalleryIndexDeepLink()).toBe(
      "https://axidify.github.io/axicharts/runtime/import#planner-feeds",
    );
    expect(runtimeShareImportDeepLink()).toBe(
      "https://axidify.github.io/axicharts/runtime#share-import",
    );
    expect(runtimeSchemaShareMetaDeepLink()).toBe(
      "https://axidify.github.io/axicharts/runtime/schema#share-meta",
    );
    expect(runtimeDeepLinkShareImportDeepLink()).toBe(
      "https://axidify.github.io/axicharts/runtime/links#share-import",
    );
    expect(runtimeImportGalleryShareImportTrackDeepLink()).toBe(
      "https://axidify.github.io/axicharts/runtime/import#share-import-track",
    );
    expect(startShareImportDeepLink()).toBe(
      "https://axidify.github.io/axicharts/start#share-import",
    );
    expect(verticalsStorybookRound3DeepLink()).toBe(
      "https://axidify.github.io/axicharts/verticals#storybook-round3",
    );
    const mosaicFixturesFromSample = plannerAdapterFixtures({
      layout: "mosaic",
      feed: "historian",
    });
    expect(mosaicFixturesFromSample.map((item) => item.preset.id)).toEqual([
      "ops-mosaic",
      "ops-historian",
    ]);
    expect(feedAdapterGalleryDeepLink("mqtt", "embed")).toBe(
      "https://axidify.github.io/axicharts/runtime/import?preset=ops-mqtt",
    );
    expect(feedAdapterGalleryDeepLink("rest", "embed")).toBe(
      "https://axidify.github.io/axicharts/runtime/import?preset=ops-rest",
    );
    expect(adapterFixtureGalleryDeepLink("websocket")).toBe(
      "https://axidify.github.io/axicharts/runtime/import?preset=ops-websocket",
    );
    expect(feedAdapterGalleryDeepLink("historian", "mosaic")).toBe(
      "https://axidify.github.io/axicharts/runtime/import?preset=ops-mosaic",
    );
    expect(isShareImportPreset(findImportPreset("ops-dashboard")!)).toBe(true);
    expect(isShareImportPreset(findImportPreset("ops-embed")!)).toBe(false);
    expect(formatValidatePresetCommand("ops-embed", "all")).toBe(
      "charts-runtime validate --all --preset ops-embed",
    );
    expect(formatValidatePresetCommand("ops-dashboard", "all")).toBe(
      "charts-runtime validate --share --all --preset ops-dashboard",
    );
    expect(formatValidateFileCommand("ops-embed.runtime.json", "runtime", "all")).toBe(
      "charts-runtime validate --all ops-embed.runtime.json",
    );
    expect(formatValidateFileCommand("my export.share.json", "share", "schema")).toBe(
      'charts-runtime validate --share --schema "my export.share.json"',
    );
  });

  it("lists import deep links for docs index", () => {
    const links = listImportDeepLinks("/axicharts/");
    expect(links).toHaveLength(HOSTED_IMPORT_PRESETS.length);
    expect(links[8]?.galleryPath).toBe("/runtime/import?preset=ops-workspace");
    expect(links[8]?.localMirrorPath).toContain("ops-workspace.workspace.json");
    expect(findImportPreset("ops-websocket")?.adapter).toBe("websocket");
    expect(findImportPreset("ops-mock-live")?.adapter).toBe("mock-live");
  });

  it("filters import gallery presets by kind and adapter", () => {
    expect(parseImportGalleryFilter("?kind=runtime").type).toBe("kind");
    expect(parseImportGalleryFilter("?adapter=rest")).toEqual({ type: "adapter", value: "rest" });
    expect(filterImportPresets({ type: "kind", value: "dashboard" })).toHaveLength(1);
    expect(filterImportPresets({ type: "adapter", value: "mqtt" })[0]?.id).toBe("ops-mqtt");
    expect(importGalleryFilterPath({ type: "adapter", value: "historian" })).toBe(
      "/runtime/import?adapter=historian",
    );
    expect(
      isImportGalleryFilterActive(
        parseImportGalleryFilter("?adapter=rest"),
        { type: "adapter", value: "rest" },
      ),
    ).toBe(true);
  });
});
