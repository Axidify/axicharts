import { describe, expect, it } from "vitest";
import { parseRuntimeSpec, serializeRuntimeSpec, toPortableRuntimeSpec } from "./runtimeSpec";
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
});
