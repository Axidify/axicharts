import type { ReactElement } from "react";
import { LiveOpsCompareDemo } from "../../../storybook/demo/LiveOpsCompareDemo";
import { docBodyStyle, docCardStyle, docColors } from "../styles/docTokens";

export function ComparePage(): ReactElement {
  return (
    <div>
      <div style={{ ...docCardStyle(), padding: 24, marginBottom: 24 }}>
        <h1 style={{ marginTop: 0 }}>AxiCharts vs Recharts vs ECharts — live ops wall</h1>
        <p style={docBodyStyle()}>
          Multi-panel chart wall with configurable stress presets. AxiCharts renders with uPlot
          canvas; Recharts renders SVG <code>LineChart</code> with{" "}
          <code>isAnimationActive={'{false}'}</code>; ECharts renders canvas line charts with{" "}
          <code>animation: false</code> (same methodology as <code>apps/bench-harness</code>).
          Chart data is a <strong>synthetic load generator</strong> — not real ops telemetry.
          Performance numbers are measured on your device using isolated{" "}
          <code>flushSync</code> calibration, with alternating live ticks across all three
          libraries for ongoing per-library samples.
        </p>
        <p style={{ ...docBodyStyle(), marginBottom: 0 }}>
          Published CI reference (Chromium 4×, <strong>6 panels × 2000 pts</strong>): AxiCharts{" "}
          <strong>2.9 ms</strong> · Recharts <strong>54.3 ms</strong> (18.7×) · ECharts{" "}
          <strong>26.5 ms</strong> (9.1×) — shown in the demo when the Standard preset matches
          that fixture. Try <strong>Heavy</strong> or <strong>Extreme</strong> presets to widen the
          gap on your hardware. See{" "}
          <a
            href="https://github.com/Axidify/axicharts/blob/main/benchmarks/BENCHMARKS.md"
            style={{ color: docColors.accent }}
          >
            BENCHMARKS.md
          </a>
          .
        </p>
      </div>

      <div
        style={{
          ...docCardStyle(),
          padding: 20,
          background: "#020617",
          borderColor: "#1e293b",
        }}
      >
        <LiveOpsCompareDemo preset="standard" showControls threeWay />
      </div>
    </div>
  );
}
