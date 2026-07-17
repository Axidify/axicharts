import type { ReactElement } from "react";
import { RuntimeDashboard } from "@axicharts/charts-runtime";

export function RuntimePage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard runtime</h1>
      <p style={{ color: "#475569", maxWidth: 640 }}>
        Bind live REST, historian, MQTT, or static data to charts-spec templates with stale and
        alarm chrome.
      </p>
      <pre
        style={{
          padding: 14,
          borderRadius: 8,
          background: "#f1f5f9",
          fontSize: 11,
          overflow: "auto",
          marginTop: 20,
        }}
      >
        {`import { RuntimeDashboard } from "@axicharts/charts-runtime";

<RuntimeDashboard
  spec={{
    layout: "embed",
    dashboard: {
      template: "ops-2x2",
      mode: "live",
      dataSource: { type: "rest", url: "/api/metrics", intervalMs: 2000 },
    },
  }}
/>`}
      </pre>
      <div style={{ marginTop: 24, maxWidth: 720 }}>
        <RuntimeDashboard
          spec={{
            layout: "embed",
            dashboard: {
              title: "prod-api-01",
              subtitle: "Static demo",
              template: "ops-2x2",
              theme: "industrial",
              mode: "live",
              data: {
                categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                cells: [
                  { title: "CPU", data: [22, 28, 31, 34, 30, 34, 32], suffix: "%" },
                  { title: "Memory", data: [55, 58, 60, 59, 61, 62, 61], suffix: "%" },
                  {
                    title: "Errors",
                    data: [1, 2, 5, 3, 2, 4, 3],
                    suffix: "/min",
                    tone: "warning",
                  },
                  { title: "p95", data: [42, 38, 55, 49, 62, 58, 71], suffix: "ms" },
                ],
                alarms: [{ id: "cpu", message: "CPU above warn threshold", severity: "warning" }],
              },
            },
          }}
        />
      </div>
    </div>
  );
}
