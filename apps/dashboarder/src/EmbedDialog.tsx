import { useMemo, useState, type ReactElement } from "react";
import { buildEmbedBundle, RUNTIME_SPEC_SCHEMA_URL, type RuntimeDashboardSpec } from "@axicharts/charts-runtime";
import {
  dashboarderImportDeepLink,
  docsImportGalleryDeepLink,
  formatValidatePresetCommand,
  PLANNER_FEED_ROWS,
  plannerAdapterFixtures,
  plannerFeedGalleryDeepLink,
  runtimeEmbedReferencePreset,
  feedAdapterGalleryDeepLink,
  validateRuntimeSpecDualJson,
} from "@axicharts/charts-runtime/validation";
import type { FeedMode, LayoutMode } from "./runtime/buildRuntimeSpec";
import { ErrorList, LayerStatus, ValidateCommandCopy } from "./validationChrome";

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

type EmbedTab = "react" | "inline" | "json";

export type EmbedDialogProps = {
  open: boolean;
  spec: RuntimeDashboardSpec;
  presentation?: boolean;
  alarmScopeId?: string;
  feed?: FeedMode;
  layout?: LayoutMode;
  onClose: () => void;
};

function runtimeTitle(spec: RuntimeDashboardSpec | undefined): string | undefined {
  if (!spec) return undefined;
  return spec.layout === "embed" ? spec.dashboard?.title : spec.wall?.title;
}

export function EmbedDialog({
  open,
  spec,
  presentation = false,
  alarmScopeId,
  feed,
  layout = "embed",
  onClose,
}: EmbedDialogProps): ReactElement | null {
  const [tab, setTab] = useState<EmbedTab>("react");
  const [copied, setCopied] = useState(false);

  const bundle = useMemo(
    () =>
      buildEmbedBundle(spec, {
        presentation,
        alarmScopeId,
      }),
    [spec, presentation, alarmScopeId],
  );

  const validation = useMemo(
    () => validateRuntimeSpecDualJson(bundle.specJson),
    [bundle.specJson],
  );

  const referencePreset = runtimeEmbedReferencePreset(spec.layout);
  const feedRow = feed ? PLANNER_FEED_ROWS.find((row) => row.feed === feed) : undefined;
  const plannerFixtures =
    feed != null
      ? plannerAdapterFixtures({
          layout: layout ?? spec.layout,
          feed,
        })
      : [];

  if (!open) return null;

  const activeText =
    tab === "react"
      ? bundle.reactSnippet
      : tab === "inline"
        ? bundle.inlineReactSnippet
        : bundle.specJson;

  const copy = async (): Promise<void> => {
    await navigator.clipboard.writeText(activeText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const title = runtimeTitle(validation.spec ?? spec);

  return (
    <div style={overlayStyle} role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-labelledby="embed-title"
        style={panelStyle}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div id="embed-title" style={{ fontSize: 16, fontWeight: 700 }}>
              Embed SDK
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
              Portable runtime JSON with{" "}
              <a href={RUNTIME_SPEC_SCHEMA_URL} style={{ color: "#93c5fd" }}>
                $schema
              </a>
              {" · "}
              <LayerStatus
                label="JSON Schema"
                ok={validation.schemaOk}
                schemaUrl={validation.schemaUrl}
              />
              <LayerStatus label="Semantic" ok={validation.semanticOk} />
              {validation.ok ? (
                <span style={{ color: "#4ade80" }}>
                  Runtime spec · {title ?? "dashboard"}
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
              ["react", "React + JSON file"],
              ["inline", "React inline spec"],
              ["json", "Runtime JSON"],
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
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <pre
          style={{
            marginTop: 12,
            padding: 14,
            borderRadius: 8,
            background: "#020617",
            border: `1px solid ${validation.ok ? "#334155" : "#7f1d1d"}`,
            fontSize: 11,
            lineHeight: 1.5,
            overflow: "auto",
            maxHeight: 420,
          }}
        >
          {activeText}
        </pre>

        {!validation.ok ? (
          <>
            <ErrorList title="JSON Schema" errors={validation.schemaErrors} />
            <ErrorList title="Semantic" errors={validation.semanticErrors} />
          </>
        ) : null}

        {feed && feedRow ? (
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
            Builder feed: <strong style={{ color: "#e2e8f0" }}>{feed}</strong>
            {" · "}
            Planner intent: <em>{feedRow.intentSample}</em>
            {" · "}
            <a
              href={feedAdapterGalleryDeepLink(feed, layout ?? spec.layout)}
              style={{ color: "#93c5fd" }}
              target="_blank"
              rel="noreferrer"
            >
              Gallery
            </a>
            {" · "}
            <a
              href={plannerFeedGalleryDeepLink(feed)}
              style={{ color: "#93c5fd" }}
              target="_blank"
              rel="noreferrer"
            >
              Planner index
            </a>
            {plannerFixtures.length > 1 ? (
              <>
                {" · "}
                Fixtures:{" "}
                <strong style={{ color: "#e2e8f0" }}>
                  {plannerFixtures.map((item) => item.preset.id).join(" + ")}
                </strong>
              </>
            ) : null}
          </div>
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
            Shipped {spec.layout} preset:{" "}
            <strong style={{ color: "#e2e8f0" }}>{referencePreset.label}</strong>
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
      </div>
    </div>
  );
}
