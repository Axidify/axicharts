import { describe, expect, it } from "vitest";
import type { RuntimeDashboardSpec } from "../types";
import { parseDashboardExport, serializeDashboardExport } from "./export";

const spec: RuntimeDashboardSpec = {
  layout: "embed",
  dashboard: {
    title: "Export test",
    template: "ops-2x2",
  },
};

describe("dashboard export", () => {
  it("round-trips envelope with meta", () => {
    const json = serializeDashboardExport("Ops wall", spec, {
      layout: "embed",
      feed: "historian",
      template: "ops-2x2",
      presentation: true,
    });
    const parsed = parseDashboardExport(json);
    expect(parsed.name).toBe("Ops wall");
    expect(parsed.meta?.presentation).toBe(true);
    expect(parsed.spec.dashboard?.template).toBe("ops-2x2");
  });

  it("parses legacy bare runtime JSON", () => {
    const parsed = parseDashboardExport(JSON.stringify(spec));
    expect(parsed.spec.dashboard?.template).toBe("ops-2x2");
  });
});
