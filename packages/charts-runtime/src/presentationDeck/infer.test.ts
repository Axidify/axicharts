import { describe, expect, it } from "vitest";
import type { RuntimeDashboardSpec } from "../types";
import { inferPresentationDeck, resolvePresentationDeck } from "./infer";

const financeSpec: RuntimeDashboardSpec = {
  layout: "embed",
  dashboard: {
    template: "finance-pnl",
    title: "Q4 review",
    data: {
      kpis: [{ value: "62.4%", label: "Gross margin" }],
      categories: ["Q1", "Q2"],
      revenue: [820, 932],
    },
  },
};

const opsSpec: RuntimeDashboardSpec = {
  layout: "embed",
  dashboard: {
    template: "ops-2x2",
    data: {
      categories: ["08:00", "09:00"],
      cells: [
        { title: "CPU", data: [22, 28], suffix: "%" },
        { title: "Memory", data: [55, 58], suffix: "%" },
      ],
    },
  },
};

describe("inferPresentationDeck", () => {
  it("builds finance P&L section slides", () => {
    const deck = inferPresentationDeck(financeSpec);
    expect(deck.slides.map((slide) => slide.id)).toEqual(["kpis", "waterfall", "revenue"]);
    expect(deck.slides[0]?.section).toBe("kpis");
  });

  it("builds ops 2x2 cell slides", () => {
    const deck = inferPresentationDeck(opsSpec);
    expect(deck.slides).toHaveLength(2);
    expect(deck.slides[0]).toMatchObject({ title: "CPU", section: "cell", cellIndex: 0 });
  });

  it("prefers explicit deck config when provided", () => {
    const custom = {
      version: 1 as const,
      slides: [{ id: "hero", title: "Hero", section: "full" as const }],
    };
    const deck = resolvePresentationDeck(financeSpec, custom);
    expect(deck.slides).toHaveLength(1);
    expect(deck.slides[0]?.id).toBe("hero");
  });
});
