import type { RuntimeDashboardSpec } from "../types";
import type { PresentationDeckSlideSpec, PresentationDeckSpec } from "./types";

function opsCellSlides(data: Record<string, unknown>): PresentationDeckSlideSpec[] {
  const cells = (data.cells as Array<{ title: string }>) ?? [];
  return cells.map((cell, index) => ({
    id: `cell-${index}`,
    title: cell.title,
    section: "cell" as const,
    cellIndex: index,
  }));
}

function financePnlSlides(): PresentationDeckSlideSpec[] {
  return [
    { id: "kpis", title: "Key metrics", section: "kpis" },
    { id: "waterfall", title: "P&L bridge", section: "waterfall" },
    { id: "revenue", title: "Revenue trend", section: "revenue" },
  ];
}

function lineOverviewSlides(): PresentationDeckSlideSpec[] {
  return [
    { id: "kpis", title: "Key metrics", section: "kpis" },
    { id: "trend", title: "Throughput trend", section: "trend" },
  ];
}

export function inferPresentationDeck(spec: RuntimeDashboardSpec): PresentationDeckSpec {
  if (spec.layout === "mosaic") {
    return {
      version: 1,
      slides: spec.wall.cells.map((cell) => ({
        id: cell.id,
        title: cell.title,
        subtitle: cell.subtitle,
        section: "full" as const,
      })),
    };
  }

  const dashboard = spec.dashboard;
  const data = dashboard.data ?? {};

  switch (dashboard.template) {
    case "finance-pnl":
      return { version: 1, slides: financePnlSlides() };
    case "ops-2x2":
      return { version: 1, slides: opsCellSlides(data) };
    case "line-overview":
      return { version: 1, slides: lineOverviewSlides() };
    default:
      return {
        version: 1,
        slides: [
          {
            id: "dashboard",
            title: dashboard.title,
            subtitle: dashboard.subtitle,
            section: "full",
          },
        ],
      };
  }
}

export function resolvePresentationDeck(
  spec: RuntimeDashboardSpec,
  deck?: PresentationDeckSpec | null,
): PresentationDeckSpec {
  if (deck?.slides?.length) {
    return { version: 1, ...deck, slides: deck.slides };
  }
  return inferPresentationDeck(spec);
}
