import { describe, expect, it } from "vitest";
import {
  buildInlineReactEmbedSnippet,
  buildPortableSpecJson,
  buildReactEmbedSnippet,
  validateRuntimeSpecJson,
} from "./embedSnippet";
import { buildDeckExportBundle } from "./presentationDeck/deckExport";
import { RUNTIME_SPEC_SCHEMA_URL } from "./schemaUrls";

const spec = {
  layout: "embed" as const,
  dashboard: {
    template: "ops-2x2" as const,
    title: "Line 3",
  },
};

describe("embedSnippet", () => {
  it("builds a React embed snippet", () => {
    const snippet = buildReactEmbedSnippet(spec);
    expect(snippet).toContain('import { RuntimeDashboard } from "@axicharts/charts-runtime"');
    expect(snippet).toContain("export function Dashboard()");
  });

  it("builds inline and file-import bundles", () => {
    const bundle = buildDeckExportBundle(spec, {
      presentation: true,
      alarmScopeId: "line-3",
    });
    expect(bundle.reactSnippet).toContain("./dashboard.runtime.json");
    expect(bundle.inlineReactSnippet).toContain("satisfies RuntimeDashboardSpec");
    expect(bundle.inlineReactSnippet).toContain('alarmScopeId="line-3"');
    expect(bundle.specJson).toContain("ops-2x2");
    expect(bundle.deckJson).toContain("slides");
  });

  it("serializes portable runtime JSON", () => {
    const json = buildPortableSpecJson(spec, false);
    expect(json).toContain("ops-2x2");
    expect(JSON.parse(json).$schema).toBe(RUNTIME_SPEC_SCHEMA_URL);
  });

  it("validates runtime spec JSON", () => {
    const valid = validateRuntimeSpecJson(buildPortableSpecJson(spec));
    expect(valid.spec?.layout).toBe("embed");
    const invalid = validateRuntimeSpecJson('{"layout":"embed"}');
    expect(invalid.error).toBeTruthy();
  });
});
