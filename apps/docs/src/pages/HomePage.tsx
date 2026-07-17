import type { ReactElement } from "react";
import { Link } from "react-router-dom";

export function HomePage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0, fontSize: 32 }}>The React chart platform for dashboards</h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: "#475569", maxWidth: 640 }}>
        AxiCharts ships line, bar, area, pie, candlestick, waterfall, and heatmap charts with
        industrial primitives, live themes, spec-driven templates, community plugins, and a portable
        runtime embed SDK.
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <Link
          to="/start"
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            background: "#0f172a",
            color: "#fff",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          Get started
        </Link>
        <Link
          to="/verticals"
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            color: "#0f172a",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          Browse verticals
        </Link>
      </div>
      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 18 }}>Stack layers</h2>
        <ul style={{ lineHeight: 1.8, color: "#475569" }}>
          <li>
            <strong>Layer 1</strong> — <code>@axicharts/charts</code> composable React charts
          </li>
          <li>
            <strong>Layer 2</strong> — <code>@axicharts/charts-spec</code> templates + planner —{" "}
            <Link to="/spec">see spec layer</Link>
          </li>
          <li>
            <strong>Runtime</strong> — <code>@axicharts/charts-runtime</code> live data + embed —{" "}
            <Link to="/runtime">see runtime SDK</Link> ·{" "}
            <Link to="/runtime/schema">schema & validation</Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
