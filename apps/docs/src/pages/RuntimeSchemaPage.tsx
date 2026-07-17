import type { ReactElement, ReactNode } from "react";
import { Link } from "react-router-dom";
import runtimeSchema from "../../../../packages/charts-runtime/schema/runtime-spec.schema.json";
import shareSchema from "../../../../packages/charts-runtime/schema/share-export.schema.json";
import {
  EDITOR_RUNTIME_HEADER,
  EDITOR_SHARE_HEADER,
  EDITOR_VSCODE_SETTINGS,
  GITOPS_CODE,
  SCHEMA_IMPORT_CODE,
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
      <p style={{ marginTop: 0, fontSize: 13, color: "#64748b" }}>
        <Link to="/runtime">Runtime SDK</Link> / Schema & validation
      </p>
      <h1 style={{ marginTop: 8 }}>Runtime spec schema</h1>
      <p style={{ color: "#475569", maxWidth: 720, lineHeight: 1.6 }}>
        Portable runtime JSON is validated in two layers: draft-07 JSON Schema for shape and
        enums, plus semantic checks for template IDs, adapter fields, and mosaic{" "}
        <code>dataSourceId</code> references. CI runs <code>pnpm validate:runtime</code> on every
        build; npm publish runs the same gate before packages ship.
      </p>

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
            <a href={`${base}examples/ops-dashboard.share.json`}>ops-dashboard.share.json</a>
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

      <Section title="Runtime spec schema" subtitle="draft-07 · embed + mosaic">
        <CodeBlock dark>{JSON.stringify(runtimeSchema, null, 2)}</CodeBlock>
      </Section>

      <Section title="Share export schema" subtitle="dashboard + workspace envelopes">
        <CodeBlock dark>{JSON.stringify(shareSchema, null, 2)}</CodeBlock>
      </Section>
    </div>
  );
}
