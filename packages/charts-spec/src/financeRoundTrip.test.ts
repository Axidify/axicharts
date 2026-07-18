import { describe, expect, it } from "vitest";
import { compilePanel } from "./compilePanel";
import { ejectPanel } from "./eject";

describe("finance spec round-trip", () => {
  it("compiles and ejects waterfall IBCS props", () => {
    const spec = {
      type: "waterfall" as const,
      theme: "clean" as const,
      props: {
        items: [
          { name: "Q1", value: 1100000, isTotal: true },
          { name: "New ARR", value: 240000 },
          { name: "Churn", value: -80000, tone: "critical" as const },
          { name: "Q2", value: 1330000, isTotal: true },
        ],
        valueFormat: "currency",
        showSigns: true,
        connectorStyle: "dashed",
      },
    };

    const element = compilePanel(spec, []);
    expect(element).toBeTruthy();

    const jsx = ejectPanel(spec, "rows");
    expect(jsx).toContain("WaterfallChart");
    expect(jsx).toContain('valueFormat="currency"');
    expect(jsx).toContain("showLabels");
    expect(jsx).toContain("showSigns");
    expect(jsx).toContain('connectorStyle="dashed"');
  });

  it("compiles and ejects candlestick session + brush props", () => {
    const spec = {
      type: "candlestick" as const,
      theme: "live" as const,
      mode: "live" as const,
      encoding: {
        x: { field: "time", type: "nominal" as const },
        open: { field: "open", type: "quantitative" as const },
        high: { field: "high", type: "quantitative" as const },
        low: { field: "low", type: "quantitative" as const },
        close: { field: "close", type: "quantitative" as const },
      },
      props: {
        brush: true,
        brushEnd: 45,
        sessionShading: "rth",
        volumeField: "volume",
        syncId: "ohlc",
      },
    };

    const rows = [
      {
        time: "09:30",
        open: 100,
        high: 101,
        low: 99,
        close: 100.5,
        volume: 1200,
      },
    ];

    const element = compilePanel(spec, rows);
    expect(element).toBeTruthy();

    const jsx = ejectPanel(spec, "rows");
    expect(jsx).toContain("CandlestickChart");
    expect(jsx).toContain("brush");
    expect(jsx).toContain("brushEnd={45}");
    expect(jsx).toContain('sessionShading="rth"');
    expect(jsx).toContain("volume={rows.map((row) => Number(row.volume))}");
  });
});
