import {
  Profiler,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import * as echarts from "echarts";
import { ChartContainer, LineChart } from "@axicharts/charts";
import { industrialTheme } from "@axicharts/charts-theme";
import {
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  BENCH_PRESETS,
  FRAME_BUDGET_MS,
  formatMultiplier,
  formatSeriesValue,
  getIsolatedBenchPlan,
  getPanelGridColumns,
  getPanelSpecs,
  isStruggling,
  libraryDisplayName,
  lookupCiReference,
  type BenchPresetId,
  type LiveBenchState,
  type LivePanelState,
  type TimingMetrics,
  useLiveOpsBench,
  useTimingMetrics,
} from "./liveBench";

const CONTROL_STYLE: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#0f172a",
  color: "#e2e8f0",
  fontSize: 12,
};

function PanelShell({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: ReactElement;
}): ReactElement {
  return (
    <div
      style={{
        border: "1px solid #334155",
        borderRadius: 8,
        padding: "8px 10px",
        background: "#0f172a",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
          gap: 8,
        }}
      >
        <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
        <span
          style={{
            fontSize: 11,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            color: "#e2e8f0",
          }}
        >
          {value}
        </span>
      </div>
      {children}
    </div>
  );
}

function AxiPanel({ panel, height }: { panel: LivePanelState; height: number }): ReactElement {
  const last = panel.values[panel.values.length - 1] ?? 0;

  return (
    <PanelShell label={panel.spec.label} value={formatSeriesValue(last)}>
      <ChartContainer
        theme={industrialTheme}
        mode="live"
        height={height}
        width="100%"
      >
        <LineChart
          categories={panel.categories}
          series={[
            {
              name: panel.spec.label,
              data: panel.values,
              tone: panel.spec.tone,
            },
          ]}
          showAxes={false}
          fill
        />
      </ChartContainer>
    </PanelShell>
  );
}

function EChartsPanel({
  panel,
  height,
  width,
}: {
  panel: LivePanelState;
  height: number;
  width: number;
}): ReactElement {
  const last = panel.values[panel.values.length - 1] ?? 0;
  const rootRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const chart = echarts.init(rootRef.current, undefined, {
      renderer: "canvas",
      width,
      height,
    });
    chartRef.current = chart;

    return () => {
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.resize({ width, height });
  }, [width, height]);

  useEffect(() => {
    chartRef.current?.setOption(
      {
        animation: false,
        grid: { left: 0, right: 0, top: 0, bottom: 0 },
        xAxis: { type: "category", data: panel.categories, show: false },
        yAxis: { type: "value", show: false },
        series: [
          {
            type: "line",
            data: panel.values,
            showSymbol: false,
            lineStyle: { width: 2, color: panel.spec.stroke },
          },
        ],
      },
      { notMerge: true },
    );
  }, [panel.categories, panel.values, panel.spec.stroke]);

  return (
    <PanelShell label={panel.spec.label} value={formatSeriesValue(last)}>
      <div ref={rootRef} style={{ width, height }} />
    </PanelShell>
  );
}

function RechartsPanel({
  panel,
  height,
  width,
}: {
  panel: LivePanelState;
  height: number;
  width: number;
}): ReactElement {
  const last = panel.values[panel.values.length - 1] ?? 0;
  const data = panel.categories.map((category, index) => ({
    x: category,
    y: panel.values[index] ?? 0,
  }));

  return (
    <PanelShell label={panel.spec.label} value={formatSeriesValue(last)}>
      <RechartsLineChart width={width} height={height} data={data}>
        <XAxis dataKey="x" hide />
        <YAxis hide domain={["auto", "auto"]} />
        <Line
          type="monotone"
          dataKey="y"
          stroke={panel.spec.stroke}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </RechartsLineChart>
    </PanelShell>
  );
}

function MetricPill({
  label,
  value,
  accent,
  sub,
  warn,
}: {
  label: string;
  value: string;
  accent?: string;
  sub?: string;
  warn?: boolean;
}): ReactElement {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        border: warn ? "1px solid #b45309" : "1px solid #334155",
        background: warn ? "rgba(120, 53, 15, 0.15)" : "#0f172a",
      }}
    >
      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          color: accent ?? "#e2e8f0",
        }}
      >
        {value}
      </div>
      {sub ? (
        <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>{sub}</div>
      ) : null}
    </div>
  );
}

function TimingRow({
  title,
  metrics,
  accent,
  struggling,
  throttleNote,
  footnote,
}: {
  title: string;
  metrics: TimingMetrics;
  accent: string;
  struggling?: boolean;
  throttleNote?: string;
  footnote?: string;
}): ReactElement {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 10,
        border: struggling ? "1px solid #b45309" : "1px solid #334155",
        background: struggling ? "rgba(120, 53, 15, 0.1)" : "#0f172a",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: accent,
          marginBottom: 10,
        }}
      >
        {title}
        {struggling ? (
          <span style={{ marginLeft: 8, color: "#fbbf24", fontWeight: 600 }}>
            · struggling
          </span>
        ) : null}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(72px, 1fr))",
          gap: 8,
        }}
      >
        <MiniStat label="p50" value={`${metrics.p50Ms.toFixed(2)} ms`} />
        <MiniStat label="p95" value={`${metrics.p95Ms.toFixed(2)} ms`} accent={accent} />
        <MiniStat label="max" value={`${metrics.maxMs.toFixed(2)} ms`} />
        <MiniStat label="last" value={`${metrics.frameMs.toFixed(2)} ms`} />
        <MiniStat
          label={`>${FRAME_BUDGET_MS}ms`}
          value={String(metrics.overBudgetFrames)}
          warn={metrics.overBudgetFrames > 0}
        />
        <MiniStat label="samples" value={String(metrics.sampleCount)} />
      </div>
      {throttleNote ? (
        <p style={{ margin: "8px 0 0", fontSize: 10, color: "#fbbf24" }}>{throttleNote}</p>
      ) : null}
      {footnote ? (
        <p style={{ margin: "8px 0 0", fontSize: 10, color: "#64748b" }}>{footnote}</p>
      ) : null}
    </div>
  );
}

function formatRatio(axiP95: number, otherP95: number): string {
  if (axiP95 > 0 && otherP95 > 0) return formatMultiplier(otherP95 / axiP95);
  return "—";
}

function MiniStat({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: string;
  accent?: string;
  warn?: boolean;
}): ReactElement {
  return (
    <div>
      <div style={{ fontSize: 9, color: "#64748b", marginBottom: 2 }}>{label}</div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          color: warn ? "#fbbf24" : accent ?? "#e2e8f0",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export type LiveOpsCompareDemoProps = {
  preset?: BenchPresetId;
  panelCount?: number;
  pointCount?: number;
  hz?: number;
  panelHeight?: number;
  showControls?: boolean;
  autoThrottleRecharts?: boolean;
  /** When true (default), compare AxiCharts vs Recharts vs ECharts. */
  threeWay?: boolean;
};

function resolveBenchConfig(
  presetId: BenchPresetId,
  useCustom: boolean,
  custom: { panelCount: number; pointCount: number; hz: number; panelHeight: number },
  props: Pick<LiveOpsCompareDemoProps, "panelCount" | "pointCount" | "hz" | "panelHeight">,
  showControls: boolean,
): { panelCount: number; pointCount: number; hz: number; panelHeight: number } {
  if (!showControls) {
    const preset = BENCH_PRESETS[presetId];
    return {
      panelCount: props.panelCount ?? preset.panelCount,
      pointCount: props.pointCount ?? preset.pointCount,
      hz: props.hz ?? preset.hz,
      panelHeight: props.panelHeight ?? preset.panelHeight,
    };
  }
  if (useCustom) return custom;
  const preset = BENCH_PRESETS[presetId];
  return {
    panelCount: preset.panelCount,
    pointCount: preset.pointCount,
    hz: preset.hz,
    panelHeight: preset.panelHeight,
  };
}

export function LiveOpsCompareDemo({
  preset: presetProp = "standard",
  panelCount: panelCountProp,
  pointCount: pointCountProp,
  hz: hzProp,
  panelHeight: panelHeightProp,
  showControls = true,
  autoThrottleRecharts: autoThrottleProp = false,
  threeWay = true,
}: LiveOpsCompareDemoProps): ReactElement {
  const [presetId, setPresetId] = useState<BenchPresetId>(presetProp);
  const [customPanelCount, setCustomPanelCount] = useState(
    panelCountProp ?? BENCH_PRESETS[presetProp].panelCount,
  );
  const [customPointCount, setCustomPointCount] = useState(
    pointCountProp ?? BENCH_PRESETS[presetProp].pointCount,
  );
  const [customHz, setCustomHz] = useState(hzProp ?? BENCH_PRESETS[presetProp].hz);
  const [customPanelHeight, setCustomPanelHeight] = useState(
    panelHeightProp ?? BENCH_PRESETS[presetProp].panelHeight,
  );
  const [autoThrottle, setAutoThrottle] = useState(autoThrottleProp);
  const [useCustom, setUseCustom] = useState(false);

  useEffect(() => {
    setPresetId(presetProp);
  }, [presetProp]);

  const { panelCount, pointCount, hz, panelHeight } = resolveBenchConfig(
    presetId,
    useCustom,
    {
      panelCount: customPanelCount,
      pointCount: customPointCount,
      hz: customHz,
      panelHeight: customPanelHeight,
    },
    {
      panelCount: panelCountProp,
      pointCount: pointCountProp,
      hz: hzProp,
      panelHeight: panelHeightProp,
    },
    showControls,
  );

  const panelSpecs = useMemo(() => getPanelSpecs(panelCount), [panelCount]);
  const gridColumns = getPanelGridColumns(panelCount);
  const ciReference = lookupCiReference(panelCount, pointCount);
  const benchPlan = useMemo(
    () => getIsolatedBenchPlan(panelCount, pointCount),
    [panelCount, pointCount],
  );

  const bench = useLiveOpsBench({
    panelCount,
    pointCount,
    hz,
    panelSpecs,
    autoThrottleRecharts: autoThrottle,
    threeWay,
  });

  const {
    metrics: axiMetrics,
    flush: flushAxi,
    reset: resetAxi,
    onProfilerRender: onAxiProfiler,
  } = useTimingMetrics();
  const {
    metrics: rechartsMetrics,
    flush: flushRecharts,
    reset: resetRecharts,
    onProfilerRender: onRechartsProfiler,
  } = useTimingMetrics();
  const {
    metrics: echartsMetrics,
    flush: flushEcharts,
    reset: resetEcharts,
    onProfilerRender: onEchartsProfiler,
  } = useTimingMetrics();

  const configKey = `${panelCount}-${pointCount}-${hz}-${autoThrottle}-${threeWay}`;
  useEffect(() => {
    resetAxi();
    resetRecharts();
    resetEcharts();
  }, [configKey, resetAxi, resetRecharts, resetEcharts]);

  useEffect(() => {
    flushAxi();
    flushRecharts();
    flushEcharts();
  }, [
    bench.axiLive.frameMs,
    bench.rechartsLive.frameMs,
    bench.echartsLive.frameMs,
    flushAxi,
    flushRecharts,
    flushEcharts,
  ]);

  const isolated = bench.isolatedBench;
  const primaryAxiP95 =
    isolated.status === "done" ? isolated.axiP95Ms : bench.axiLive.p95Ms;
  const primaryRechartsP95 =
    isolated.status === "done" ? isolated.rechartsP95Ms : bench.rechartsLive.p95Ms;
  const primaryEchartsP95 =
    isolated.status === "done" ? isolated.echartsP95Ms : bench.echartsLive.p95Ms;
  const rechartsRatioLabel = formatRatio(primaryAxiP95, primaryRechartsP95);
  const echartsRatioLabel = threeWay ? formatRatio(primaryAxiP95, primaryEchartsP95) : "—";

  const rechartsStruggling =
    isStruggling(bench.rechartsLive) || primaryRechartsP95 > FRAME_BUDGET_MS;
  const echartsStruggling =
    threeWay &&
    (isStruggling(bench.echartsLive) || primaryEchartsP95 > FRAME_BUDGET_MS);
  const axiStruggling = isStruggling(bench.axiLive) || primaryAxiP95 > FRAME_BUDGET_MS;

  const panelWidth = Math.max(120, Math.floor((threeWay ? 1080 : 720) / gridColumns) - 24);
  const showAxiColumn =
    bench.calibrationView === "all" || bench.calibrationView === "axicharts";
  const showRechartsColumn =
    bench.calibrationView === "all" || bench.calibrationView === "recharts";
  const showEchartsColumn =
    threeWay &&
    (bench.calibrationView === "all" || bench.calibrationView === "echarts");
  const visibleColumnCount =
    (showAxiColumn ? 1 : 0) + (showRechartsColumn ? 1 : 0) + (showEchartsColumn ? 1 : 0);
  const calibrationLabel = bench.calibrationProgress
    ? `Calibrating ${libraryDisplayName(bench.calibrationProgress.library)} ${bench.calibrationProgress.step}/${bench.calibrationProgress.total}…`
    : bench.calibrating
      ? "Calibrating…"
      : "Re-run calibration";
  const compareTitle = threeWay
    ? "AxiCharts · Recharts · ECharts"
    : "AxiCharts · Recharts";

  return (
    <div style={{ display: "grid", gap: 20, maxWidth: threeWay ? 1440 : 1200 }}>
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 6px", fontSize: 22, color: "#f8fafc" }}>
            Live ops wall — {compareTitle} — {panelCount} panels ×{" "}
            {pointCount.toLocaleString()} pts @ {hz} Hz
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", maxWidth: 760 }}>
            Synthetic load generator drives chart updates — not real CPU/memory telemetry.
            Performance uses the same isolated <code>flushSync</code> methodology as{" "}
            <code>apps/bench-harness</code> when you run calibration (up to{" "}
            {benchPlan.updates} updates per library on this preset). Preset changes start the
            live stream immediately; use <strong>Re-run calibration</strong> for fresh isolated
            numbers. Side-by-side rendering cannot match CI numbers exactly — your device differs
            from headless Chromium 4×.
          </p>
          {ciReference ? (
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#64748b" }}>
              Published CI reference ({ciReference.environment}, {ciReference.panels} ×{" "}
              {ciReference.points} pts): AxiCharts{" "}
              <strong style={{ color: "#60a5fa" }}>{ciReference.axichartsP95Ms} ms</strong> ·
              Recharts{" "}
              <strong style={{ color: "#f87171" }}>{ciReference.rechartsP95Ms} ms</strong>
              {ciReference.echartsP95Ms != null ? (
                <>
                  {" "}
                  · ECharts{" "}
                  <strong style={{ color: "#a78bfa" }}>{ciReference.echartsP95Ms} ms</strong>
                </>
              ) : null}
              {threeWay && ciReference.echartsP95Ms != null && primaryAxiP95 > 0 ? (
                <span style={{ marginLeft: 8 }}>
                  (Recharts {formatRatio(ciReference.axichartsP95Ms, ciReference.rechartsP95Ms)} ·
                  ECharts {formatRatio(ciReference.axichartsP95Ms, ciReference.echartsP95Ms)} vs
                  Axi)
                </span>
              ) : null}
            </p>
          ) : (
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#64748b" }}>
              No published CI fixture for this panel/point count — use measured numbers below.
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={bench.rerunIsolatedBench}
            disabled={bench.calibrating}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #475569",
              background: "#0f172a",
              color: bench.calibrating ? "#64748b" : "#e2e8f0",
              cursor: bench.calibrating ? "not-allowed" : "pointer",
              fontSize: 13,
            }}
          >
            {calibrationLabel}
          </button>
          {bench.calibrating ? (
            <button
              type="button"
              onClick={bench.skipCalibration}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid #b45309",
                background: "rgba(120, 53, 15, 0.2)",
                color: "#fde68a",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Skip calibration
            </button>
          ) : null}
          <button
            type="button"
            onClick={bench.toggle}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #475569",
              background: bench.running ? "#1e293b" : "#0f172a",
              color: "#e2e8f0",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {bench.running ? "Pause stream" : "Resume stream"}
          </button>
        </div>
      </header>

      {showControls ? (
        <ControlsBar
          presetId={presetId}
          useCustom={useCustom}
          customPanelCount={customPanelCount}
          customPointCount={customPointCount}
          customHz={customHz}
          customPanelHeight={customPanelHeight}
          autoThrottle={autoThrottle}
          onPresetChange={(id) => {
            setPresetId(id);
            setUseCustom(false);
            const preset = BENCH_PRESETS[id];
            setCustomPanelCount(preset.panelCount);
            setCustomPointCount(preset.pointCount);
            setCustomHz(preset.hz);
            setCustomPanelHeight(preset.panelHeight);
          }}
          onUseCustom={() => setUseCustom(true)}
          onPanelCount={setCustomPanelCount}
          onPointCount={setCustomPointCount}
          onHz={setCustomHz}
          onPanelHeight={setCustomPanelHeight}
          onAutoThrottle={setAutoThrottle}
        />
      ) : null}

      {bench.calibrating ? (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#94a3b8",
            fontSize: 12,
          }}
        >
          Running isolated benchmark — one library at a time so measurements stay fair.
          {bench.calibrationProgress
            ? ` ${libraryDisplayName(bench.calibrationProgress.library)}: ${bench.calibrationProgress.step}/${bench.calibrationProgress.total} updates.`
            : " Preparing…"}
          {" "}Click <strong>Skip calibration</strong> to jump straight to the live stream.
        </div>
      ) : isolated.status === "pending" ? (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#94a3b8",
            fontSize: 12,
          }}
        >
          Live stream is running. Isolated numbers use live samples until you click{" "}
          <strong>Re-run calibration</strong> ({benchPlan.updates} updates per library, capped at{" "}
          {(benchPlan.maxMsPerLibrary / 1000).toFixed(0)}s each on this preset).
        </div>
      ) : null}

      {rechartsStruggling ? (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #b45309",
            background: "rgba(120, 53, 15, 0.2)",
            color: "#fde68a",
            fontSize: 12,
          }}
        >
          <strong>Recharts exceeding {FRAME_BUDGET_MS}ms frame budget on this device</strong>
          {bench.rechartsThrottled
            ? ` — auto-throttle active (Recharts @ ~${bench.effectiveRechartsHz.toFixed(1)} Hz)`
            : autoThrottle
              ? " — enable auto-throttle to skip Recharts frames when struggling"
              : " — try Heavy or Extreme presets to widen the gap"}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        <MetricPill
          label="Speed ratio (Recharts / Axi)"
          value={rechartsRatioLabel}
          accent="#fbbf24"
          sub={
            isolated.status === "done"
              ? "From isolated calibration on this device"
              : "From live alternating ticks on this device"
          }
        />
        {threeWay ? (
          <MetricPill
            label="Speed ratio (ECharts / Axi)"
            value={echartsRatioLabel}
            accent="#c4b5fd"
            sub={
              isolated.status === "done"
                ? "From isolated calibration on this device"
                : "From live alternating ticks on this device"
            }
          />
        ) : null}
        <MetricPill
          label="AxiCharts p95 (isolated)"
          value={
            isolated.status === "done"
              ? `${isolated.axiP95Ms.toFixed(2)} ms`
              : isolated.status === "running"
                ? "…"
                : primaryAxiP95 > 0
                  ? `${primaryAxiP95.toFixed(2)} ms`
                  : "—"
          }
          accent="#60a5fa"
          sub={
            isolated.status === "done"
              ? `Isolated · ${isolated.updates} updates`
              : `Live estimate · calibrate for ${benchPlan.updates} updates`
          }
        />
        <MetricPill
          label="Recharts p95 (isolated)"
          value={
            isolated.status === "done"
              ? `${isolated.rechartsP95Ms.toFixed(2)} ms`
              : isolated.status === "running"
                ? "…"
                : primaryRechartsP95 > 0
                  ? `${primaryRechartsP95.toFixed(2)} ms`
                  : "—"
          }
          accent="#f87171"
          warn={primaryRechartsP95 > FRAME_BUDGET_MS}
          sub={
            isolated.status === "done"
              ? `Isolated · ${isolated.updates} updates`
              : `Live estimate · calibrate for ${benchPlan.updates} updates`
          }
        />
        {threeWay ? (
          <MetricPill
            label="ECharts p95 (isolated)"
            value={
              isolated.status === "done"
                ? `${isolated.echartsP95Ms.toFixed(2)} ms`
                : isolated.status === "running"
                  ? "…"
                  : primaryEchartsP95 > 0
                    ? `${primaryEchartsP95.toFixed(2)} ms`
                    : "—"
            }
            accent="#a78bfa"
            warn={primaryEchartsP95 > FRAME_BUDGET_MS}
            sub={
              isolated.status === "done"
                ? `Isolated · ${isolated.updates} updates`
                : `Live estimate · calibrate for ${benchPlan.updates} updates`
            }
          />
        ) : null}
        <MetricPill
          label="Active library"
          value={libraryDisplayName(bench.activeLibrary)}
          sub={
            threeWay
              ? "Alternating ticks — one library per update (3-way)"
              : "Alternating ticks — one library per update"
          }
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: threeWay ? "1fr 1fr 1fr" : "1fr 1fr",
          gap: 12,
        }}
      >
        <TimingRow
          title="AxiCharts — live flushSync"
          metrics={bench.axiLive}
          accent="#60a5fa"
          struggling={axiStruggling}
          footnote="Alternating tick samples on this device"
        />
        <TimingRow
          title="Recharts — live flushSync"
          metrics={bench.rechartsLive}
          accent="#f87171"
          struggling={rechartsStruggling}
          throttleNote={
            bench.rechartsThrottled
              ? `Throttled: 1 update per ${bench.rechartsSkipRatio * (threeWay ? 3 : 2)} ticks (~${bench.effectiveRechartsHz.toFixed(1)} Hz)`
              : undefined
          }
          footnote="Alternating tick samples on this device"
        />
        {threeWay ? (
          <TimingRow
            title="ECharts — live flushSync"
            metrics={bench.echartsLive}
            accent="#a78bfa"
            struggling={echartsStruggling}
            footnote="Alternating tick samples on this device"
          />
        ) : null}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: threeWay ? "1fr 1fr 1fr" : "1fr 1fr",
          gap: 12,
          opacity: 0.85,
        }}
      >
        <TimingRow
          title="AxiCharts — React Profiler (supplementary)"
          metrics={axiMetrics}
          accent="#60a5fa"
          footnote="Profiler commit time — not used for primary ratio"
        />
        <TimingRow
          title="Recharts — React Profiler (supplementary)"
          metrics={rechartsMetrics}
          accent="#f87171"
          footnote="Profiler commit time — not used for primary ratio"
        />
        {threeWay ? (
          <TimingRow
            title="ECharts — React Profiler (supplementary)"
            metrics={echartsMetrics}
            accent="#a78bfa"
            footnote="Profiler commit time — not used for primary ratio"
          />
        ) : null}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.max(visibleColumnCount, 1)}, minmax(0, 1fr))`,
          gap: 20,
          alignItems: "start",
        }}
      >
        {showAxiColumn ? (
        <CompareColumn
          title="AxiCharts"
          subtitle="uPlot canvas · mode=live"
          accent="#2563eb"
          bench={bench}
          panelHeight={panelHeight}
          gridColumns={gridColumns}
          profilerId="axi-live-ops"
          onProfilerRender={onAxiProfiler}
          panels={bench.panels}
          renderPanel={(panel) => (
            <AxiPanel key={panel.spec.id} panel={panel} height={panelHeight} />
          )}
        />
        ) : null}
        {showRechartsColumn ? (
        <CompareColumn
          title="Recharts"
          subtitle="SVG LineChart · isAnimationActive=false"
          accent="#64748b"
          bench={bench}
          panelHeight={panelHeight}
          gridColumns={gridColumns}
          profilerId="recharts-live-ops"
          onProfilerRender={onRechartsProfiler}
          panels={bench.rechartsPanels}
          struggling={rechartsStruggling}
          renderPanel={(panel) => (
            <RechartsPanel
              key={panel.spec.id}
              panel={panel}
              height={panelHeight}
              width={panelWidth}
            />
          )}
        />
        ) : null}
        {showEchartsColumn ? (
        <CompareColumn
          title="ECharts"
          subtitle="Canvas line · animation=false"
          accent="#7c3aed"
          bench={bench}
          panelHeight={panelHeight}
          gridColumns={gridColumns}
          profilerId="echarts-live-ops"
          onProfilerRender={onEchartsProfiler}
          panels={bench.echartsPanels}
          struggling={echartsStruggling}
          renderPanel={(panel) => (
            <EChartsPanel
              key={panel.spec.id}
              panel={panel}
              height={panelHeight}
              width={panelWidth}
            />
          )}
        />
        ) : null}
      </div>
    </div>
  );
}

function ControlsBar({
  presetId,
  useCustom,
  customPanelCount,
  customPointCount,
  customHz,
  customPanelHeight,
  autoThrottle,
  onPresetChange,
  onUseCustom,
  onPanelCount,
  onPointCount,
  onHz,
  onPanelHeight,
  onAutoThrottle,
}: {
  presetId: BenchPresetId;
  useCustom: boolean;
  customPanelCount: number;
  customPointCount: number;
  customHz: number;
  customPanelHeight: number;
  autoThrottle: boolean;
  onPresetChange: (id: BenchPresetId) => void;
  onUseCustom: () => void;
  onPanelCount: (value: number) => void;
  onPointCount: (value: number) => void;
  onHz: (value: number) => void;
  onPanelHeight: (value: number) => void;
  onAutoThrottle: (value: boolean) => void;
}): ReactElement {
  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        padding: 14,
        borderRadius: 10,
        border: "1px solid #334155",
        background: "#020617",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#94a3b8", marginRight: 4 }}>Preset</span>
        {(Object.keys(BENCH_PRESETS) as BenchPresetId[]).map((id) => {
          const preset = BENCH_PRESETS[id];
          const active = !useCustom && presetId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onPresetChange(id)}
              style={{
                ...CONTROL_STYLE,
                borderColor: active ? "#2563eb" : "#475569",
                background: active ? "#1e3a5f" : "#0f172a",
                cursor: "pointer",
              }}
            >
              {preset.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onUseCustom}
          style={{
            ...CONTROL_STYLE,
            borderColor: useCustom ? "#2563eb" : "#475569",
            background: useCustom ? "#1e3a5f" : "#0f172a",
            cursor: "pointer",
          }}
        >
          Custom
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>
        {useCustom
          ? "Custom fixture — adjust panel count, points, and Hz"
          : BENCH_PRESETS[presetId].description}
      </p>
      {useCustom ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
          }}
        >
          <label style={{ fontSize: 11, color: "#94a3b8", display: "flex", gap: 6, alignItems: "center" }}>
            Panels
            <input
              type="number"
              min={1}
              max={12}
              value={customPanelCount}
              onChange={(event) => onPanelCount(Number(event.target.value))}
              style={{ ...CONTROL_STYLE, width: 56 }}
            />
          </label>
          <label style={{ fontSize: 11, color: "#94a3b8", display: "flex", gap: 6, alignItems: "center" }}>
            Points
            <input
              type="number"
              min={120}
              max={10000}
              step={100}
              value={customPointCount}
              onChange={(event) => onPointCount(Number(event.target.value))}
              style={{ ...CONTROL_STYLE, width: 72 }}
            />
          </label>
          <label style={{ fontSize: 11, color: "#94a3b8", display: "flex", gap: 6, alignItems: "center" }}>
            Hz
            <input
              type="number"
              min={1}
              max={15}
              value={customHz}
              onChange={(event) => onHz(Number(event.target.value))}
              style={{ ...CONTROL_STYLE, width: 48 }}
            />
          </label>
          <label style={{ fontSize: 11, color: "#94a3b8", display: "flex", gap: 6, alignItems: "center" }}>
            Height
            <input
              type="number"
              min={56}
              max={140}
              step={4}
              value={customPanelHeight}
              onChange={(event) => onPanelHeight(Number(event.target.value))}
              style={{ ...CONTROL_STYLE, width: 56 }}
            />
          </label>
        </div>
      ) : null}
      <label
        style={{
          fontSize: 11,
          color: "#94a3b8",
          display: "flex",
          gap: 8,
          alignItems: "center",
          cursor: "pointer",
          width: "fit-content",
        }}
      >
        <input
          type="checkbox"
          checked={autoThrottle}
          onChange={(event) => onAutoThrottle(event.target.checked)}
        />
        Auto-throttle Recharts when frame budget exceeded (skip frames to recover)
      </label>
    </div>
  );
}

function CompareColumn({
  title,
  subtitle,
  accent,
  bench,
  panelHeight,
  gridColumns,
  profilerId,
  onProfilerRender,
  panels,
  struggling,
  renderPanel,
}: {
  title: string;
  subtitle: string;
  accent: string;
  bench: LiveBenchState;
  panelHeight: number;
  gridColumns: number;
  profilerId: string;
  onProfilerRender: React.ProfilerOnRenderCallback;
  panels: LivePanelState[];
  struggling?: boolean;
  renderPanel: (panel: LivePanelState) => ReactElement;
}): ReactElement {
  return (
    <section>
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: accent,
          }}
        >
          {title}
          {struggling ? (
            <span style={{ marginLeft: 6, color: "#fbbf24" }}>⚠</span>
          ) : null}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{subtitle}</div>
      </div>
      <Profiler id={profilerId} onRender={onProfilerRender}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
            gap: 8,
            padding: 12,
            borderRadius: 12,
            border: struggling ? "1px solid #b45309" : "1px solid #334155",
            background: "#020617",
          }}
        >
          {panels.map((panel) => renderPanel(panel))}
        </div>
      </Profiler>
      <p style={{ margin: "8px 0 0", fontSize: 11, color: "#64748b" }}>
        {gridColumns}-col grid · {panelHeight}px panels · {bench.pointCount.toLocaleString()} pts ·
        synthetic load
      </p>
    </section>
  );
}
