import type { ReactElement, ReactNode } from "react";
import { RuntimeDashboard, buildEmbedBundle, serializeRuntimeSpec } from "@axicharts/charts-runtime";
import {
  ADAPTER_ROWS,
  EMBED_RUNTIME_SPEC,
  MOSAIC_PRESET_CODE,
  MOSAIC_RUNTIME_SPEC,
} from "../demos/runtimeDemo";

const EMBED_CODE = `import { RuntimeDashboard } from "@axicharts/charts-runtime";

<RuntimeDashboard
  spec={{
    layout: "embed",
    dashboard: {
      template: "ops-2x2",
      mode: "live",
      dataSource: { type: "rest", url: "/api/metrics", intervalMs: 2000 },
    },
  }}
/>`;

const MOSAIC_CODE = `import { RuntimeDashboard } from "@axicharts/charts-runtime";

<RuntimeDashboard
  spec={{
    layout: "mosaic",
    wall: {
      columns: 2,
      dataSources: [
        { id: "ops", type: "rest", url: "/api/line3" },
        { id: "kpi", type: "historian", url: "/api/tags", tags: ["throughput"] },
      ],
      cells: [
        { id: "ops", template: "ops-2x2", dataSourceId: "ops" },
        { id: "kpi", template: "line-overview", dataSourceId: "kpi" },
      ],
    },
  }}
/>`;

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section
      style={{
        marginTop: 28,
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
        <strong>{title}</strong>
        {subtitle ? (
          <span style={{ marginLeft: 8, fontSize: 12, color: "#64748b" }}>{subtitle}</span>
        ) : null}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </section>
  );
}

export function RuntimePage(): ReactElement {
  const portableSpec = serializeRuntimeSpec(MOSAIC_RUNTIME_SPEC);
  const embedBundle = buildEmbedBundle(EMBED_RUNTIME_SPEC, {
    presentation: false,
    alarmScopeId: "line-3",
  });

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard runtime</h1>
      <p style={{ color: "#475569", maxWidth: 640 }}>
        Layer 3 embed SDK — bind REST, WebSocket, MQTT, historian, or static data to charts-spec
        templates with stale overlays and alarm chrome.
      </p>

      <Section title="Data adapters" subtitle="connectSource + hooks">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "8px 6px" }}>Type</th>
              <th style={{ padding: "8px 6px" }}>Use case</th>
              <th style={{ padding: "8px 6px" }}>Key fields</th>
            </tr>
          </thead>
          <tbody>
            {ADAPTER_ROWS.map((row) => (
              <tr key={row.type} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 6px" }}>
                  <code>{row.type}</code>
                </td>
                <td style={{ padding: "8px 6px", color: "#475569" }}>{row.useCase}</td>
                <td style={{ padding: "8px 6px", color: "#64748b", fontSize: 12 }}>
                  {row.fields}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Embed layout" subtitle="single dashboard template">
        <div style={{ maxWidth: 720, marginBottom: 16 }}>
          <RuntimeDashboard spec={EMBED_RUNTIME_SPEC} />
        </div>
        <pre
          style={{
            margin: 0,
            padding: 14,
            background: "#f8fafc",
            fontSize: 11,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {EMBED_CODE}
        </pre>
      </Section>

      <Section title="Mosaic wall" subtitle="multi-source cells">
        <div style={{ maxWidth: 900, marginBottom: 16 }}>
          <RuntimeDashboard spec={MOSAIC_RUNTIME_SPEC} />
        </div>
        <pre
          style={{
            margin: 0,
            padding: 14,
            background: "#f8fafc",
            fontSize: 11,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {MOSAIC_CODE}
        </pre>
      </Section>

      <Section title="Mosaic presets" subtitle="buildMosaicPreset · listMosaicPresets">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569" }}>
          Named multi-cell walls for Dashboarder and agent planners — ops+finance, trading+program,
          and more.
        </p>
        <pre
          style={{
            margin: 0,
            padding: 14,
            background: "#f8fafc",
            fontSize: 11,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {MOSAIC_PRESET_CODE}
        </pre>
      </Section>

      <Section title="Embed SDK snippets" subtitle="buildEmbedBundle">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569" }}>
          Dashboarder exports React file-import, inline-spec, and portable JSON variants from{" "}
          <code>buildEmbedBundle</code>.
        </p>
        <pre
          style={{
            margin: 0,
            padding: 14,
            background: "#f8fafc",
            fontSize: 11,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {embedBundle.inlineReactSnippet}
        </pre>
      </Section>

      <Section title="Portable spec" subtitle="serializeRuntimeSpec / parseRuntimeSpec">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569" }}>
          Export runtime JSON for Dashboarder, GitOps, or agent planners — matches{" "}
          <code>packages/charts-runtime/examples/ops-mosaic.runtime.json</code>. CI validates
          examples with <code>charts-runtime validate</code>; JSON Schema lives at{" "}
          <code>@axicharts/charts-runtime/schema/runtime-spec.json</code>.
        </p>
        <pre
          style={{
            margin: 0,
            padding: 14,
            background: "#0f172a",
            color: "#e2e8f0",
            fontSize: 11,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {portableSpec}
        </pre>
      </Section>
    </div>
  );
}
