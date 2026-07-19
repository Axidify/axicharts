import { describe, expect, it } from "vitest";
import { parseRuntimeSpec, serializeRuntimeSpec, toPortableRuntimeSpec } from "./runtimeSpec";
import { validateRuntimeSpecRaw } from "./runtimeValidation";
import type { RuntimeDashboardSpec } from "./types";

const embedSpec: RuntimeDashboardSpec = {
  layout: "embed",
  dashboard: {
    version: "0.1",
    title: "Line 3",
    template: "ops-2x2",
    theme: "industrial",
    dataSources: [
      { id: "ops", type: "static", data: { categories: ["Mon"], cells: [] } },
    ],
    dataSourceId: "ops",
    data: {
      alarms: [{ id: "a1", message: "High CPU", severity: "warning" }],
    },
  },
};

describe("runtimeSpec", () => {
  it("round-trips portable runtime specs", () => {
    const json = serializeRuntimeSpec(embedSpec);
    const parsed = parseRuntimeSpec(json);
    expect(parsed.layout).toBe("embed");
    expect(parsed.dashboard.template).toBe("ops-2x2");
    expect(parsed.dashboard.dataSources?.[0]?.id).toBe("ops");
  });

  it("strips non-serializable fields", () => {
    const spec: RuntimeDashboardSpec = {
      layout: "embed",
      dashboard: {
        template: "ops-2x2",
        dataSource: {
          type: "rest",
          url: "/api/metrics",
          fetch: async () => new Response("{}"),
        },
      },
    };

    const portable = toPortableRuntimeSpec(spec);
    expect(portable.dashboard.dataSource).toEqual({
      type: "rest",
      url: "/api/metrics",
    });
  });

  it("parses mosaic layout specs", () => {
    const parsed = parseRuntimeSpec(
      JSON.stringify({
        layout: "mosaic",
        wall: {
          title: "Plant",
          cells: [{ id: "ops", template: "ops-2x2" }],
        },
      }),
    );

    expect(parsed.layout).toBe("mosaic");
    expect(parsed.wall.cells).toHaveLength(1);
  });

  it("parses hybrid layout specs (C172)", () => {
    const parsed = parseRuntimeSpec(
      JSON.stringify({
        layout: "hybrid",
        hybrid: {
          title: "Ops + tabular",
          panels: {
            title: "Ledger KPIs",
            kpis: [],
            charts: [
              {
                panel: {
                  type: "stat",
                  title: "Balance",
                  props: { label: "Balance", value: "RM 8,050" },
                },
                rows: [],
              },
            ],
            columns: 2,
          },
          wall: {
            title: "Line 3 MQTT",
            theme: "industrial",
            mode: "live",
            dataSource: {
              type: "mqtt",
              url: "mqtt://broker.example.com",
              topic: "plant/line3/metrics",
            },
            cells: [{ id: "ops", template: "ops-2x2" }],
          },
        },
      }),
    );

    expect(parsed.layout).toBe("hybrid");
    expect(parsed.hybrid.panels.columns).toBe(2);
    expect(parsed.hybrid.wall.dataSource?.type).toBe("mqtt");
  });

  it("rejects unknown templates", () => {
    const result = validateRuntimeSpecRaw({
      layout: "embed",
      dashboard: { template: "not-a-template" },
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]?.path).toContain("template");
  });

  it("rejects dangling mosaic dataSourceId refs", () => {
    const result = validateRuntimeSpecRaw({
      layout: "mosaic",
      wall: {
        dataSourceId: "missing",
        dataSources: [{ id: "ops", type: "static", data: {} }],
        cells: [{ id: "ops", template: "ops-2x2", dataSourceId: "missing" }],
      },
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((item) => item.path.includes("dataSourceId"))).toBe(true);
  });
});
