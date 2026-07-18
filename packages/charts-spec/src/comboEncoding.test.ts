import { describe, expect, it } from "vitest";
import { comboSeriesFromEncoding } from "./comboEncoding";

describe("comboSeriesFromEncoding", () => {
  const rows = [
    { week: "W1", volume: 120, avg: 17 },
    { week: "W2", volume: 90, avg: 13 },
  ];

  it("maps y encodings to combo series with default kinds", () => {
    const series = comboSeriesFromEncoding(rows, [
      { field: "volume", label: "Volume" },
      { field: "avg", label: "Daily avg" },
    ]);

    expect(series).toEqual([
      { name: "Volume", data: [120, 90], kind: "bar" },
      { name: "Daily avg", data: [17, 13], kind: "line" },
    ]);
  });

  it("respects explicit kind on y encodings", () => {
    const series = comboSeriesFromEncoding(rows, [
      { field: "avg", kind: "line", label: "Trend" },
      { field: "volume", kind: "bar", label: "Bars" },
    ]);

    expect(series[0]?.kind).toBe("line");
    expect(series[1]?.kind).toBe("bar");
  });
});
