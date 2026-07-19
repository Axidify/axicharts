import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { docBodyStyle, docCardStyle, docColors, docRadii } from "../styles/docTokens";

export function HomePage(): ReactElement {
  return (
    <div>
      <div
        style={{
          ...docCardStyle(),
          padding: "28px 28px 24px",
          marginBottom: 28,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 55%, #eff6ff 100%)",
        }}
      >
        <h1 style={{ marginTop: 0, fontSize: 34, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
          React charts for dashboards
        </h1>
        <p style={{ ...docBodyStyle(), fontSize: 16, marginBottom: 0, maxWidth: 560 }}>
          Composable JSX, optional JSON spec, canvas when panels go live. Start with{" "}
          <code>QuickLineChart</code> — add cartesian spec when agents need it.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          <Link
            to="/start"
            style={{
              padding: "10px 16px",
              borderRadius: docRadii.md,
              background: docColors.text,
              color: "#fff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Start here
          </Link>
          <Link
            to="/guides/choosing-your-path"
            style={{
              padding: "10px 16px",
              borderRadius: docRadii.md,
              border: `1px solid ${docColors.border}`,
              color: docColors.text,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              background: docColors.surface,
            }}
          >
            Choosing your path
          </Link>
          <Link
            to="/guides/imports"
            style={{
              padding: "10px 16px",
              borderRadius: docRadii.md,
              border: `1px solid ${docColors.border}`,
              color: docColors.text,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              background: docColors.surface,
            }}
          >
            Import cheat sheet
          </Link>
        </div>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {[
          {
            title: "Start here",
            body: "QuickLineChart → theme → ChartContainer. uPlot only — no ECharts.",
            to: "/start",
          },
          {
            title: "Advanced",
            body: "Cartesian marks[], validateCartesianSpec, eject to JSX.",
            to: "/spec/blocks",
          },
          {
            title: "shadcn / Recharts",
            body: "Migration gallery and registry — secondary path.",
            to: "/shadcn",
          },
          {
            title: "Live ops",
            body: "5–10 Hz compare wall vs Recharts and ECharts.",
            to: "/compare",
          },
        ].map((card) => (
          <Link
            key={card.to}
            to={card.to}
            style={{
              ...docCardStyle(),
              padding: "16px 18px",
              boxShadow: "none",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{card.title}</div>
            <p style={{ margin: 0, fontSize: 13, color: docColors.muted, lineHeight: 1.5 }}>
              {card.body}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
