import { describe, expect, it } from "vitest";
import {
  buildChartPointerEvent,
  normalizeChartCategories,
} from "./chartPointerEvent";

describe("normalizeChartCategories", () => {
  it("splits labels and meta", () => {
    expect(
      normalizeChartCategories([
        "Mon",
        { label: "Tue", meta: { date: "2026-07-14" } },
      ]),
    ).toEqual({
      labels: ["Mon", "Tue"],
      meta: [undefined, { date: "2026-07-14" }],
    });
  });
});

describe("buildChartPointerEvent", () => {
  it("category-band click has null series fields", () => {
    const event = buildChartPointerEvent({
      categoryIndex: 1,
      labels: ["Mon", "Tue"],
      categoryMeta: [undefined, { date: "2026-07-14" }],
      series: [{ name: "A", data: [1, 0] }],
      seriesIndex: null,
      nativeEvent: { type: "click" } as PointerEvent,
    });
    expect(event.category).toBe("Tue");
    expect(event.categoryIndex).toBe(1);
    expect(event.seriesName).toBeNull();
    expect(event.value).toBeNull();
    expect(event.meta).toEqual({ date: "2026-07-14" });
  });

  it("includes zero values when series resolved", () => {
    const event = buildChartPointerEvent({
      categoryIndex: 1,
      labels: ["Mon", "Tue"],
      categoryMeta: [undefined, undefined],
      series: [{ name: "A", data: [5, 0] }],
      seriesIndex: 0,
      nativeEvent: { type: "click" } as PointerEvent,
    });
    expect(event.value).toBe(0);
    expect(event.seriesName).toBe("A");
  });
});
