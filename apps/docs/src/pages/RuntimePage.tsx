import type { ReactElement, ReactNode } from "react";
import { Link } from "react-router-dom";
import { RuntimeDashboard, buildEmbedBundle, serializeRuntimeSpec } from "@axicharts/charts-runtime";
import { ADAPTER_FIXTURE_PRESETS, PLANNER_FEED_ROWS } from "@axicharts/charts-runtime/validation";
import { RuntimeHubNav } from "../components/RuntimeHubNav";
import {
  DASHBOARDER_PLANNER_ENV,
  PLANNER_CLIENT_CODE,
  PLANNER_HEALTH_CURL,
  PLANNER_HEALTH_RESPONSE,
  PLANNER_PLAN_CURL_INLINE,
  PLANNER_PLAN_RESPONSE,
  PLANNER_SERVE_CODE,
  SHARE_EXPORT_META_EXAMPLE,
} from "../demos/runtimePlannerDemo";
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
  id,
  children,
}: {
  title: string;
  subtitle?: string;
  id?: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section
      id={id}
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
      <RuntimeHubNav page="/runtime" showBreadcrumb={false} />
      <h1 style={{ marginTop: 0 }}>Dashboard runtime</h1>
      <p style={{ color: "#475569", maxWidth: 640 }}>
        Layer 3 embed SDK — bind REST, WebSocket, MQTT, historian, or static data to charts-spec
        templates with stale overlays and alarm chrome.
      </p>

      <Section title="Adapter overview" subtitle="connectSource · gallery fixtures">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Runtime dashboards bind templates through <code>dataSource</code> or mosaic{" "}
          <code>dataSources</code>. Each adapter type has a shipped import preset for validation and
          copy-paste wiring — open the{" "}
          <Link to="/runtime/adapters">adapter cookbook</Link> for field tables and payload shapes.
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "8px 6px" }}>Type</th>
              <th style={{ padding: "8px 6px" }}>Use case</th>
              <th style={{ padding: "8px 6px" }}>Key fields</th>
              <th style={{ padding: "8px 6px" }}>Planner feed</th>
              <th style={{ padding: "8px 6px" }}>Gallery fixture</th>
            </tr>
          </thead>
          <tbody>
            {ADAPTER_ROWS.map((row) => {
              const presetId = ADAPTER_FIXTURE_PRESETS[row.type];
              const plannerRow = PLANNER_FEED_ROWS.find((item) => item.adapter === row.type);
              return (
                <tr key={row.type} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 6px" }}>
                    <code>{row.type}</code>
                  </td>
                  <td style={{ padding: "8px 6px", color: "#475569" }}>{row.useCase}</td>
                  <td style={{ padding: "8px 6px", color: "#64748b", fontSize: 12 }}>
                    {row.fields}
                  </td>
                  <td style={{ padding: "8px 6px", fontSize: 12 }}>
                    {plannerRow ? (
                      <>
                        <code>{plannerRow.feed}</code>
                        {" · "}
                        <Link to={`/runtime/import#planner-feeds`}>{plannerRow.intentSample}</Link>
                      </>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "8px 6px", fontSize: 12 }}>
                    {presetId ? (
                      <Link to={`/runtime/import?preset=${presetId}`}>{presetId}</Link>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      <Section
        title="Share → import round-trip"
        subtitle="planner meta · Dashboarder"
        id="share-import"
      >
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Dashboarder <strong>Share</strong> serializes portable JSON with optional planner{" "}
          <code>meta</code> (layout, feed, template, mosaic preset, presentation).{" "}
          <strong>Import</strong> validates the envelope, previews meta restore, and calls{" "}
          <code>applyDashboardMeta</code> on apply — same fields the builder uses after{" "}
          <strong>Plan</strong>. Workspace bundles include <code>meta</code> per dashboard.
        </p>
        <ol
          style={{
            margin: "0 0 16px",
            paddingLeft: 20,
            fontSize: 13,
            color: "#475569",
            lineHeight: 1.7,
          }}
        >
          <li>
            Plan or tune layout/feed in Dashboarder — builder state lives in{" "}
            <code>dashboard.meta</code>.
          </li>
          <li>
            Share export (dashboard or workspace) — ShareDialog shows the planner meta block and
            gallery links.
          </li>
          <li>
            Import JSON — ImportDialog validates schema + semantics and previews what meta will
            restore.
          </li>
          <li>
            Apply — spec replaces the active dashboard; meta restores feed, template, and mosaic
            preset without re-planning.
          </li>
        </ol>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Dashboard export with meta</strong>
        </p>
        <pre
          style={{
            margin: "0 0 12px",
            padding: 14,
            background: "#0f172a",
            color: "#e2e8f0",
            fontSize: 11,
            lineHeight: 1.5,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {SHARE_EXPORT_META_EXAMPLE}
        </pre>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
          Shipped presets:{" "}
          <Link to="/runtime/import?preset=ops-dashboard">ops-dashboard</Link>
          {" · "}
          <Link to="/runtime/import?preset=ops-workspace">ops-workspace</Link>
          {" · "}
          <Link to="/start#share-import">Getting started</Link>
          {" · "}
          <Link to="/runtime/import#share-import-track">share/import track notes</Link>
          {" · "}
          <Link to="/runtime/schema#share-meta">schema § meta</Link>
        </p>
      </Section>

      <Section title="Planner feeds" subtitle="intent → feed → gallery fixture">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Phase 3 <code>@axicharts/charts-planner</code> infers a live feed from intent and applies it
          in Dashboarder via <strong>Plan</strong>. Each feed maps to a shipped import preset — see
          the full index on the{" "}
          <Link to="/runtime/import#planner-feeds">import gallery planner feed table</Link>
          {" · "}
          <Link to="#planner-http">HTTP API examples</Link>.
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "8px 6px" }}>Feed</th>
              <th style={{ padding: "8px 6px" }}>Sample intent</th>
              <th style={{ padding: "8px 6px" }}>Fixture</th>
            </tr>
          </thead>
          <tbody>
            {PLANNER_FEED_ROWS.map((row) => (
              <tr key={row.feed} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 6px" }}>
                  <code>{row.feed}</code>
                </td>
                <td style={{ padding: "8px 6px", color: "#475569", fontSize: 12 }}>
                  {row.intentSample}
                </td>
                <td style={{ padding: "8px 6px", fontSize: 12 }}>
                  <Link to={`/runtime/import?preset=${row.presetId}`}>{row.presetId}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Planner HTTP API" subtitle="serve · health · plan" id="planner-http">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Run the Phase 3 planner locally and point Dashboarder at it with{" "}
          <code>VITE_PLANNER_URL</code>. Invalid LLM JSON falls back to rules with a warning on the
          plan — same behavior as the in-app <strong>Plan</strong> dialog.
        </p>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Start server</strong>
        </p>
        <pre
          style={{
            margin: "0 0 16px",
            padding: 14,
            background: "#0f172a",
            color: "#e2e8f0",
            fontSize: 11,
            lineHeight: 1.5,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {PLANNER_SERVE_CODE}
        </pre>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Health</strong>
        </p>
        <pre
          style={{
            margin: "0 0 8px",
            padding: 14,
            background: "#f8fafc",
            fontSize: 11,
            lineHeight: 1.5,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {PLANNER_HEALTH_CURL}
        </pre>
        <pre
          style={{
            margin: "0 0 16px",
            padding: 14,
            background: "#f8fafc",
            fontSize: 11,
            lineHeight: 1.5,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {PLANNER_HEALTH_RESPONSE}
        </pre>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>POST /plan</strong>
        </p>
        <pre
          style={{
            margin: "0 0 8px",
            padding: 14,
            background: "#f8fafc",
            fontSize: 11,
            lineHeight: 1.5,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {PLANNER_PLAN_CURL_INLINE}
        </pre>
        <pre
          style={{
            margin: "0 0 16px",
            padding: 14,
            background: "#f8fafc",
            fontSize: 11,
            lineHeight: 1.5,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {PLANNER_PLAN_RESPONSE}
        </pre>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Dashboarder env</strong>
        </p>
        <pre
          style={{
            margin: "0 0 16px",
            padding: 14,
            background: "#f8fafc",
            fontSize: 11,
            lineHeight: 1.5,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {DASHBOARDER_PLANNER_ENV}
        </pre>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Client</strong>
        </p>
        <pre
          style={{
            margin: 0,
            padding: 14,
            background: "#0f172a",
            color: "#e2e8f0",
            fontSize: 11,
            lineHeight: 1.5,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          {PLANNER_CLIENT_CODE}
        </pre>
      </Section>

      <Section title="Embed layout" subtitle="single dashboard template">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569" }}>
          Static fixture demo — live REST wiring:{" "}
          <Link to="/runtime/import?preset=ops-rest">ops-rest</Link>.
        </p>
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
          Export runtime JSON for Dashboarder, GitOps, or agent planners — see the{" "}
          <Link to="/runtime/schema">schema page</Link> for validation and hosted URLs. Example
          fixture: <code>packages/charts-runtime/examples/ops-mosaic.runtime.json</code>.
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
