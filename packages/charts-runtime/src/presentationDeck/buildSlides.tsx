import { createElement, type ReactElement } from "react";
import { Dashboard, compileTemplate } from "@axicharts/charts-spec";
import {
  compileFinancePnlDeckSlide,
  compileLineOverviewDeckSlide,
  compileOps2x2DeckCell,
} from "@axicharts/charts-spec";
import { mergeMosaicData, pluckMosaicData } from "../mosaicData";
import type { RuntimeDashboardSpec } from "../types";
import type { PresentationDeckSlideSpec } from "./types";

export type DeckSlideRenderOptions = {
  presentation?: boolean;
};

function presentationMode(presentation?: boolean): "presentation" | undefined {
  return presentation ? "presentation" : undefined;
}

function presentationTheme(
  presentation?: boolean,
  theme?: string,
): "presentation" | undefined {
  if (presentation) return "presentation";
  return theme === "presentation" ? "presentation" : undefined;
}

export function buildDeckSlideContent(
  spec: RuntimeDashboardSpec,
  slide: PresentationDeckSlideSpec,
  options: DeckSlideRenderOptions = {},
): ReactElement {
  const presentation = options.presentation ?? true;
  const mode = presentationMode(presentation);

  if (spec.layout === "mosaic") {
    const cell = spec.wall.cells.find((item) => item.id === slide.id) ?? spec.wall.cells[0];
    if (!cell) {
      return createElement("div", null, "No mosaic cells");
    }
    const merged = mergeMosaicData(spec.wall.data ?? {}, {});
    const cellData = mergeMosaicData(
      merged,
      pluckMosaicData(merged, cell.dataPath),
      cell.data ?? {},
    );
    return createElement(Dashboard, {
      template: cell.template,
      title: slide.title ?? cell.title,
      subtitle: slide.subtitle ?? cell.subtitle,
      theme: presentationTheme(presentation, cell.theme ?? spec.wall.theme),
      mode,
      data: cellData,
    });
  }

  const dashboard = spec.dashboard;
  const data = dashboard.data ?? {};
  const theme = presentationTheme(presentation, dashboard.theme);
  const chartConfig = dashboard.chartConfig;
  const compileOptions = { theme, mode, chartConfig };

  switch (slide.section) {
    case "kpis":
    case "waterfall":
    case "revenue":
      if (dashboard.template === "finance-pnl") {
        return compileFinancePnlDeckSlide(slide.section, data, compileOptions);
      }
      break;
    case "trend":
      if (dashboard.template === "line-overview") {
        return compileLineOverviewDeckSlide("trend", data, compileOptions);
      }
      break;
    case "cell":
      if (dashboard.template === "ops-2x2" && slide.cellIndex != null) {
        return compileOps2x2DeckCell(slide.cellIndex, data, compileOptions);
      }
      break;
    default:
      break;
  }

  if (slide.section === "kpis" && dashboard.template === "line-overview") {
    return compileLineOverviewDeckSlide("kpis", data, compileOptions);
  }

  return createElement(
    "div",
    { className: "axicharts-deck-slide-full", style: { width: "100%", maxWidth: 900 } },
    dashboard.title && slide.section === "full"
      ? createElement(
          "div",
          {
            style: {
              marginBottom: 16,
              fontSize: 18,
              fontWeight: 600,
              color: "#0f172a",
            },
          },
          slide.title ?? dashboard.title,
          slide.subtitle ?? dashboard.subtitle
            ? createElement(
                "span",
                { style: { marginLeft: 12, fontSize: 13, fontWeight: 400, color: "#64748b" } },
                slide.subtitle ?? dashboard.subtitle,
              )
            : null,
        )
      : null,
    compileTemplate(dashboard.template, data, {
      theme,
      mode,
      chartConfig,
    }),
  );
}
