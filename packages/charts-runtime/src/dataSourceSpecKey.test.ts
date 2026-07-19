import { describe, expect, it } from "vitest";
import { boundDataSourcesKey, dataSourceSpecKey } from "./dataSourceSpecKey";

describe("dataSourceSpecKey", () => {
  it("matches static specs with equivalent data", () => {
    const a = { type: "static" as const, data: { rows: [{ week: "W1", cpu: 1 }] } };
    const b = { type: "static" as const, data: { rows: [{ week: "W1", cpu: 1 }] } };
    expect(dataSourceSpecKey(a)).toBe(dataSourceSpecKey(b));
  });

  it("ignores function fields on historian specs", () => {
    const a = {
      type: "historian" as const,
      url: "/api/tags",
      tags: ["cpu"],
      fetch: async () => ({ ok: true, json: async () => ({}) }) as Response,
    };
    const b = {
      type: "historian" as const,
      url: "/api/tags",
      tags: ["cpu"],
      fetch: async () => ({ ok: false, json: async () => ({}) }) as Response,
    };
    expect(dataSourceSpecKey(a)).toBe(dataSourceSpecKey(b));
  });

  it("keys bound source lists in stable order", () => {
    const sources = [
      { id: "ops", type: "static" as const, data: { rows: [] } },
      { id: "finance", type: "static" as const, data: { kpis: [] } },
    ];
    expect(boundDataSourcesKey(sources)).toBe(boundDataSourcesKey([...sources]));
  });
});
