import { describe, expect, it } from "vitest";
import { cleanTheme } from "@axicharts/charts-theme";
import { readableLabelColor, seriesPalette, toneColor } from "./palette";
import { mapTreemapData } from "./treemapData";

describe("toneColor", () => {
  it("returns undefined without a tone so callers fall back to the palette", () => {
    expect(toneColor(undefined, cleanTheme)).toBeUndefined();
    expect(toneColor("critical", cleanTheme)).toBeTruthy();
  });
});

describe("mapTreemapData", () => {
  it("gives untoned sibling nodes distinct palette colors", () => {
    const data = mapTreemapData(
      [
        { name: "Equities", children: [{ name: "US", value: 3 }] },
        { name: "Fixed Income", children: [{ name: "Treasuries", value: 2 }] },
        { name: "Alternatives", children: [{ name: "Real Estate", value: 1 }] },
      ],
      cleanTheme,
    );
    const parentColors = data.map((node) => node.itemStyle?.color);
    expect(new Set(parentColors).size).toBe(3);
    expect(parentColors).toEqual(seriesPalette(cleanTheme).slice(0, 3));
  });

  it("picks a readable label color per segment fill", () => {
    const [node] = mapTreemapData([{ name: "A", value: 1, tone: "warning" }], cleanTheme);
    expect(node?.label?.color).toBe(readableLabelColor(node!.itemStyle!.color));
  });
});

describe("readableLabelColor", () => {
  it("uses white on dark fills and dark text on light fills", () => {
    expect(readableLabelColor("#2563eb")).toBe("#ffffff");
    expect(readableLabelColor("#dc2626")).toBe("#ffffff");
    expect(readableLabelColor("#d97706")).toBe("#0f172a");
    expect(readableLabelColor("#16a34a")).toBe("#0f172a");
    expect(readableLabelColor("rgb(240, 249, 255)")).toBe("#0f172a");
  });

  it("falls back to dark text for unparseable colors", () => {
    expect(readableLabelColor("hsl(var(--chart-1))")).toBe("#0f172a");
  });
});
