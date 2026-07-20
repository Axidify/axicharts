import { describe, expect, it } from "vitest";
import { inferChartGeometry } from "./inferGeometry";
import type { FieldProfile } from "../../types";

const fieldProfiles: FieldProfile[] = [
  { name: "Category", role: "dimension" },
  { name: "Amount", role: "measure" },
];

describe("C165 inferChartGeometry — L1 profile hints", () => {
  it("uses vertical bar for high-cardinality dimensions until horizontal renderer ships", () => {
    const geometry = inferChartGeometry({
      kind: "chart",
      intent: "spend by category",
      fieldProfiles,
      xField: "Category",
      yField: "Amount",
      cardinalities: { Category: 24 },
    });

    expect(geometry.orientation).toBe("vertical");
    expect(geometry.rules).toContain("geometry:high-cardinality-bar");
  });

  it("prefers line chart when time span spans multiple days", () => {
    const geometry = inferChartGeometry({
      kind: "chart",
      intent: "balance trend",
      fieldProfiles: [
        { name: "Date", role: "time" },
        { name: "Balance", role: "measure" },
      ],
      xField: "Date",
      yField: "Balance",
      grain: "transaction",
      timeSpan: { field: "Date", from: "2026-07-01", to: "2026-07-15" },
    });

    expect(geometry.markType).toBe("line");
    expect(geometry.rules).toContain("geometry:time-span-line");
  });
});
