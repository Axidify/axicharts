import type { ReactElement } from "react";
import type { ImportShape, ShareExport } from "@axicharts/charts-runtime/validation";

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
