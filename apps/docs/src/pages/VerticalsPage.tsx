import type { ReactElement } from "react";
import { Dashboard } from "@axicharts/charts-spec";
import { VERTICAL_GATES } from "../demos/verticalData";

export function VerticalsPage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Vertical gallery</h1>
      <p style={{ color: "#475569", maxWidth: 640 }}>
        Storybook acceptance gates G–Q — SaaS, ops, finance, trading, resources, community plugins,
        and program delivery on one stack.
      </p>
      <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
        {VERTICAL_GATES.length} live templates · mirrors Storybook gates
      </p>
      <div style={{ display: "grid", gap: 28, marginTop: 28 }}>
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
