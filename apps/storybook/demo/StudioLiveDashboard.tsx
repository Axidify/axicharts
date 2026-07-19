import type { CSSProperties, ReactElement } from "react";
import {
  Bar,
  BarChart,
  ChartContainer,
  Line,
  LineChart,
  Stat,
  useChartScales,
  XAxis,
  YAxis,
} from "@axicharts/charts";
import { StudioBarChart, StudioLineChart } from "@axicharts/charts/studio";
import { cleanTheme, liveTheme, studioTheme } from "@axicharts/charts-theme";
import { DAYS, useLiveSeries } from "../stories/utils/liveSeries";

const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6"];
const SIGNUPS = [1240, 1380, 1520, 1490, 1680, 1820];
const REVENUE = [42, 48, 51, 47, 55, 58];
const TARGET = [40, 44, 48, 50, 52, 54];
const DEPLOYS = [8, 12, 9, 14, 11, 16];

const PLAN_ROWS = [
  { plan: "Starter", mrr: 12 },
  { plan: "Pro", mrr: 28 },
  { plan: "Team", mrr: 41 },
  { plan: "Enterprise", mrr: 19 },
];

const PAGE: CSSProperties = {
  maxWidth: 1080,
  margin: "0 auto",
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  color: "#0f172a",
};

const SHELL: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  background: "#f8fafc",
  boxShadow: "0 16px 48px rgba(15, 23, 42, 0.08)",
  overflow: "hidden",
};

const CARD: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  background: "#ffffff",
  padding: 14,
  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
};

const SECTION_LABEL: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: 10,
};

function LiveBadge(): ReactElement {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 999,
        background: "#ecfdf5",
        color: "#047857",
        border: "1px solid #a7f3d0",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#10b981",
          animation: "studioDashPulse 1.8s ease-in-out infinite",
        }}
      />
      Live · 5 Hz
    </span>
  );
}

function SvgBadge(): ReactElement {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 999,
        background: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
      }}
    >
      Studio SVG
    </span>
  );
}

function LiveKpi({
  label,
  value,
  suffix,
  data,
  tone,
}: {
  label: string;
  value: string;
  suffix?: string;
  data: number[];
  tone?: "default" | "success" | "warning" | "critical";
}): ReactElement {
  return (
    <div style={CARD}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
        <span
          style={{
            fontSize: 18,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
            color: "#0f172a",
          }}
        >
          {value}
          {suffix ? (
            <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 2 }}>
              {suffix}
            </span>
          ) : null}
        </span>
      </div>
      <ChartContainer
        theme={cleanTheme}
        mode="live"
        height={48}
        width="100%"
        debounceMs={16}
      >
        <LineChart
          categories={DAYS}
          series={[{ name: label, data, tone }]}
          fill
          showAxes={false}
        />
      </ChartContainer>
    </div>
  );
}

function TargetDot({
  index,
  value,
}: {
  index: number;
  value: number;
}): ReactElement {
  const { xAt, yAt } = useChartScales();
  return (
    <circle
      cx={xAt(index)}
      cy={yAt(value)}
      r={5}
      fill="#ffffff"
      stroke="#2563eb"
      strokeWidth={2}
    />
  );
}

function CustomTargetChart(): ReactElement {
  const rows = WEEKS.map((week, index) => ({
    week,
    actual: REVENUE[index]!,
    target: TARGET[index]!,
  }));

  return (
    <ChartContainer theme={studioTheme} mode="static" height={200} width="100%">
      <LineChart data={rows}>
        <XAxis dataKey="week" />
        <YAxis tickFormat="currency" />
        <Line
          dataKey="target"
          name="Target"
          tone="info"
          renderPath={({ defaultPath, color }) => (
            <path
              d={defaultPath}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              opacity={0.7}
            />
          )}
        />
        <Line
          dataKey="actual"
          name="Actual"
          renderPath={({ defaultPath, color, series }) => (
            <>
              <defs>
                <linearGradient
                  id="dash-actual-stroke"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={color} />
                </linearGradient>
              </defs>
              <path
                d={defaultPath}
                fill="none"
                stroke="url(#dash-actual-stroke)"
                strokeWidth={2.75}
                strokeLinecap="round"
              />
              {series.data.map((value, index) => (
                <TargetDot key={index} index={index} value={value} />
              ))}
            </>
          )}
        />
      </LineChart>
    </ChartContainer>
  );
}

function CustomDeployBars(): ReactElement {
  const rows = WEEKS.map((week, index) => ({
    week,
    deploys: DEPLOYS[index]!,
  }));

  return (
    <ChartContainer theme={studioTheme} mode="static" height={180} width="100%">
      <BarChart data={rows}>
        <XAxis dataKey="week" />
        <YAxis />
        <Bar
          dataKey="deploys"
          name="Deploys"
          renderBar={({ bar, color }) => (
            <>
              <defs>
                <linearGradient
                  id="dash-deploy-bar"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
                  <stop offset="35%" stopColor={color} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill="url(#dash-deploy-bar)"
                rx={8}
              />
            </>
          )}
        />
      </BarChart>
    </ChartContainer>
  );
}

export function StudioLiveDashboard(): ReactElement {
  const latency = useLiveSeries([42, 38, 55, 49, 62, 58, 71], 5);
  const requests = useLiveSeries([820, 910, 880, 1020, 980, 1100, 1050], 5);
  const errors = useLiveSeries([1.2, 0.9, 1.8, 1.1, 2.4, 1.6, 1.3], 5);
  const cpu = useLiveSeries([34, 38, 41, 39, 44, 42, 40], 5);

  const latencyNow = latency[latency.length - 1] ?? 0;
  const requestsNow = requests[requests.length - 1] ?? 0;
  const errorsNow = errors[errors.length - 1] ?? 0;
  const cpuNow = cpu[cpu.length - 1] ?? 0;
  const sloBreached = latencyNow > 65;

  return (
    <div style={PAGE} data-theme="studio">
      <style>{`
        @keyframes studioDashPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.88); }
        }
      `}</style>

      <div style={SHELL}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            padding: "14px 18px",
            borderBottom: "1px solid #e2e8f0",
            background: "#ffffff",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Product &amp; Ops
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>
              Live canvas + studio SVG custom marks
            </p>
          </div>
          <span style={{ flex: 1 }} />
          <LiveBadge />
          <SvgBadge />
        </header>

        <div style={{ padding: 16, display: "grid", gap: 20 }}>
          <section>
            <div style={{ ...SECTION_LABEL, color: "#047857" }}>
              Realtime · canvas
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <LiveKpi
                label="p95 latency"
                value={latencyNow.toFixed(0)}
                suffix="ms"
                data={latency}
                tone={sloBreached ? "warning" : "default"}
              />
              <LiveKpi
                label="Requests"
                value={`${(requestsNow / 1000).toFixed(1)}k`}
                data={requests}
                tone="success"
              />
              <LiveKpi
                label="Error rate"
                value={errorsNow.toFixed(1)}
                suffix="%"
                data={errors}
                tone={errorsNow > 2 ? "warning" : "default"}
              />
              <LiveKpi
                label="CPU"
                value={cpuNow.toFixed(0)}
                suffix="%"
                data={cpu}
              />
            </div>

            <div style={CARD}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  API p95 latency
                </span>
                {sloBreached ? (
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "#fff7ed",
                      color: "#c2410c",
                      border: "1px solid #fed7aa",
                    }}
                  >
                    Above SLO
                  </span>
                ) : null}
              </div>
              <ChartContainer
                theme={liveTheme}
                mode="live"
                height={200}
                width="100%"
                debounceMs={16}
              >
                <LineChart
                  categories={DAYS}
                  series={[{ name: "p95", data: latency, tone: "info" }]}
                  fill
                  valueSuffix=" ms"
                  referenceLines={[
                    { value: 65, label: "SLO 65ms", tone: "warning" },
                  ]}
                />
              </ChartContainer>
            </div>
          </section>

          <section>
            <div style={{ ...SECTION_LABEL, color: "#1d4ed8" }}>
              Studio analytics · static SVG
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div style={CARD}>
                <StudioLineChart
                  title="Weekly signups"
                  labels={WEEKS}
                  data={SIGNUPS}
                  height={200}
                  name="signups"
                />
              </div>
              <div style={CARD}>
                <StudioBarChart
                  title="MRR by plan ($k)"
                  labels={PLAN_ROWS.map((r) => r.plan)}
                  data={PLAN_ROWS.map((r) => r.mrr)}
                  height={200}
                  name="mrr"
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 0.8fr",
                gap: 12,
              }}
            >
              <div style={CARD}>
                <h3
                  style={{
                    margin: "0 0 10px",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Revenue vs target
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 500,
                      color: "#64748b",
                    }}
                  >
                    custom renderPath
                  </span>
                </h3>
                <CustomTargetChart />
              </div>
              <div style={CARD}>
                <h3
                  style={{
                    margin: "0 0 10px",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Deploy cadence
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 500,
                      color: "#64748b",
                    }}
                  >
                    custom renderBar
                  </span>
                </h3>
                <CustomDeployBars />
              </div>
            </div>
          </section>

          <footer
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            <Stat
              value={`${SIGNUPS[SIGNUPS.length - 1]!.toLocaleString()}`}
              label="Signups this week"
              surface="light"
            />
            <Stat
              value={`$${REVENUE[REVENUE.length - 1]}k`}
              label="Revenue run-rate"
              tone="success"
              surface="light"
            />
            <Stat
              value={`${latencyNow.toFixed(0)} ms`}
              label="Live p95"
              tone={sloBreached ? "warning" : "neutral"}
              surface="light"
              stale={sloBreached}
            />
          </footer>
        </div>
      </div>
    </div>
  );
}
