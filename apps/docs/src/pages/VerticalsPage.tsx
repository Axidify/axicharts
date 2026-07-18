import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { Dashboard } from "@axicharts/charts-spec";
import { VERTICAL_GATES } from "../demos/verticalData";
import {
  STORYBOOK_LOCAL_URL,
  STORYBOOK_ROUND3_RELEASE_NOTES,
} from "../demos/storybookRound3Demo";

export function VerticalsPage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Vertical gallery</h1>
      <p style={{ color: "#475569", maxWidth: 640 }}>
        Storybook acceptance gates G–Q — SaaS, ops, finance, trading, resources, community plugins,
        and program delivery on one stack. All gates are <strong>5/5</strong> after round 3 polish (
        C52–C62).
      </p>
      <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
        {VERTICAL_GATES.length} live templates · mirrors Storybook gates ·{" "}
        <code>pnpm storybook</code> → {STORYBOOK_LOCAL_URL}
      </p>

      <section
        id="storybook-round3"
        style={{
          marginTop: 24,
          marginBottom: 28,
          padding: 14,
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          maxWidth: 720,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Storybook round 3 release notes (C50–C62)
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Post–v0.2.8 track: share/import E2E, then gates G–Q elevated to 5/5 with KPI tiles,
          callouts, and SLO/plan references. See{" "}
          <Link to="/start#storybook-round3">getting started § Storybook</Link> and run{" "}
          <code>pnpm test:e2e:share-import</code> for Dashboarder dialog coverage.
        </p>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
          {STORYBOOK_ROUND3_RELEASE_NOTES.map((item) => (
            <li key={item.slice}>
              <strong>{item.slice}</strong> — {item.summary}
            </li>
          ))}
        </ul>
      </section>

      <div style={{ display: "grid", gap: 28 }}>
        {VERTICAL_GATES.map((gate) => (
          <section
            key={gate.id}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              background: "#ffffff",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: "#64748b",
                    border: "1px solid #cbd5e1",
                    borderRadius: 4,
                    padding: "2px 6px",
                  }}
                >
                  {gate.id}
                </span>
                <strong style={{ fontSize: 14 }}>{gate.title.replace(/^.\s·\s/, "")}</strong>
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 6px",
                    borderRadius: 999,
                    background: "#ecfdf5",
                    color: "#15803d",
                  }}
                >
                  5/5
                </span>
              </div>
              <span style={{ fontSize: 12, color: "#64748b" }}>{gate.subtitle}</span>
            </div>
            <div
              style={{
                padding: 16,
                background:
                  gate.theme === "industrial" || gate.theme === "live" ? "#0f172a" : "#ffffff",
              }}
            >
              <Dashboard
                template={gate.template}
                theme={gate.theme}
                mode={gate.mode}
                data={gate.data}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
