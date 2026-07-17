import { useEffect, useMemo, useState, type ReactElement } from "react";
import {
  getActiveWorkspace,
  serializeDashboardExport,
  serializeWorkspaceExport,
  SHARE_EXPORT_SCHEMA_URL,
  type RuntimeDashboardSpec,
  type SavedDashboard,
  type WorkspaceStore,
} from "@axicharts/charts-runtime";
import {
  dashboarderImportDeepLink,
  docsImportGalleryDeepLink,
  feedAdapterGalleryDeepLink,
  formatValidatePresetCommand,
  PLANNER_FEED_ROWS,
  plannerAdapterFixtures,
  plannerFeedGalleryDeepLink,
  plannerFeedGalleryIndexDeepLink,
  shareExportReferencePreset,
  validateShareExportDualJson,
} from "@axicharts/charts-runtime/validation";
import { ErrorList, importSummary, LayerStatus, ShareImportDocsLinks, ValidateCommandCopy } from "./validationChrome";

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

  const validation = useMemo(() => validateShareExportDualJson(exportJson), [exportJson]);
  const referencePreset =
    tab === "workspace" || tab === "dashboard" ? shareExportReferencePreset(tab) : undefined;
  const feedRow = meta?.feed ? PLANNER_FEED_ROWS.find((row) => row.feed === meta.feed) : undefined;
  const plannerFixtures =
    meta?.feed != null
      ? plannerAdapterFixtures({
          layout: meta.layout ?? "embed",
          feed: meta.feed,
        })
      : [];
  const workspaceMetaCount = workspace.dashboards.filter((item) => item.meta?.feed).length;

  if (!open) return null;

  const filename =
    tab === "workspace"
      ? `${slugifyName(workspace.name) || "workspace"}.workspace.json`
      : `${slugifyName(dashboard.name) || "dashboard"}.share.json`;

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
              {" · "}
              <LayerStatus
                label="JSON Schema"
                ok={validation.schemaOk}
                schemaUrl={validation.schemaUrl}
              />
              <LayerStatus label="Semantic" ok={validation.semanticOk} />
              {validation.ok && validation.export ? (
                <span style={{ color: "#4ade80" }}>
                  {importSummary(validation.export, validation.shape)}
                </span>
              ) : null}
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
          <button
            type="button"
            onClick={() => void copy()}
            disabled={!validation.ok}
            style={{ ...buttonStyle, marginLeft: "auto" }}
          >
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
          <>
            <ErrorList title="JSON Schema" errors={validation.schemaErrors} />
            <ErrorList title="Semantic" errors={validation.semanticErrors} />
          </>
        ) : null}

        {referencePreset ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#111827",
              fontSize: 12,
              color: "#94a3b8",
              lineHeight: 1.7,
            }}
          >
            Shipped {tab} preset: <strong style={{ color: "#e2e8f0" }}>{referencePreset.label}</strong>
            {" · "}
            <a
              href={docsImportGalleryDeepLink(referencePreset.id)}
              style={{ color: "#93c5fd" }}
              target="_blank"
              rel="noreferrer"
            >
              Gallery
            </a>
            {" · "}
            <a href={dashboarderImportDeepLink(referencePreset.id)} style={{ color: "#93c5fd" }}>
              Import in app
            </a>
            <ValidateCommandCopy command={formatValidatePresetCommand(referencePreset.id)} />
          </div>
        ) : null}

        {tab === "dashboard" && meta ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#111827",
              fontSize: 12,
              color: "#94a3b8",
              lineHeight: 1.7,
            }}
          >
            <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>
              Planner meta export
            </div>
            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "88px 1fr",
                gap: "4px 12px",
                margin: "0 0 10px",
              }}
            >
              <dt>Layout</dt>
              <dd style={{ margin: 0 }}>{meta.layout}</dd>
              <dt>Feed</dt>
              <dd style={{ margin: 0 }}>
                <code>{meta.feed}</code>
              </dd>
              {meta.template ? (
                <>
                  <dt>Template</dt>
                  <dd style={{ margin: 0 }}>{meta.template}</dd>
                </>
              ) : null}
              {meta.layout === "mosaic" && meta.mosaicPreset ? (
                <>
                  <dt>Mosaic</dt>
                  <dd style={{ margin: 0 }}>{meta.mosaicPreset}</dd>
                </>
              ) : null}
              <dt>Presentation</dt>
              <dd style={{ margin: 0 }}>{meta.presentation ? "Yes" : "No"}</dd>
            </dl>
            {feedRow ? (
              <div style={{ marginBottom: 8 }}>
                Planner intent: <em>{feedRow.intentSample}</em>
              </div>
            ) : null}
            {meta.feed ? (
              <>
                <a
                  href={feedAdapterGalleryDeepLink(meta.feed, meta.layout)}
                  style={{ color: "#93c5fd" }}
                  target="_blank"
                  rel="noreferrer"
                >
                  Feed fixture
                </a>
                {" · "}
                <a
                  href={plannerFeedGalleryDeepLink(meta.feed)}
                  style={{ color: "#93c5fd" }}
                  target="_blank"
                  rel="noreferrer"
                >
                  Planner index
                </a>
              </>
            ) : null}
            {plannerFixtures.length > 1 ? (
              <div style={{ marginTop: 8 }}>
                Adapter fixtures:{" "}
                <strong style={{ color: "#e2e8f0" }}>
                  {plannerFixtures.map((item) => item.preset.id).join(" + ")}
                </strong>
              </div>
            ) : null}
            <ShareImportDocsLinks />
          </div>
        ) : null}

        {tab === "workspace" ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#111827",
              fontSize: 12,
              color: "#94a3b8",
              lineHeight: 1.7,
            }}
          >
            Workspace bundle includes planner <code>meta</code> per dashboard (
            {workspaceMetaCount}/{workspace.dashboards.length} with feed). Import restores layout,
            feed, template, and mosaic preset in Dashboarder.
            {" · "}
            <a
              href={plannerFeedGalleryIndexDeepLink()}
              style={{ color: "#93c5fd" }}
              target="_blank"
              rel="noreferrer"
            >
              Planner feed index
            </a>
            <ShareImportDocsLinks />
          </div>
        ) : null}
      </div>
    </div>
  );
}
