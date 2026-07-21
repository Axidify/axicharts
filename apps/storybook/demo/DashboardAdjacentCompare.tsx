import { Fragment, useMemo, type ReactElement } from "react";
import { compilePanel, type PanelSpec } from "@axicharts/charts-spec";
import {
  CalendarHeatmapChart,
  ChartContainer,
  FunnelChart,
  HeatmapChart,
  WaterfallChart,
  type CalendarHeatmapData,
  type HeatmapMatrix,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";
import deviceTableSpec from "../../../packages/charts-spec/examples/device-readings-table.panel.json";
import kpiSuccessSpec from "../../../packages/charts-spec/examples/kpi-success-rate.panel.json";

export const DASHBOARD_TILE_W = 360;
export const DASHBOARD_TILE_H = 280;

const KPI_STRIP = [
  {
    id: "devices",
    value: "4",
    label: "Devices",
    delta: "+1",
    deltaDirection: "up" as const,
    tone: "neutral" as const,
  },
  {
    id: "warnings",
    value: "1",
    label: "Warnings",
    delta: "0",
    deltaDirection: "neutral" as const,
    tone: "warning" as const,
  },
  {
    id: "avg-temp",
    value: "27.0",
    unit: "°C",
    label: "Avg temp",
    delta: "-1.2°C",
    deltaDirection: "down" as const,
    tone: "neutral" as const,
  },
  {
    id: "peak-temp",
    value: "31.7",
    unit: "°C",
    label: "Peak temp",
    delta: "+4.1°C",
    deltaDirection: "up" as const,
    tone: "warning" as const,
  },
];

const TABLE_ROWS = [
  { device: "DEV001", temp: "24.8", battery: "95%", status: "Online" },
  { device: "DEV002", temp: "25.4", battery: "91%", status: "Online" },
  { device: "DEV003", temp: "31.7", battery: "18%", status: "Warning" },
  { device: "DEV004", temp: "26.1", battery: "87%", status: "Online" },
  { device: "DEV005", temp: "28.9", battery: "72%", status: "Online" },
  { device: "DEV006", temp: "30.2", battery: "64%", status: "Warning" },
  { device: "DEV007", temp: "23.6", battery: "98%", status: "Online" },
  { device: "DEV008", temp: "27.8", battery: "81%", status: "Online" },
];

const FUNNEL_STAGES = [
  { name: "Leads", value: 240, tone: "info" as const },
  { name: "Qualified", value: 160 },
  { name: "Proposal", value: 92, tone: "warning" as const },
  { name: "Won", value: 48, tone: "success" as const },
];

const WATERFALL_ITEMS = [
  { name: "Q1", value: 1100, isTotal: true },
  { name: "New ARR", value: 240 },
  { name: "Expansion", value: 120 },
  { name: "Churn", value: -80, tone: "critical" as const },
  { name: "Services", value: 50 },
  { name: "Q2", value: 1330, isTotal: true },
];

const HEATMAP_MATRIX: HeatmapMatrix = {
  xCategories: ["9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p"],
  yCategories: ["Web", "API", "Jobs", "DB"],
  values: [
    [0.42, 0.55, 0.61, 0.58, 0.49, 0.44, 0.38, 0.35],
    [0.28, 0.36, 0.52, 0.64, 0.71, 0.68, 0.55, 0.41],
    [0.18, 0.22, 0.31, 0.38, 0.42, 0.39, 0.33, 0.27],
    [0.12, 0.15, 0.21, 0.29, 0.34, 0.31, 0.26, 0.19],
  ],
};

function buildCalendarQuarter(): CalendarHeatmapData {
  const points: { date: string; value: number }[] = [];
  const end = new Date(2026, 6, 18);

  for (let index = 89; index >= 0; index -= 1) {
    const date = new Date(end);
    date.setDate(end.getDate() - index);
    points.push({
      date: date.toISOString().slice(0, 10),
      value: (index * 7 + 3) % 12,
    });
  }

  return {
    range: [points[0]!.date, points.at(-1)!.date] as [string, string],
    points,
  };
}

const CALENDAR_QUARTER = buildCalendarQuarter();

const GITHUB_ACTIVITY_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

function calendarActivityColor(value: number): string {
  if (value < 0) return "#f8fafc";
  if (value === 0) return GITHUB_ACTIVITY_COLORS[0]!;
  const level = Math.min(4, Math.ceil((value / 11) * 4));
  return GITHUB_ACTIVITY_COLORS[level]!;
}

function buildCalendarWeeks(data: CalendarHeatmapData): {
  weeks: Array<Array<{ date: string; value: number }>>;
  monthLabels: Array<{ label: string; weekIndex: number }>;
} {
  const valueByDate = new Map(data.points.map((point) => [point.date, point.value]));
  const rangeStart = data.range?.[0] ?? data.points[0]!.date;
  const rangeEnd = data.range?.[1] ?? data.points.at(-1)!.date;
  const cursor = new Date(`${rangeStart}T12:00:00`);
  const end = new Date(`${rangeEnd}T12:00:00`);
  cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7));

  const weeks: Array<Array<{ date: string; value: number }>> = [];
  const monthLabels: Array<{ label: string; weekIndex: number }> = [];
  let lastMonth = "";

  while (cursor <= end || weeks.length < 13) {
    if (cursor.getDate() <= 7) {
      const month = cursor.toLocaleString("en-US", { month: "short" });
      if (month !== lastMonth) {
        monthLabels.push({ label: month, weekIndex: weeks.length });
        lastMonth = month;
      }
    }

    const week: Array<{ date: string; value: number }> = [];
    for (let day = 0; day < 7; day += 1) {
      const iso = cursor.toISOString().slice(0, 10);
      const inRange = iso >= rangeStart && iso <= rangeEnd;
      week.push({
        date: iso,
        value: inRange ? (valueByDate.get(iso) ?? 0) : -1,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    if (cursor > end && weeks.length >= 13) break;
  }

  return { weeks, monthLabels };
}

function compactCurrency(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) {
    return `$${(value / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`;
  }
  return `$${value}`;
}

type DashboardCase = {
  id: string;
  title: string;
  designId: string;
  height: number;
  axi: ReactElement;
  reference: ReactElement;
};

function Tile({
  children,
  height,
}: {
  children: ReactElement;
  height: number;
}): ReactElement {
  return (
    <div
      style={{
        width: DASHBOARD_TILE_W,
        height,
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        background: "#ffffff",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

function ColumnLabel({
  tone,
  children,
}: {
  tone: "axi" | "reference";
  children: string;
}): ReactElement {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        marginBottom: 8,
        color: tone === "axi" ? "#2563eb" : "#64748b",
      }}
    >
      {children}
    </div>
  );
}

function TremorKpiReference({
  value,
  unit,
  label,
  delta,
  deltaDirection,
  tone = "neutral",
}: {
  value: string;
  unit?: string;
  label: string;
  delta?: string;
  deltaDirection?: "up" | "down" | "neutral";
  tone?: "neutral" | "success" | "warning";
}): ReactElement {
  const valueColor =
    tone === "success" ? "#16a34a" : tone === "warning" ? "#d97706" : "#0f172a";
  const chip =
    deltaDirection === "up"
      ? { bg: "#ecfdf5", color: "#15803d" }
      : deltaDirection === "down"
        ? { bg: "#fff7ed", color: "#c2410c" }
        : { bg: "#f1f5f9", color: "#64748b" };

  return (
    <div style={{ padding: "10px 12px", height: "100%", boxSizing: "border-box" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 3, minWidth: 0 }}>
          <span style={{ fontSize: 17, fontWeight: 600, color: valueColor, lineHeight: 1.15 }}>
            {value}
          </span>
          {unit ? (
            <span style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>{unit}</span>
          ) : null}
        </div>
        {delta ? (
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: 999,
              background: chip.bg,
              color: chip.color,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              flexShrink: 0,
            }}
          >
            {delta}
          </span>
        ) : null}
      </div>
      <div style={{ marginTop: 2, fontSize: 10, color: "#64748b" }}>{label}</div>
    </div>
  );
}

function TremorTableReference({
  rows,
  height,
}: {
  rows: typeof TABLE_ROWS;
  height: number;
}): ReactElement {
  return (
    <div
      style={{
        height,
        overflow: "auto",
        fontSize: 11,
        color: "#0f172a",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr>
            {["Device ID", "Temp °C", "Battery", "Status"].map((label, index) => (
              <th
                key={label}
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  textAlign: index > 0 && index < 3 ? "right" : "left",
                  padding: "5px 8px",
                  fontWeight: 600,
                  color: "#64748b",
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.device}
              style={{
                background: index % 2 === 1 ? "#f8fafc" : "#ffffff",
              }}
            >
              <td
                style={{
                  padding: "5px 8px",
                  borderBottom: "1px solid #e2e8f0",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                {row.device}
              </td>
              <td
                style={{
                  padding: "5px 8px",
                  borderBottom: "1px solid #e2e8f0",
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                {row.temp}
              </td>
              <td
                style={{
                  padding: "5px 8px",
                  borderBottom: "1px solid #e2e8f0",
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                {row.battery}
              </td>
              <td
                style={{
                  padding: "5px 8px",
                  borderBottom: "1px solid #e2e8f0",
                  color: row.status === "Warning" ? "#d97706" : "#0f172a",
                }}
              >
                {row.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const FUNNEL_COLORS = ["#2563eb", "#3b82f6", "#d97706", "#16a34a"];

function FunnelReference({ stages }: { stages: typeof FUNNEL_STAGES }): ReactElement {
  const max = Math.max(...stages.map((stage) => stage.value));

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 3,
        padding: "8px 12px",
        boxSizing: "border-box",
      }}
    >
      {stages.map((stage, index) => {
        const widthPct = 40 + (stage.value / max) * 56;
        return (
          <div
            key={stage.name}
            style={{
              alignSelf: "center",
              width: `${widthPct}%`,
              minHeight: 44,
              background: FUNNEL_COLORS[index % FUNNEL_COLORS.length],
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f8fafc",
              fontSize: 10,
              fontWeight: 600,
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {stage.name}
            <br />
            {Math.round((stage.value / stages.reduce((s, x) => s + x.value, 0)) * 100)}%
          </div>
        );
      })}
    </div>
  );
}

function WaterfallReference({
  items,
}: {
  items: typeof WATERFALL_ITEMS;
}): ReactElement {
  let running = 0;
  const segments = items.map((item) => {
    const start = item.isTotal ? 0 : running;
    const end = item.isTotal ? item.value : running + item.value;
    if (!item.isTotal) running += item.value;
    return { ...item, start, end };
  });
  const max = Math.max(...segments.map((item) => item.end));
  const min = Math.min(0, ...segments.map((item) => item.end));
  const span = max - min || 1;

  return (
    <div style={{ height: "100%", padding: "12px 8px 24px", boxSizing: "border-box" }}>
      <div
        style={{
          position: "relative",
          height: "100%",
          display: "grid",
          gridTemplateColumns: `repeat(${items.length}, 1fr)`,
          gap: 4,
          alignItems: "end",
        }}
      >
        {segments.map((item) => {
          const bottom = ((item.start - min) / span) * 100;
          const height = ((item.end - item.start) / span) * 100;
          const color = item.isTotal
            ? "#334155"
            : item.tone === "critical"
              ? "#dc2626"
              : item.value > 0
                ? "#16a34a"
                : "#dc2626";
          return (
            <div key={item.name} style={{ position: "relative", height: "100%" }}>
              <div
                style={{
                  position: "absolute",
                  left: "12%",
                  right: "12%",
                  bottom: `${bottom}%`,
                  height: `${Math.max(height, 6)}%`,
                  background: color,
                  borderRadius: item.isTotal ? 4 : "4px 4px 0 0",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -18,
                  left: 0,
                  right: 0,
                  fontSize: 9,
                  textAlign: "center",
                  color: "#64748b",
                  transform: "rotate(-25deg)",
                  transformOrigin: "top center",
                }}
              >
                {item.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HeatmapReference({ matrix }: { matrix: HeatmapMatrix }): ReactElement {
  const flat = matrix.values.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);

  const color = (value: number) => {
    const t = (value - min) / (max - min || 1);
    const r = Math.round(239 - t * 120);
    const g = Math.round(246 - t * 60);
    const b = Math.round(255 - t * 140);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div style={{ padding: "10px 8px 28px", height: "100%", boxSizing: "border-box" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `56px repeat(${matrix.xCategories.length}, 1fr)`,
          gap: 2,
          fontSize: 9,
          color: "#64748b",
        }}
      >
        <div />
        {matrix.xCategories.map((label) => (
          <div key={label} style={{ textAlign: "center" }}>
            {label}
          </div>
        ))}
        {matrix.yCategories.map((row, rowIndex) => (
          <Fragment key={row}>
            <div style={{ alignSelf: "center" }}>{row}</div>
            {matrix.values[rowIndex]!.map((value, colIndex) => (
              <div
                key={`${row}-${colIndex}`}
                style={{
                  aspectRatio: "1",
                  borderRadius: 2,
                  background: color(value),
                }}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function CalendarReference({ data }: { data: CalendarHeatmapData }): ReactElement {
  const { weeks, monthLabels } = buildCalendarWeeks(data);
  const weekdayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div
      style={{
        height: "100%",
        padding: "10px 8px 24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `18px repeat(${weeks.length}, 1fr)`,
          gap: 2,
          marginBottom: 4,
          fontSize: 8,
          color: "#64748b",
        }}
      >
        <div />
        {weeks.map((_, weekIndex) => {
          const month = monthLabels.find((item) => item.weekIndex === weekIndex);
          return (
            <div key={`month-${weekIndex}`} style={{ textAlign: "left" }}>
              {month?.label ?? ""}
            </div>
          );
        })}
      </div>
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: `18px repeat(${weeks.length}, 1fr)`,
          gridTemplateRows: "repeat(7, 1fr)",
          gap: 2,
          alignItems: "stretch",
        }}
      >
        {weekdayLabels.map((label, rowIndex) => (
          <div
            key={`wd-${label}-${rowIndex}`}
            style={{
              fontSize: 8,
              color: "#64748b",
              display: "flex",
              alignItems: "center",
            }}
          >
            {rowIndex % 2 === 0 ? label : ""}
          </div>
        ))}
        {weeks.flatMap((week, weekIndex) =>
          week.map((day, rowIndex) => (
            <div
              key={`${day.date}-${weekIndex}-${rowIndex}`}
              style={{
                borderRadius: 2,
                background: calendarActivityColor(day.value),
                border: day.value < 0 ? "1px solid #f1f5f9" : "none",
                minHeight: 0,
              }}
            />
          )),
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          marginTop: 6,
        }}
      >
        {GITHUB_ACTIVITY_COLORS.map((color) => (
          <div
            key={color}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: color,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function buildDashboardCases(): DashboardCase[] {
  return [
    {
      id: "kpi-strip-72",
      title: "KPI strip — delta chips @ 72px",
      designId: "D-106",
      height: 72,
      axi: (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            width: DASHBOARD_TILE_W,
            height: 72,
          }}
        >
          {KPI_STRIP.map((kpi) => (
            <div key={kpi.id} style={{ minWidth: 0, borderRight: "1px solid #f1f5f9" }}>
              {compilePanel(
                {
                  type: "stat",
                  theme: "clean",
                  props: {
                    value: kpi.value,
                    unit: kpi.unit,
                    label: kpi.label,
                    delta: kpi.delta,
                    deltaDirection: kpi.deltaDirection,
                    tone: kpi.tone,
                    surface: "light",
                  },
                } satisfies PanelSpec,
                [],
                { height: 72 },
              )}
            </div>
          ))}
        </div>
      ),
      reference: (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            width: DASHBOARD_TILE_W,
            height: 72,
          }}
        >
          {KPI_STRIP.map((kpi) => (
            <div key={kpi.id} style={{ borderRight: "1px solid #f1f5f9" }}>
              <TremorKpiReference {...kpi} />
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "kpi-hero-120",
      title: "KPI — value + unit + delta @ 120px",
      designId: "D-106",
      height: 120,
      axi: (
        <div style={{ width: 200, height: 120 }}>
          {compilePanel(kpiSuccessSpec as PanelSpec, [], { height: 120, width: 200 })}
        </div>
      ),
      reference: (
        <div style={{ width: 200, height: 120 }}>
          <TremorKpiReference
            value="99.2"
            unit="%"
            label="Success rate"
            delta="+0.4%"
            deltaDirection="up"
            tone="success"
          />
        </div>
      ),
    },
    {
      id: "table-compact-320",
      title: "Table — zebra + sticky header @ 320px",
      designId: "D-107",
      height: 320,
      axi: (
        <div style={{ width: DASHBOARD_TILE_W, height: 320 }}>
          {compilePanel(deviceTableSpec as PanelSpec, TABLE_ROWS, {
            height: 320,
            width: DASHBOARD_TILE_W,
          })}
        </div>
      ),
      reference: (
        <div style={{ width: DASHBOARD_TILE_W, height: 320 }}>
          <TremorTableReference rows={TABLE_ROWS} height={320} />
        </div>
      ),
    },
    {
      id: "funnel-pipeline-280",
      title: "Funnel — pipeline stages @ 280px",
      designId: "D-220",
      height: DASHBOARD_TILE_H,
      axi: (
        <div style={{ width: DASHBOARD_TILE_W, height: DASHBOARD_TILE_H }}>
          <ChartContainer theme={cleanTheme} width={DASHBOARD_TILE_W} height={DASHBOARD_TILE_H}>
            <FunnelChart stages={FUNNEL_STAGES} />
          </ChartContainer>
        </div>
      ),
      reference: (
        <div style={{ width: DASHBOARD_TILE_W, height: DASHBOARD_TILE_H }}>
          <FunnelReference stages={FUNNEL_STAGES} />
        </div>
      ),
    },
    {
      id: "waterfall-bridge-280",
      title: "Waterfall — ARR bridge @ 280px",
      designId: "D-221",
      height: DASHBOARD_TILE_H,
      axi: (
        <div style={{ width: DASHBOARD_TILE_W, height: DASHBOARD_TILE_H }}>
          <ChartContainer theme={cleanTheme} width={DASHBOARD_TILE_W} height={DASHBOARD_TILE_H}>
            <WaterfallChart
              items={WATERFALL_ITEMS}
              valueFormat={compactCurrency}
              showLabels
              showSigns
              connectorStyle="dashed"
            />
          </ChartContainer>
        </div>
      ),
      reference: (
        <div style={{ width: DASHBOARD_TILE_W, height: DASHBOARD_TILE_H }}>
          <WaterfallReference items={WATERFALL_ITEMS} />
        </div>
      ),
    },
    {
      id: "heatmap-services-280",
      title: "Heatmap — service load @ 280px",
      designId: "D-222",
      height: DASHBOARD_TILE_H,
      axi: (
        <div style={{ width: DASHBOARD_TILE_W, height: DASHBOARD_TILE_H }}>
          <ChartContainer theme={cleanTheme} width={DASHBOARD_TILE_W} height={DASHBOARD_TILE_H}>
            <HeatmapChart matrix={HEATMAP_MATRIX} min={0} max={1} showLabels />
          </ChartContainer>
        </div>
      ),
      reference: (
        <div style={{ width: DASHBOARD_TILE_W, height: DASHBOARD_TILE_H }}>
          <HeatmapReference matrix={HEATMAP_MATRIX} />
        </div>
      ),
    },
    {
      id: "calendar-activity-280",
      title: "Calendar heatmap — 90-day activity @ 280px",
      designId: "D-223",
      height: DASHBOARD_TILE_H,
      axi: (
        <div style={{ width: DASHBOARD_TILE_W, height: DASHBOARD_TILE_H }}>
          <ChartContainer theme={cleanTheme} width={DASHBOARD_TILE_W} height={DASHBOARD_TILE_H}>
            <CalendarHeatmapChart data={CALENDAR_QUARTER} />
          </ChartContainer>
        </div>
      ),
      reference: (
        <div style={{ width: DASHBOARD_TILE_W, height: DASHBOARD_TILE_H }}>
          <CalendarReference data={CALENDAR_QUARTER} />
        </div>
      ),
    },
  ];
}

function DashboardRow({ item }: { item: DashboardCase }): ReactElement {
  return (
    <section
      id={`dashboard-${item.id}`}
      style={{
        paddingBottom: 24,
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "#0f172a" }}>
        {item.title}
        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 500, color: "#94a3b8" }}>
          {item.designId}
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(2, minmax(${DASHBOARD_TILE_W}px, 1fr))`,
          gap: 16,
          alignItems: "start",
        }}
      >
        <div>
          <ColumnLabel tone="axi">AxiCharts</ColumnLabel>
          <Tile height={item.height}>{item.axi}</Tile>
        </div>
        <div>
          <ColumnLabel tone="reference">Tremor-style reference</ColumnLabel>
          <Tile height={item.height}>{item.reference}</Tile>
        </div>
      </div>
    </section>
  );
}

export function DashboardAdjacentCompare(): ReactElement {
  const cases = useMemo(() => buildDashboardCases(), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h2 style={{ margin: "0 0 8px", fontSize: 18, color: "#0f172a" }}>
          Lane B — dashboard-adjacent charts
        </h2>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "#64748b" }}>
          Tremor / IBCS / GitHub-style references — same tile density and chrome as SaaS
          dashboards @ <strong>360×280</strong> (KPI/table) or type-appropriate heights. Not
          Recharts parity; judged on compact typography, scanability, and domain marks.
        </p>
      </div>
      {cases.map((item) => (
        <DashboardRow key={item.id} item={item} />
      ))}
    </div>
  );
}
