import { describe, expect, it } from "vitest";
import { drawStackBarTotals, recordStackBarTotal } from "./stackBarTotals";

describe("stackBarTotals", () => {
  it("accumulates stacked segment totals and tracks the top segment", () => {
    const totals = new Map();
    recordStackBarTotal(totals, 0, 10, 80, 20, 40);
    recordStackBarTotal(totals, 0, 10, 50, 20, 30);

    expect(totals.get(0)).toEqual({
      left: 10,
      top: 50,
      width: 20,
      total: 70,
    });
  });

  it("draws formatted totals above each stack", () => {
    const totals = new Map([
      [0, { left: 10, top: 40, width: 20, total: 70 }],
    ]);
    const calls: Array<{ text: string; x: number; y: number }> = [];
    const ctx = {
      save: () => undefined,
      restore: () => undefined,
      fillText: (text: string, x: number, y: number) => {
        calls.push({ text, x, y });
      },
    } as unknown as CanvasRenderingContext2D;

    drawStackBarTotals(ctx, totals, "%", "#94a3b8", (value, suffix) => `${value}${suffix ?? ""}`);

    expect(calls).toEqual([{ text: "70%", x: 20, y: 36 }]);
  });
});
