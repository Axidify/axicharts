import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { docBodyStyle, docCardStyle, docColors, docRadii } from "../styles/docTokens";

const layers = [
  {
    title: "Layer 1",
    package: "@axicharts/charts",
    description: "Composable React charts — line, bar, area, pie, candlestick, and more.",
  },
  {
    title: "Layer 2",
    package: "@axicharts/charts-spec",
    description: "Templates, planner, and spec-driven dashboards.",
    href: "/spec",
  },
  {
    title: "Runtime",
    package: "@axicharts/charts-runtime",
    description: "Live data adapters, embed SDK, validation, and import gallery.",
    href: "/runtime",
  },
] as const;

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
          The React chart platform for dashboards
        </h1>
        <p style={{ ...docBodyStyle(), fontSize: 16, marginBottom: 0 }}>
          AxiCharts ships line, bar, area, pie, candlestick, waterfall, and heatmap charts with
          industrial primitives, live themes, spec-driven templates, community plugins, and a
          portable runtime embed SDK.
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
            Get started
          </Link>
          <Link
            to="/verticals"
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
            Browse verticals
          </Link>
          <Link
            to="/compare"
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
            Live vs Recharts
          </Link>
          <Link
            to="/shadcn"
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
            shadcn gallery
          </Link>
          <Link
            to="/verticals#storybook-round3"
            style={{
              padding: "10px 16px",
              borderRadius: docRadii.md,
              color: docColors.accent,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Storybook gates G–Q →
          </Link>
        </div>
      </div>

      <section>
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Stack layers</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {layers.map((layer) => (
            <div
              key={layer.package}
              style={{
                ...docCardStyle(),
                padding: "14px 16px",
                boxShadow: "none",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: docColors.text }}>
                {layer.title} — <code>{layer.package}</code>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: docColors.muted, lineHeight: 1.5 }}>
                {layer.description}
                {"href" in layer && layer.href ? (
                  <>
                    {" "}
                    <Link to={layer.href}>Learn more</Link>
                  </>
                ) : null}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
