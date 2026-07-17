import { describe, expect, it } from "vitest";
import { buildPortableSpecJson, buildReactEmbedSnippet } from "./embedSnippet";

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

  it("serializes portable runtime JSON", () => {
    const json = buildPortableSpecJson(spec, false);
    expect(json).toContain("ops-2x2");
  });
});
