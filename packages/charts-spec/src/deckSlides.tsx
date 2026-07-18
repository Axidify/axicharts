import { createElement, type ReactElement } from "react";
import {
  AreaChart,
  BarChart,
  ChartContainer,
  LineChart,
  Stat,
  WaterfallChart,
  type PlotSeries,
  type StatTone,
} from "@axicharts/charts";
import type { ChartConfigSpec, ChartMode, ThemeName } from "./types";
import { toChartConfig } from "./panelChartConfig";
import { resolveTheme } from "./themes";

type KpiSpec = {
  value: string;
  label: string;
  tone?: StatTone;
};

type OpsCell = {
  title: string;
  data: number[];
  tone?: PlotSeries["tone"];
  suffix?: string;
};

export type DeckSlideCompileOptions = {
  theme?: ThemeName;
  mode?: ChartMode;
  chartConfig?: ChartConfigSpec;
  height?: number;
};

function shell(
  theme: ThemeName,
  mode: ChartMode | undefined,
  height: number,
  chart: ReactElement,
  chartConfig?: ChartConfigSpec,
): ReactElement {
  return createElement(
    ChartContainer,
    {
      theme: resolveTheme(theme),
      mode,
      height,
      width: "100%",
      config: toChartConfig(chartConfig),
    },
    chart,
  );
}

export function compileFinancePnlDeckSlide(
  section: "kpis" | "waterfall" | "revenue",
  data: Record<string, unknown>,
  options: DeckSlideCompileOptions = {},
): ReactElement {
  const theme = options.theme ?? "presentation";
  const mode = options.mode ?? "presentation";
  const kpis = (data.kpis as KpiSpec[]) ?? [];
  const waterfall = data.waterfall as Parameters<typeof WaterfallChart>[0]["items"];
  const categories = (data.categories as string[]) ?? [];
  const revenue = (data.revenue as number[]) ?? [];

  if (section === "kpis") {
    return createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          width: "100%",
          maxWidth: 720,
        },
      },
      ...kpis.map((kpi) =>
        createElement(
          "div",
          {
            key: kpi.label,
            style: {
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "16px 18px",
            },
          },
          createElement(
            ChartContainer,
            {
              theme: resolveTheme(theme),
              mode,
              width: "100%",
              height: 100,
            },
            createElement(Stat, {
              value: kpi.value,
              label: kpi.label,
              tone: kpi.tone,
              surface: "light",
            }),
          ),
        ),
      ),
    );
  }

  if (section === "waterfall") {
    return shell(
      theme,
      mode,
      options.height ?? 320,
      createElement(WaterfallChart, {
        items: waterfall,
        valueFormat: "currency",
      }),
      options.chartConfig,
    );
  }

  return shell(
    theme,
    mode,
    options.height ?? 280,
    createElement(AreaChart, {
      categories,
      series: [{ name: "Revenue", data: revenue }],
    }),
    options.chartConfig,
  );
}

export function compileOps2x2DeckCell(
  cellIndex: number,
  data: Record<string, unknown>,
  options: DeckSlideCompileOptions = {},
): ReactElement {
  const theme = options.theme ?? "presentation";
  const mode = options.mode ?? "presentation";
  const categories = (data.categories as string[]) ?? [];
  const cells = (data.cells as OpsCell[]) ?? [];
  const cell = cells[cellIndex];
  if (!cell) {
    return createElement("div", null, "Missing cell");
  }

  return createElement(
    "div",
    { style: { width: "100%", maxWidth: 720 } },
    createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
          fontSize: 14,
          fontWeight: 600,
          color: "#0f172a",
        },
      },
      createElement("span", null, cell.title),
      createElement(
        "span",
        { style: { fontFamily: "ui-monospace, Menlo, monospace", color: "#64748b" } },
        `${cell.data[cell.data.length - 1]?.toFixed(0) ?? "0"}${cell.suffix ?? ""}`,
      ),
    ),
    shell(
      theme,
      mode,
      options.height ?? 280,
      createElement(LineChart, {
        categories,
        series: [{ name: cell.title, data: cell.data, tone: cell.tone }],
        fill: true,
      }),
      options.chartConfig,
    ),
  );
}

export function compileLineOverviewDeckSlide(
  section: "kpis" | "trend",
  data: Record<string, unknown>,
  options: DeckSlideCompileOptions = {},
): ReactElement {
  const theme = options.theme ?? "presentation";
  const mode = options.mode ?? "presentation";
  const kpis = (data.kpis as KpiSpec[]) ?? [];
  const categories = (data.categories as string[]) ?? [];
  const series = (data.series as PlotSeries[]) ?? [];

  if (section === "kpis") {
    return createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          maxWidth: 520,
        },
      },
      ...kpis.map((kpi) =>
        createElement(
          "div",
          {
            key: kpi.label,
            style: { background: "#f8fafc", borderRadius: 12, padding: "16px 18px" },
          },
          createElement(
            ChartContainer,
            {
              theme: resolveTheme(theme),
              mode,
              width: "100%",
              height: 100,
            },
            createElement(Stat, {
              value: kpi.value,
              label: kpi.label,
              tone: kpi.tone,
              surface: "light",
            }),
          ),
        ),
      ),
    );
  }

  return shell(
    theme,
    mode,
    options.height ?? 300,
    createElement(LineChart, { categories, series, fill: true }),
    options.chartConfig,
  );
}
