import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  formatValidatePresetCommand,
  HOSTED_IMPORT_PRESETS,
} from "@axicharts/charts-runtime/validation";
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

function PresetValidateRow({
  presetId,
  label,
}: {
  presetId: string;
  label: string;
}): ReactElement {
  const [copied, setCopied] = useState(false);
  const command = formatValidatePresetCommand(presetId);

  const copy = async (): Promise<void> => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      <span style={{ fontSize: 12, color: "#64748b", minWidth: 120 }}>{label}</span>
      <code
        style={{
          flex: 1,
          minWidth: 240,
          padding: "6px 10px",
          borderRadius: 6,
          background: "#f1f5f9",
          color: "#0f172a",
          fontSize: 11,
        }}
      >
        {command}
      </code>
      <button
        type="button"
        onClick={() => void copy()}
        style={{
          fontSize: 12,
          padding: "6px 12px",
          borderRadius: 6,
          border: "1px solid #cbd5e1",
          background: "#f8fafc",
          cursor: "pointer",
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
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
        <code>dataSourceId</code> references. Shipped examples and Dashboarder exports include
        top-level <code>$schema</code> hints. CI runs <code>pnpm validate:runtime</code> with the
        dual <code>--all</code> gate on every build.
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
          <li>
            <Link to="/runtime/import">Import gallery</Link> — dual-gate preview for all examples
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
          <PresetValidateRow key={preset.id} presetId={preset.id} label={preset.label} />
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

      <Section title="Runtime spec schema" subtitle="draft-07 · embed + mosaic">
        <CodeBlock dark>{JSON.stringify(runtimeSchema, null, 2)}</CodeBlock>
      </Section>

      <Section title="Share export schema" subtitle="dashboard + workspace envelopes">
        <CodeBlock dark>{JSON.stringify(shareSchema, null, 2)}</CodeBlock>
      </Section>
    </div>
  );
}
