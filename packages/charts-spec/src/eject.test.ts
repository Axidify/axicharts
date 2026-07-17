import { describe, expect, it } from "vitest";
import { ejectPanel } from "./eject";

describe("ejectPanel", () => {
  it("emits Layer 1 JSX for a line panel", () => {
    const jsx = ejectPanel(
      {
        type: "line",
        encoding: {
          x: { field: "date" },
          y: { field: "revenue" },
        },
        theme: "clean",
        height: 240,
        fill: true,
        valueSuffix: " USD",
      },
      "rows",
    );

    expect(jsx).toContain('import { ChartContainer, LineChart }');
    expect(jsx).toContain("cleanTheme");
    expect(jsx).toContain("rows.map((row) => String(row.date))");
    expect(jsx).toContain("fill");
    expect(jsx).toContain('valueSuffix=" USD"');
  });

  it("emits stat without ChartContainer", () => {
    const jsx = ejectPanel({
      type: "stat",
      title: "CPU",
      props: { value: "42%", label: "CPU", tone: "warning" },
    });

    expect(jsx).toContain("<Stat");
    expect(jsx).not.toContain("ChartContainer");
  });
});
