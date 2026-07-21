import { useMemo, type ReactElement } from "react";
import { compilePanel, type PanelSpec } from "@axicharts/charts-spec";
import deviceTableSpec from "../../../packages/charts-spec/examples/device-readings-table.panel.json";
import kpiSuccessSpec from "../../../packages/charts-spec/examples/kpi-success-rate.panel.json";

export const DASHBOARD_TILE_W = 360;

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
          Lane B — KPI &amp; table (dashboard-adjacent)
        </h2>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "#64748b" }}>
          Tremor/shadcn-style reference — same tile density and chrome as SaaS dashboards.
          Not Recharts parity; judged on compact typography, delta chips, and table scanability.
        </p>
      </div>
      {cases.map((item) => (
        <DashboardRow key={item.id} item={item} />
      ))}
    </div>
  );
}
