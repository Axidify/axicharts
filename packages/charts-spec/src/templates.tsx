import { createElement, type ReactElement } from "react";
import {
  AreaChart,
  BarChart,
  CandlestickChart,
  ChartContainer,
  ChartSyncGroup,
  DataTable,
  FunnelChart,
  Gauge,
  HeatmapChart,
  LineChart,
  PieChart,
  Stat,
  WaterfallChart,
  type PlotSeries,
  type StatTone,
} from "@axicharts/charts";
import type { DashboardSpec, TemplateId, ThemeName, ChartMode, PanelSpec, ChartConfigSpec } from "./types";
import { toChartConfig } from "./panelChartConfig";
import { compilePanel } from "./compilePanel";
import { DEFAULT_PLUGINS_WALL_PANELS } from "./pluginsWallData";
import {
  DEFAULT_PROGRAM_DASHBOARD_DATA,
  PROGRAM_DASHBOARD_PANELS,
} from "./programDashboardData";
import { resolveTheme } from "./themes";
import {
  getTemplateRenderer,
  listTemplates as listRegisteredTemplates,
  registerBuiltinDashboardTemplate,
} from "./templateRegistry";

type KpiSpec = {
  value: string;
  label: string;
  tone?: StatTone;
};

const DEFAULT_TRADING_POSITIONS = [
  {
    symbol: "AAPL",
    side: "LONG",
    qty: 400,
    avg: "182.10",
    pnl: "+$360",
    pnlTone: "success" as const,
  },
  {
    symbol: "NVDA",
    side: "LONG",
    qty: 120,
    avg: "118.40",
    pnl: "-$84",
    pnlTone: "critical" as const,
  },
  {
    symbol: "MSFT",
    side: "SHORT",
    qty: 200,
    avg: "428.20",
    pnl: "+$120",
    pnlTone: "success" as const,
  },
];

const TRADING_POSITION_COLUMNS = [
  { key: "symbol", label: "Symbol", monospace: true },
  { key: "side", label: "Side" },
  { key: "qty", label: "Qty", align: "right" as const, monospace: true },
  { key: "avg", label: "Avg", align: "right" as const, monospace: true },
  { key: "pnl", label: "P&L", align: "right" as const, monospace: true, toneKey: "pnlTone" },
];

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
  chartConfig?: ChartConfigSpec,
): ReactElement {
  return createElement(
    ChartContainer,
    {
      theme: resolveTheme(theme),
      mode,
      height,
      width: "100%",
      syncId,
      config: toChartConfig(chartConfig),
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
  _mode?: ChartMode,
  chartConfig?: ChartConfigSpec,
): ReactElement {
  const categories = (data.categories as string[]) ?? [];
  const cells = (data.cells as OpsCell[]) ?? [];

  return createElement(
    ChartSyncGroup,
    null,
    createElement(
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
            slugifySyncId(cell.title),
            chartConfig,
          ),
        ),
      ),
    ),
  );
}

function slugifySyncId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
  const bar = (data.bar as { categories: string[]; values: number[] } | undefined) ?? {
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    values: [72, 78, 81, 76, 79],
  };

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
  const positions =
    (data.positions as typeof DEFAULT_TRADING_POSITIONS | undefined) ??
    DEFAULT_TRADING_POSITIONS;

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
          createElement(CandlestickChart, {
            categories,
            data: ohlc,
            volume,
            brush: true,
            brushEnd: 45,
          }),
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
    createElement(
      "div",
      { style: { marginTop: 16 } },
      createElement(DataTable, {
        columns: TRADING_POSITION_COLUMNS,
        rows: positions,
        surface: "dark",
        compact: true,
        caption: "Open positions",
      }),
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
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 16,
        alignItems: "end",
        maxWidth: 960,
        padding: 16,
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

export function programDashboardTemplate(
  data: Record<string, unknown>,
  theme: ThemeName = "clean",
  mode: ChartMode = "interactive",
): ReactElement {
  const kpis =
    (data.kpis as KpiSpec[]) ?? DEFAULT_PROGRAM_DASHBOARD_DATA.kpis;
  const panels =
    (data.panels as PanelSpec[] | undefined) ??
    PROGRAM_DASHBOARD_PANELS.filter((panel) => panel.type !== "stat");

  return createElement(
    "div",
    {
      style: {
        maxWidth: 900,
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
        }),
      ),
    ),
    createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 12,
          padding: "0 16px 16px",
        },
      },
      ...panels.slice(0, 2).map((panel, index) =>
        createElement(
          "div",
          { key: panel.title ?? `panel-${index}` },
          compilePanel(panel, data, { theme, mode }),
        ),
      ),
    ),
    createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          padding: "0 16px 16px",
        },
      },
      ...panels.slice(2, 4).map((panel, index) =>
        createElement(
          "div",
          { key: panel.title ?? `dist-${index}` },
          compilePanel(panel, data, { theme, mode }),
        ),
      ),
    ),
    createElement(
      "div",
      { style: { padding: "0 16px 16px" } },
      panels[4]
        ? compilePanel(panels[4], data, { theme, mode })
        : null,
    ),
  );
}

const DEFAULT_SRE_KPIS: KpiSpec[] = [
  { value: "18m", label: "MTTR", tone: "warning" },
  { value: "3", label: "Active incidents", tone: "critical" },
  { value: "99.92%", label: "SLO compliance", tone: "success" },
];

const DEFAULT_SRE_ALERTS = [
  {
    service: "payments-api",
    severity: "P1",
    message: "Elevated 5xx rate",
    since: "12m",
    severityTone: "critical" as const,
  },
  {
    service: "checkout-web",
    severity: "P2",
    message: "p95 latency breach",
    since: "34m",
    severityTone: "warning" as const,
  },
  {
    service: "search-index",
    severity: "P3",
    message: "Replication lag",
    since: "1h 12m",
    severityTone: "default" as const,
  },
];

const SRE_ALERT_COLUMNS = [
  { key: "service", label: "Service", monospace: true },
  { key: "severity", label: "Sev" },
  { key: "message", label: "Summary" },
  { key: "since", label: "Since", align: "right" as const, monospace: true },
];

const DEFAULT_SAAS_KPIS: KpiSpec[] = [
  { value: "$284k", label: "MRR", tone: "success" },
  { value: "12.4k", label: "Active users" },
  { value: "2.1%", label: "Churn", tone: "warning" },
];

const DEFAULT_SAAS_FUNNEL = [
  { name: "Visitors", value: 42000 },
  { name: "Signups", value: 8400 },
  { name: "Activated", value: 5100 },
  { name: "Paid", value: 1240 },
];

export function sreIncidentTemplate(
  data: Record<string, unknown>,
  theme: ThemeName = "live",
): ReactElement {
  const kpis = (data.kpis as KpiSpec[]) ?? DEFAULT_SRE_KPIS;
  const categories = (data.categories as string[]) ?? [
    "00:00",
    "04:00",
    "08:00",
    "12:00",
    "16:00",
    "20:00",
    "24:00",
  ];
  const errorRate = (data.errorRate as number[]) ?? [0.8, 1.2, 2.4, 1.8, 3.1, 2.2, 1.4];
  const heatmap = (data.heatmap as Parameters<typeof HeatmapChart>[0]["matrix"]) ?? {
    xCategories: ["api", "web", "worker", "db"],
    yCategories: ["p50", "p95", "p99", "errors"],
    values: [
      [42, 88, 120, 0.4],
      [38, 95, 140, 0.8],
      [55, 110, 180, 1.2],
      [48, 102, 160, 0.6],
    ],
  };
  const alerts = (data.alerts as typeof DEFAULT_SRE_ALERTS | undefined) ?? DEFAULT_SRE_ALERTS;

  return createElement(
    "div",
    {
      style: {
        maxWidth: 820,
        padding: 16,
        background: "#0f172a",
        borderRadius: 8,
        border: "1px solid #334155",
      },
    },
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
          surface: "dark",
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
          180,
          createElement(LineChart, {
            categories,
            series: [{ name: "Error rate", data: errorRate, tone: "critical" }],
            fill: true,
            valueSuffix: "%",
          }),
          "error-rate",
        ),
      ),
    ),
    createElement(
      "div",
      { style: { marginTop: 16 } },
      shell(
        theme,
        "interactive",
        200,
        createElement(HeatmapChart, { matrix: heatmap }),
      ),
    ),
    createElement(
      "div",
      { style: { marginTop: 16 } },
      createElement(DataTable, {
        columns: SRE_ALERT_COLUMNS,
        rows: alerts,
        surface: "dark",
        compact: true,
        caption: "Open incidents",
      }),
    ),
  );
}

export function saasGrowthTemplate(
  data: Record<string, unknown>,
  theme: ThemeName = "clean",
): ReactElement {
  const kpis = (data.kpis as KpiSpec[]) ?? DEFAULT_SAAS_KPIS;
  const categories = (data.categories as string[]) ?? [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
  ];
  const signups = (data.signups as number[]) ?? [820, 932, 901, 1034, 1290, 1330];
  const funnel = (data.funnel as Parameters<typeof FunnelChart>[0]["stages"]) ?? DEFAULT_SAAS_FUNNEL;
  const weekly = data.weekly as { categories: string[]; values: number[] } | undefined;

  return createElement(
    "div",
    {
      style: {
        maxWidth: 760,
        padding: 16,
        background: "#ffffff",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
      },
    },
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
          gridTemplateColumns: "1.4fr 1fr",
          gap: 16,
        },
      },
      shell(
        theme,
        "interactive",
        200,
        createElement(AreaChart, {
          categories,
          series: [{ name: "Signups", data: signups, tone: "success" }],
        }),
      ),
      shell(
        theme,
        "interactive",
        200,
        createElement(FunnelChart, { stages: funnel }),
      ),
    ),
    weekly
      ? createElement(
          "div",
          { style: { marginTop: 16 } },
          shell(
            theme,
            "interactive",
            140,
            createElement(BarChart, {
              categories: weekly.categories,
              series: [{ name: "MRR", data: weekly.values }],
              showValues: true,
              valueSuffix: "k",
            }),
          ),
        )
      : null,
  );
}

function registerBuiltinTemplates(): void {
  registerBuiltinDashboardTemplate({
    id: "finance-pnl",
    label: "Finance P&L",
    vertical: "finance",
    render: (data, theme) => financePnlTemplate(data, theme),
  });
  registerBuiltinDashboardTemplate({
    id: "ops-2x2",
    label: "Ops 2×2",
    vertical: "ops",
    render: (data, theme, mode, chartConfig) =>
      ops2x2Template(data, theme, mode, chartConfig),
  });
  registerBuiltinDashboardTemplate({
    id: "line-overview",
    label: "Line overview",
    vertical: "saas",
    render: (data, theme) => lineOverviewTemplate(data, theme),
  });
  registerBuiltinDashboardTemplate({
    id: "capacity-grid",
    label: "Capacity grid",
    vertical: "resources",
    render: (data, theme) => capacityGridTemplate(data, theme),
  });
  registerBuiltinDashboardTemplate({
    id: "trading-blotter",
    label: "Trading blotter",
    vertical: "trading",
    render: (data, theme) => tradingBlotterTemplate(data, theme),
  });
  registerBuiltinDashboardTemplate({
    id: "plugins-wall",
    label: "Plugins wall",
    vertical: "plugins",
    render: (data, theme, mode) => pluginsWallTemplate(data, theme, mode),
  });
  registerBuiltinDashboardTemplate({
    id: "program-dashboard",
    label: "Program dashboard",
    vertical: "program",
    render: (data, theme, mode) => programDashboardTemplate(data, theme, mode),
  });
  registerBuiltinDashboardTemplate({
    id: "sre-incident",
    label: "SRE incident",
    vertical: "sre",
    render: (data, theme) => sreIncidentTemplate(data, theme),
  });
  registerBuiltinDashboardTemplate({
    id: "saas-growth",
    label: "SaaS growth",
    vertical: "saas",
    render: (data, theme) => saasGrowthTemplate(data, theme),
  });
}

registerBuiltinTemplates();

export type TemplateCompileOptions = {
  theme?: ThemeName;
  mode?: ChartMode;
  chartConfig?: ChartConfigSpec;
};

export function compileTemplate(
  template: TemplateId,
  data: Record<string, unknown>,
  options: TemplateCompileOptions = {},
): ReactElement {
  const theme = options.theme ?? (data.theme as ThemeName | undefined) ?? "clean";
  const render = getTemplateRenderer(template);
  if (!render) {
    throw new Error(`[AxiCharts] Unknown dashboard template "${template}"`);
  }
  return render(data, theme, options.mode, options.chartConfig);
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
      chartConfig: spec.chartConfig,
    }),
  );
}

export function listTemplates(): TemplateId[] {
  return listRegisteredTemplates() as TemplateId[];
}
