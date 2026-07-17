import { createElement, type ReactElement } from "react";
import {
  AreaChart,
  BarChart,
  CandlestickChart,
  ChartContainer,
  ChartSyncGroup,
  Gauge,
  HeatmapChart,
  LineChart,
  PieChart,
  Stat,
  WaterfallChart,
  type PlotSeries,
  type StatTone,
} from "@axicharts/charts";
import type { DashboardSpec, TemplateId, ThemeName, ChartMode, PanelSpec } from "./types";
import { compilePanel } from "./compilePanel";
import { DEFAULT_PLUGINS_WALL_PANELS } from "./pluginsWallData";
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

function shell(
  theme: ThemeName,
  mode: ChartMode | undefined,
  height: number,
  chart: ReactElement,
  syncId?: string,
): ReactElement {
  return createElement(
    ChartContainer,
    {
      theme: resolveTheme(theme),
      mode,
      height,
      width: "100%",
      syncId,
    },
    chart,
  );
}

export function financePnlTemplate(
  data: Record<string, unknown>,
  theme: ThemeName = "clean",
): ReactElement {
  const kpis = (data.kpis as KpiSpec[]) ?? [];
  const waterfall = data.waterfall as Parameters<typeof WaterfallChart>[0]["items"];
  const categories = (data.categories as string[]) ?? [];
  const revenue = (data.revenue as number[]) ?? [];

  return createElement(
    "div",
    {
      style: {
        maxWidth: 720,
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        background: "#ffffff",
        overflow: "hidden",
      },
    },
    createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          padding: 16,
        },
      },
      ...kpis.map((kpi) =>
        createElement(Stat, {
          key: kpi.label,
          value: kpi.value,
          label: kpi.label,
          tone: kpi.tone,
          surface: "light",
        }),
      ),
    ),
    createElement(
      "div",
      { style: { padding: "0 16px 16px" } },
      shell(
        theme,
        "interactive",
        220,
        createElement(WaterfallChart, {
          items: waterfall,
          valueFormat: "currency",
        }),
      ),
      createElement(
        "div",
        { style: { marginTop: 16 } },
        shell(
          theme,
          "interactive",
          160,
          createElement(AreaChart, {
            categories,
            series: [{ name: "Revenue", data: revenue }],
          }),
        ),
      ),
    ),
  );
}

export function ops2x2Template(
  data: Record<string, unknown>,
  theme: ThemeName = "industrial",
): ReactElement {
  const categories = (data.categories as string[]) ?? [];
  const cells = (data.cells as OpsCell[]) ?? [];

  return createElement(
    "div",
    {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 6,
        maxWidth: 720,
      },
    },
    ...cells.map((cell) =>
      createElement(
        "div",
        {
          key: cell.title,
          style: {
            border: "1px solid #334155",
            borderRadius: 6,
            padding: "8px 10px",
          },
        },
        createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
              fontSize: 12,
            },
          },
          createElement("span", { style: { color: "#94a3b8" } }, cell.title),
          createElement(
            "span",
            { style: { fontFamily: "ui-monospace, Menlo, monospace" } },
            `${cell.data[cell.data.length - 1]?.toFixed(0) ?? "0"}${cell.suffix ?? ""}`,
          ),
        ),
        shell(
          theme,
          "live",
          56,
          createElement(LineChart, {
            categories,
            series: [{ name: cell.title, data: cell.data, tone: cell.tone }],
            fill: true,
            showAxes: false,
          }),
        ),
      ),
    ),
  );
}

export function lineOverviewTemplate(
  data: Record<string, unknown>,
  theme: ThemeName = "clean",
): ReactElement {
  const kpis = (data.kpis as KpiSpec[]) ?? [];
  const categories = (data.categories as string[]) ?? [];
  const series = (data.series as PlotSeries[]) ?? [];
  const weekly = data.weekly as { categories: string[]; values: number[] } | undefined;

  return createElement(
    "div",
    { style: { maxWidth: 520 } },
    createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 10,
        },
      },
      ...kpis.map((kpi) =>
        createElement(
          "div",
          {
            key: kpi.label,
            style: { background: "#f1f5f9", borderRadius: 8, padding: "12px 14px" },
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
    shell(
      theme,
      "interactive",
      180,
      createElement(LineChart, { categories, series, fill: true }),
    ),
    weekly
      ? createElement(
          "div",
          { style: { marginTop: 12 } },
          shell(
            theme,
            "interactive",
            120,
            createElement(BarChart, {
              categories: weekly.categories,
              series: [{ name: "Total", data: weekly.values }],
              showValues: true,
            }),
          ),
        )
      : null,
  );
}

export function capacityGridTemplate(
  data: Record<string, unknown>,
  theme: ThemeName = "clean",
): ReactElement {
  const kpis = (data.kpis as KpiSpec[]) ?? [];
  const gauges = (data.gauges as Array<{
    value: number;
    label: string;
    warningAt?: number;
    criticalAt?: number;
  }>) ?? [];
  const slices = data.slices as Parameters<typeof PieChart>[0]["slices"];
  const bar = data.bar as { categories: string[]; values: number[] };

  return createElement(
    "div",
    { style: { maxWidth: 720, padding: 16 } },
    createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
        },
      },
      ...kpis.map((kpi) =>
        createElement(Stat, {
          key: kpi.label,
          value: kpi.value,
          label: kpi.label,
          tone: kpi.tone,
          surface: "light",
        }),
      ),
    ),
    createElement(
      "div",
      {
        style: {
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
        },
      },
      ...gauges.map((gauge) =>
        createElement(Gauge, {
          key: gauge.label,
          value: gauge.value,
          label: gauge.label,
          unit: "%",
          warningAt: gauge.warningAt,
          criticalAt: gauge.criticalAt,
        }),
      ),
    ),
    createElement(
      "div",
      {
        style: {
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        },
      },
      shell(theme, "interactive", 220, createElement(PieChart, { slices, showLabels: true })),
      shell(
        theme,
        "interactive",
        220,
        createElement(BarChart, {
          categories: bar.categories,
          series: [{ name: "Usage", data: bar.values }],
          showValues: true,
          valueSuffix: " h",
        }),
      ),
    ),
  );
}

export function tradingBlotterTemplate(
  data: Record<string, unknown>,
  theme: ThemeName = "live",
): ReactElement {
  const kpis = (data.kpis as KpiSpec[]) ?? [];
  const categories = (data.categories as string[]) ?? [];
  const ohlc = data.ohlc as Parameters<typeof CandlestickChart>[0]["data"];
  const volume = data.volume as number[] | undefined;
  const rsi = data.rsi as number[] | undefined;
  const heatmap = data.heatmap as Parameters<typeof HeatmapChart>[0]["matrix"];

  return createElement(
    "div",
    { style: { maxWidth: 820, padding: 16, background: "#0f172a", borderRadius: 8 } },
    createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 12,
        },
      },
      ...kpis.map((kpi) =>
        createElement(Stat, {
          key: kpi.label,
          value: kpi.value,
          label: kpi.label,
          tone: kpi.tone,
          surface: "dark",
          monospace: true,
        }),
      ),
    ),
    createElement(
      ChartSyncGroup,
      null,
      createElement(
        "div",
        { style: { marginTop: 16 } },
        shell(
          theme,
          "live",
          280,
          createElement(CandlestickChart, { categories, data: ohlc, volume }),
          "ohlc",
        ),
      ),
      rsi
        ? createElement(
            "div",
            { style: { marginTop: 12 } },
            shell(
              theme,
              "live",
              120,
              createElement(LineChart, {
                categories,
                series: [{ name: "RSI", data: rsi, tone: "warning" }],
                fill: true,
              }),
              "rsi",
            ),
          )
        : null,
    ),
    createElement(
      "div",
      { style: { marginTop: 16 } },
      shell(
        theme,
        "interactive",
        200,
        createElement(HeatmapChart, { matrix: heatmap, min: 0, max: 1 }),
      ),
    ),
  );
}

export function pluginsWallTemplate(
  data: Record<string, unknown>,
  theme: ThemeName = "industrial",
  mode?: ChartMode,
): ReactElement {
  const panels = (data.panels as PanelSpec[] | undefined) ?? DEFAULT_PLUGINS_WALL_PANELS;
  const panelData = (data.panelData as Record<string, Record<string, unknown>> | undefined) ?? {};

  return createElement(
    "div",
    {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12,
        alignItems: "end",
        maxWidth: 960,
        padding: 12,
        background: "#0f172a",
        borderRadius: 8,
        border: "1px solid #334155",
      },
    },
    ...panels.map((panel, index) => {
      const key = panel.title ?? `${panel.type}-${index}`;
      const dataForPanel = panelData[key] ?? panelData[panel.type] ?? {};
      return createElement(
        "div",
        { key, style: { minWidth: 0 } },
        compilePanel(panel, dataForPanel, {
          theme: panel.theme ?? theme,
          mode: panel.mode ?? mode,
        }),
      );
    }),
  );
}

const TEMPLATE_RENDERERS: Record<
  TemplateId,
  (data: Record<string, unknown>, theme: ThemeName, mode?: ChartMode) => ReactElement
> = {
  "finance-pnl": (data, theme) => financePnlTemplate(data, theme),
  "ops-2x2": (data, theme) => ops2x2Template(data, theme),
  "line-overview": (data, theme) => lineOverviewTemplate(data, theme),
  "capacity-grid": (data, theme) => capacityGridTemplate(data, theme),
  "trading-blotter": (data, theme) => tradingBlotterTemplate(data, theme),
  "plugins-wall": (data, theme, mode) => pluginsWallTemplate(data, theme, mode),
};

export function compileTemplate(
  template: TemplateId,
  data: Record<string, unknown>,
  options: { theme?: ThemeName; mode?: ChartMode } = {},
): ReactElement {
  const theme = options.theme ?? (data.theme as ThemeName | undefined) ?? "clean";
  const render = TEMPLATE_RENDERERS[template];
  return render(data, theme, options.mode);
}

export function compileDashboard(spec: DashboardSpec): ReactElement {
  return createElement(
    "div",
    { className: "axicharts-dashboard" },
    spec.title
      ? createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
            },
          },
          createElement("strong", null, spec.title),
          spec.subtitle
            ? createElement("span", { style: { color: "#64748b", fontSize: 12 } }, spec.subtitle)
            : null,
        )
      : null,
    compileTemplate(spec.template, spec.data, {
      theme: spec.theme,
      mode: spec.mode,
    }),
  );
}

export function listTemplates(): TemplateId[] {
  return Object.keys(TEMPLATE_RENDERERS) as TemplateId[];
}
