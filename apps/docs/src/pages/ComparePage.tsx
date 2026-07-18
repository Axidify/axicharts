import type { ReactElement } from "react";
import { LiveOpsCompareDemo } from "../../../storybook/demo/LiveOpsCompareDemo";
import { docBodyStyle, docCardStyle, docColors } from "../styles/docTokens";

export function ComparePage(): ReactElement {
  return (
    <div>
      <div style={{ ...docCardStyle(), padding: 24, marginBottom: 24 }}>
        <h1 style={{ marginTop: 0 }}>AxiCharts vs Recharts — live ops wall</h1>
        <p style={docBodyStyle()}>
          Six synchronized telemetry panels updating at 5 Hz on the same synthetic stream. AxiCharts
          renders with uPlot canvas; Recharts renders SVG <code>LineChart</code> marks with{" "}
          <code>isAnimationActive={'{false}'}</code>. Frame times use the same{" "}
          <code>flushSync</code> update loop as the published browser benchmark harness.
        </p>
        <p style={{ ...docBodyStyle(), marginBottom: 0 }}>
          Published Chromium 4× p95 for <strong>6 panels × 2000 pts</strong>: AxiCharts{" "}
          <strong>2.9 ms</strong> · Recharts <strong>54.3 ms</strong> · ECharts 26.5 ms. See{" "}
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
        <LiveOpsCompareDemo pointCount={2000} hz={5} panelHeight={88} />
      </div>
    </div>
  );
}
