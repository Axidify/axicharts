import type { ReactElement } from "react";
import { Dashboard } from "@axicharts/charts-spec";
import { VERTICAL_GATES } from "../demos/verticalData";

export function VerticalsPage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Vertical gallery</h1>
      <p style={{ color: "#475569", maxWidth: 640 }}>
        Storybook acceptance gates G–O — SaaS, ops, finance, trading, and resource management on
        one stack.
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
              }}
            >
              <strong style={{ fontSize: 14 }}>{gate.title}</strong>
              <span style={{ fontSize: 12, color: "#64748b" }}>{gate.subtitle}</span>
            </div>
            <div style={{ padding: 16 }}>
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
