import { useEffect, useMemo, useState, type ReactElement } from "react";
import {
  getActiveWorkspace,
  serializeDashboardExport,
  serializeWorkspaceExport,
  SHARE_EXPORT_SCHEMA_URL,
  validateShareExportJson,
  type RuntimeDashboardSpec,
  type SavedDashboard,
  type WorkspaceStore,
} from "@axicharts/charts-runtime";

const overlayStyle = {
  position: "fixed" as const,
  inset: 0,
  zIndex: 60,
  background: "rgba(2, 6, 23, 0.72)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const panelStyle = {
  width: "min(720px, 100%)",
  maxHeight: "min(720px, 100%)",
  overflow: "auto",
  background: "#0f172a",
  color: "#e2e8f0",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: 20,
};

const buttonStyle = {
  fontSize: 12,
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#1e293b",
  color: "#e2e8f0",
  cursor: "pointer",
} as const;

type ShareTab = "dashboard" | "workspace";

export type ShareDialogProps = {
  open: boolean;
  initialTab?: ShareTab;
  store: WorkspaceStore;
  dashboard: SavedDashboard;
  spec: RuntimeDashboardSpec;
  meta: SavedDashboard["meta"];
  onClose: () => void;
};

function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function downloadJson(filename: string, json: string): void {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ShareDialog({
  open,
  initialTab = "dashboard",
  store,
  dashboard,
  spec,
  meta,
  onClose,
}: ShareDialogProps): ReactElement | null {
  const [tab, setTab] = useState<ShareTab>(initialTab);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
    }
  }, [open, initialTab]);

  const workspace = useMemo(() => getActiveWorkspace(store), [store]);

  const exportJson = useMemo(() => {
    if (tab === "workspace") {
      return serializeWorkspaceExport(workspace);
    }
    return serializeDashboardExport(dashboard.name, spec, meta);
  }, [tab, workspace, dashboard.name, spec, meta]);

  const validation = useMemo(() => validateShareExportJson(exportJson), [exportJson]);

  if (!open) return null;

  const filename =
    tab === "workspace"
      ? `${slugifyName(workspace.name) || "workspace"}.workspace.json`
      : `${slugifyName(dashboard.name) || "dashboard"}.runtime.json`;

  const copy = async (): Promise<void> => {
    await navigator.clipboard.writeText(exportJson);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={overlayStyle} role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-labelledby="share-title"
        style={panelStyle}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div id="share-title" style={{ fontSize: 16, fontWeight: 700 }}>
              Share export
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
              Portable JSON envelopes with version, kind, exportedAt, and{" "}
              <a href={SHARE_EXPORT_SCHEMA_URL} style={{ color: "#93c5fd" }}>
                $schema
              </a>{" "}
              hints
              {validation.ok ? (
                <span style={{ color: "#4ade80" }}> · validated</span>
              ) : (
                <span style={{ color: "#f87171" }}>
                  {" "}
                  · {validation.errors.length} validation issue
                  {validation.errors.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} style={buttonStyle}>
            Close
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {(
            [
              ["dashboard", `Dashboard · ${dashboard.name}`],
              ["workspace", `Workspace · ${workspace.dashboards.length} dashboards`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              style={{
                ...buttonStyle,
                background: tab === id ? "#334155" : "#1e293b",
              }}
            >
              {label}
            </button>
          ))}
          <button type="button" onClick={() => void copy()} disabled={!validation.ok} style={{ ...buttonStyle, marginLeft: "auto" }}>
            {copied ? "Copied" : "Copy JSON"}
          </button>
          <button
            type="button"
            onClick={() => downloadJson(filename, exportJson)}
            disabled={!validation.ok}
            style={buttonStyle}
          >
            Download
          </button>
        </div>

        <pre
          style={{
            marginTop: 12,
            padding: 14,
            borderRadius: 8,
            background: "#020617",
            border: "1px solid #334155",
            fontSize: 11,
            lineHeight: 1.5,
            overflow: "auto",
            maxHeight: 420,
          }}
        >
          {exportJson}
        </pre>
        {!validation.ok ? (
          <ul style={{ margin: "12px 0 0", paddingLeft: 18, color: "#f87171", fontSize: 12 }}>
            {validation.errors.map((item) => (
              <li key={`${item.path}:${item.message}`}>
                <code>{item.path}</code> — {item.message}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
