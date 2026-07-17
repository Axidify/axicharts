import type { ReactElement, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  formatValidatePresetCommand,
  HOSTED_IMPORT_PRESETS,
  runtimeDeepLinkShareImportDeepLink,
  runtimeShareImportDeepLink,
  SHARE_EXPORT_REFERENCE_PRESET,
} from "@axicharts/charts-runtime/validation";
import { ValidateCommandCopy } from "../components/ValidateCommandCopy";
import { RuntimeHubNav } from "../components/RuntimeHubNav";
import runtimeSchema from "../../../../packages/charts-runtime/schema/runtime-spec.schema.json";
import shareSchema from "../../../../packages/charts-runtime/schema/share-export.schema.json";
import {
  EDITOR_RUNTIME_HEADER,
  EDITOR_SHARE_HEADER,
  EDITOR_SHARE_WITH_META_HEADER,
  EDITOR_VSCODE_SETTINGS,
  GITOPS_CODE,
  SCHEMA_IMPORT_CODE,
  SHARE_META_FIELD_ROWS,
  VALIDATE_RUNTIME_CODE,
} from "../demos/runtimeSchemaDemo";

const base = import.meta.env.BASE_URL;

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

function CodeBlock({ children, dark = false }: { children: string; dark?: boolean }): ReactElement {
  return (
    <pre
      style={{
        margin: 0,
        padding: 14,
        background: dark ? "#0f172a" : "#f8fafc",
        color: dark ? "#e2e8f0" : "#0f172a",
        fontSize: 11,
        lineHeight: 1.5,
        overflow: "auto",
        borderRadius: 8,
      }}
    >
      {children}
    </pre>
  );
}

export function RuntimeSchemaPage(): ReactElement {
  const runtimeSchemaUrl = `${base}schema/runtime-spec.schema.json`;
  const shareSchemaUrl = `${base}schema/share-export.schema.json`;

  return (
    <div>
      <RuntimeHubNav page="/runtime/schema" />
      <h1 style={{ marginTop: 0 }}>Runtime spec schema</h1>
      <p style={{ color: "#475569", maxWidth: 720, lineHeight: 1.6 }}>
        Portable runtime JSON is validated in two layers: draft-07 JSON Schema for shape and
        enums, plus semantic checks for template IDs, adapter fields, and mosaic{" "}
        <code>dataSourceId</code> references. Shipped examples and Dashboarder exports include
        top-level <code>$schema</code> hints. CI runs <code>pnpm validate:runtime</code> with the
        dual <code>--all</code> gate on every build.
      </p>

      <Section title="Validation stack" subtitle="schema · CLI · presets · Dashboarder">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Runtime portability ships with a complete validation path from editor hints through CI.
          Every shipped import preset has a matching <code>--preset</code> shortcut, live preview in
          Dashboarder, and copyable commands across docs.
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", lineHeight: 1.8, fontSize: 13 }}>
          <li>
            <strong>Dual gate</strong> — draft-07 JSON Schema shape + semantic checks (templates,
            adapters, mosaic <code>dataSourceId</code>)
          </li>
          <li>
            <strong>CLI</strong> — <code>charts-runtime validate</code> with <code>--schema</code>,{" "}
            <code>--all</code>, <code>--share</code>, and <code>--preset</code>
          </li>
          <li>
            <strong>CI</strong> — <code>pnpm validate:runtime</code> loops all gallery presets
          </li>
          <li>
            <strong>Dashboarder</strong> — Import, Share, and Embed dialogs run live validation with
            copyable CLI hints
          </li>
        </ul>
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "#64748b" }}>
          <Link to="/runtime/import">Import gallery</Link>
          {" · "}
          <Link to="/runtime/links">Deep link index</Link>
          {" · "}
          <a href="https://github.com/Axidify/axicharts" rel="noreferrer" target="_blank">
            axicharts repo
          </a>
        </p>
      </Section>

      <Section title="Hosted schema URLs" subtitle="GitHub Pages · npm subpaths">
        <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", lineHeight: 1.8 }}>
          <li>
            <a href={runtimeSchemaUrl}>runtime-spec.schema.json</a>
          </li>
          <li>
            <a href={shareSchemaUrl}>share-export.schema.json</a>
          </li>
          <li>
            <a href={`${base}examples/ops-embed.runtime.json`}>ops-embed.runtime.json</a>
          </li>
          <li>
            <a href={`${base}examples/ops-mosaic.runtime.json`}>ops-mosaic.runtime.json</a>
          </li>
          <li>
            <a href={`${base}examples/ops-historian.runtime.json`}>ops-historian.runtime.json</a>
          </li>
          <li>
            <a href={`${base}examples/ops-rest.runtime.json`}>ops-rest.runtime.json</a>
          </li>
          <li>
            <a href={`${base}examples/ops-mqtt.runtime.json`}>ops-mqtt.runtime.json</a>
          </li>
          <li>
            <a href={`${base}examples/ops-websocket.runtime.json`}>ops-websocket.runtime.json</a>
          </li>
          <li>
            <a href={`${base}examples/ops-mock-live.runtime.json`}>ops-mock-live.runtime.json</a>
          </li>
          <li>
            <a href={`${base}examples/ops-dashboard.share.json`}>ops-dashboard.share.json</a>
          </li>
          <li>
            <Link to="/runtime/import">Import gallery</Link> — dual-gate preview for all examples
          </li>
          <li>
            <Link to="/runtime/adapters">Adapter cookbook</Link> — REST, WebSocket, historian field
            reference
          </li>
          <li>
            <Link to="/runtime/links">Deep link index</Link> — canonical preset and schema URLs
          </li>
        </ul>
        <div style={{ marginTop: 12 }}>
          <CodeBlock>{SCHEMA_IMPORT_CODE}</CodeBlock>
        </div>
      </Section>

      <Section title="CLI validation" subtitle="charts-runtime validate">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569" }}>
          Semantic validation returns structured <code>path: message</code> errors. Add{" "}
          <code>--schema</code> for draft-07 shape checks or <code>--all</code> to run both gates.
          Exit code <code>0</code> prints <code>ok</code> for GitOps pipelines.
        </p>
        <CodeBlock>{VALIDATE_RUNTIME_CODE}</CodeBlock>
      </Section>

      <Section title="Shipped preset validation" subtitle="charts-runtime validate --preset">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569" }}>
          Each gallery fixture maps to a preset id. <code>pnpm validate:runtime</code> runs the dual
          gate on every preset via <code>--preset &lt;id&gt; --all</code>.
        </p>
        {HOSTED_IMPORT_PRESETS.map((preset) => (
          <ValidateCommandCopy
            key={preset.id}
            label={preset.label}
            command={formatValidatePresetCommand(preset.id)}
          />
        ))}
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "#64748b" }}>
          <Link to="/runtime/import">Import gallery</Link> previews the same fixtures with live
          validation chrome.
        </p>
      </Section>

      <Section title="Editor integration" subtitle="VS Code · $schema headers">
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569" }}>
          Map <code>*.runtime.json</code> and share exports to hosted schemas in workspace settings,
          or add a top-level <code>$schema</code> URL for per-file completion. Dashboarder exports
          include the hint automatically.
        </p>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>settings.json</strong>
        </p>
        <CodeBlock>{EDITOR_VSCODE_SETTINGS}</CodeBlock>
        <p style={{ margin: "16px 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Runtime spec file</strong>
        </p>
        <CodeBlock>{EDITOR_RUNTIME_HEADER}</CodeBlock>
        <p style={{ margin: "16px 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Share export file</strong>
        </p>
        <CodeBlock>{EDITOR_SHARE_HEADER}</CodeBlock>
      </Section>

      <Section title="GitOps workflow" subtitle="pull request gate">
        <CodeBlock dark>{GITOPS_CODE}</CodeBlock>
      </Section>

      <Section
        title="Share export planner meta"
        subtitle="dashboardMeta · Dashboarder round-trip"
        id="share-meta"
      >
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Optional <code>meta</code> on dashboard and workspace share exports preserves Dashboarder
          builder state — layout, feed, template, mosaic preset, and presentation. Portable runtime
          JSON omits <code>meta</code>; use share envelopes for planner round-trip. Import restores
          fields via <code>applyDashboardMeta</code> — see{" "}
          <Link to="/runtime#share-import">share ↔ import flow</Link>
          {" · "}
          <Link to="/runtime/links#share-import">deep-link presets</Link>
          {" · "}
          <a href={runtimeShareImportDeepLink()}>hosted overview</a>.
        </p>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  padding: "8px 6px",
                  textAlign: "left",
                }}
              >
                Field
              </th>
              <th
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  padding: "8px 6px",
                  textAlign: "left",
                }}
              >
                Type
              </th>
              <th
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  padding: "8px 6px",
                  textAlign: "left",
                }}
              >
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {SHARE_META_FIELD_ROWS.map((row) => (
              <tr key={row.field}>
                <td style={{ borderBottom: "1px solid #f1f5f9", padding: "8px 6px" }}>
                  <code>{row.field}</code>
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    padding: "8px 6px",
                    color: "#64748b",
                    fontSize: 12,
                  }}
                >
                  {row.type}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    padding: "8px 6px",
                    color: "#475569",
                  }}
                >
                  {row.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>
          <strong>Share export with meta</strong>
        </p>
        <CodeBlock>{EDITOR_SHARE_WITH_META_HEADER}</CodeBlock>
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "#64748b" }}>
          Shipped fixtures:{" "}
          <Link to={`/runtime/import?preset=${SHARE_EXPORT_REFERENCE_PRESET.dashboard}`}>
            {SHARE_EXPORT_REFERENCE_PRESET.dashboard}
          </Link>
          {" · "}
          <Link to={`/runtime/import?preset=${SHARE_EXPORT_REFERENCE_PRESET.workspace}`}>
            {SHARE_EXPORT_REFERENCE_PRESET.workspace}
          </Link>
          {" · "}
          <a href={runtimeDeepLinkShareImportDeepLink()}>deep-link table</a>
          {" · "}
          <Link to="/runtime/links#share-import-track">C44–C46 track notes</Link>
          {" · "}
          <Link to="/start#share-import">Start page</Link>
        </p>
      </Section>

      <Section title="Runtime spec schema" subtitle="draft-07 · embed + mosaic">
        <CodeBlock dark>{JSON.stringify(runtimeSchema, null, 2)}</CodeBlock>
      </Section>

      <Section title="Share export schema" subtitle="dashboard + workspace envelopes">
        <CodeBlock dark>{JSON.stringify(shareSchema, null, 2)}</CodeBlock>
      </Section>
    </div>
  );
}
