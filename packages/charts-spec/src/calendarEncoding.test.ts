import { describe, expect, it } from "vitest";
import { calendarFromRows, inferCalendarYear } from "./calendarEncoding";

describe("calendarFromRows", () => {
  it("builds calendar points from date + value encoding", () => {
    const rows = [
      { date: "2026-01-01", value: 3 },
      { date: "2026-01-02", value: 7 },
    ];

    expect(
      calendarFromRows(rows, {
        date: { field: "date" },
        value: { field: "value" },
      }),
    ).toEqual([
      { date: "2026-01-01", value: 3 },
      { date: "2026-01-02", value: 7 },
    ]);
  });

  it("supports x/y encoding aliases", () => {
    const rows = [{ day: "2026-03-15", count: 12 }];

    expect(
      calendarFromRows(rows, {
        x: { field: "day" },
        y: { field: "count" },
      }),
    ).toEqual([{ date: "2026-03-15", value: 12 }]);
  });
});

describe("inferCalendarYear", () => {
  it("uses explicit year when provided", () => {
    expect(
      inferCalendarYear({
        points: [{ date: "2025-06-01", value: 1 }],
        year: 2024,
      }),
    ).toBe(2024);
  });

  it("infers year from the first point date", () => {
    expect(
      inferCalendarYear({
        points: [{ date: "2026-06-01", value: 1 }],
      }),
    ).toBe(2026);
  });
});
