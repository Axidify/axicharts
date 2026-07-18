import { describe, expect, it } from "vitest";
import { compilePanel } from "./compilePanel";
import { ejectPanel } from "./eject";

const SCATTER_ROWS = [
  { symbol: "AAPL", risk: 0.22, returnPct: 0.18, marketCap: 2800, label: "AAPL" },
  { symbol: "MSFT", risk: 0.19, returnPct: 0.16, marketCap: 3100, label: "MSFT" },
  { symbol: "NVDA", risk: 0.41, returnPct: 0.52, marketCap: 2200, label: "NVDA" },
];

describe("scatter spec round-trip", () => {
  it("compiles and ejects scatter axis + point label props", () => {
    const spec = {
      type: "scatter" as const,
      theme: "clean" as const,
      encoding: {
        x: { field: "risk", label: "Risk" },
        y: { field: "returnPct", label: "Return" },
      },
      props: {
        xLabel: "Risk",
        yLabel: "Return %",
        showPointLabels: true,
        labelField: "label",
      },
    };

    const element = compilePanel(spec, SCATTER_ROWS);
    expect(element).toBeTruthy();

    const jsx = ejectPanel(spec, "rows");
    expect(jsx).toContain("ScatterChart");
    expect(jsx).toContain('xLabel={"Risk"}');
    expect(jsx).toContain('yLabel={"Return %"}');
    expect(jsx).toContain("showPointLabels");
    expect(jsx).toContain("row.label");
  });

  it("compiles and ejects bubble size encoding", () => {
    const spec = {
      type: "scatter" as const,
      theme: "clean" as const,
      encoding: {
        x: { field: "risk" },
        y: { field: "returnPct" },
        size: { field: "marketCap", range: [8, 24] as [number, number] },
      },
      props: {
        xLabel: "Risk",
        yLabel: "Return %",
        showSizeLegend: true,
        labelField: "label",
      },
    };

    const element = compilePanel(spec, SCATTER_ROWS);
    expect(element).toBeTruthy();

    const jsx = ejectPanel(spec, "rows");
    expect(jsx).toContain("resolveSizeMark");
    expect(jsx).toContain('resolveSizeMark(row.marketCap');
    expect(jsx).toContain('"bubble"');
    expect(jsx).toContain("size: resolveSizeMark");
    expect(jsx).toContain("showSizeLegend");
  });
});
