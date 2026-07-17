import { useState, type ReactElement } from "react";
import {
  runtimeDeepLinkShareImportDeepLink,
  runtimeSchemaShareMetaDeepLink,
  runtimeShareImportDeepLink,
  type ImportShape,
  type ShareExport,
} from "@axicharts/charts-runtime/validation";

const docsLinkStyle = { color: "#93c5fd" } as const;

export function ShareImportDocsLinks(): ReactElement {
  return (
    <div style={{ marginTop: 8 }}>
      Docs:{" "}
      <a href={runtimeSchemaShareMetaDeepLink()} style={docsLinkStyle} target="_blank" rel="noreferrer">
        Schema § meta
      </a>
      {" · "}
      <a href={runtimeShareImportDeepLink()} style={docsLinkStyle} target="_blank" rel="noreferrer">
        Share ↔ import
      </a>
      {" · "}
      <a
        href={runtimeDeepLinkShareImportDeepLink()}
        style={docsLinkStyle}
        target="_blank"
        rel="noreferrer"
      >
        Deep links
      </a>
    </div>
  );
}

export function LayerStatus({
  label,
  ok,
  schemaUrl,
}: {
  label: string;
  ok: boolean;
  schemaUrl?: string;
}): ReactElement {
  return (
    <span style={{ marginRight: 12 }}>
      {label}
      {schemaUrl ? (
        <>
          {" "}
          (
          <a href={schemaUrl} style={{ color: "#93c5fd" }}>
            schema
          </a>
          )
        </>
      ) : null}
      {": "}
      <span style={{ color: ok ? "#4ade80" : "#f87171" }}>{ok ? "ok" : "failed"}</span>
    </span>
  );
}

export function ErrorList({
  title,
  errors,
}: {
  title: string;
  errors: Array<{ path: string; message: string }>;
}): ReactElement | null {
  if (errors.length === 0) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 18, color: "#f87171", fontSize: 12 }}>
        {errors.map((item) => (
          <li key={`${title}:${item.path}:${item.message}`}>
            <code>{item.path}</code> — {item.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function importSummary(exported: ShareExport, shape: ImportShape | null = "share"): string {
  if (exported.kind === "workspace") {
    return `Workspace · ${exported.name} · ${exported.dashboards.length} dashboard${
      exported.dashboards.length === 1 ? "" : "s"
    }`;
  }

  if (shape === "runtime") {
    const title =
      exported.spec.layout === "embed"
        ? exported.spec.dashboard?.title
        : exported.spec.wall?.title;
    return `Runtime spec · ${title ?? exported.name}`;
  }

  return `Dashboard · ${exported.name}`;
}

const validateCopyButtonStyle = {
  fontSize: 11,
  padding: "4px 10px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#1e293b",
  color: "#e2e8f0",
  cursor: "pointer",
  flexShrink: 0,
} as const;

export function ValidateCommandCopy({
  command,
  label = "Copy validate",
}: {
  command: string;
  label?: string;
}): ReactElement {
  const [copied, setCopied] = useState(false);

  const copy = async (): Promise<void> => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
      <code
        style={{
          flex: 1,
          fontFamily: "ui-monospace, monospace",
          fontSize: 11,
          color: "#cbd5e1",
          wordBreak: "break-all",
        }}
      >
        {command}
      </code>
      <button type="button" onClick={() => void copy()} style={validateCopyButtonStyle}>
        {copied ? "Copied" : label}
      </button>
    </div>
  );
}
