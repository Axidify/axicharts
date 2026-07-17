import { useMemo, useState, type ReactElement } from "react";
import {
  buildEmbedBundle,
  validateRuntimeSpecJson,
  type RuntimeDashboardSpec,
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

type EmbedTab = "react" | "inline" | "json";

export type EmbedDialogProps = {
  open: boolean;
  spec: RuntimeDashboardSpec;
  presentation?: boolean;
  alarmScopeId?: string;
  onClose: () => void;
};

export function EmbedDialog({
  open,
  spec,
  presentation = false,
  alarmScopeId,
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

  const validation = useMemo(() => validateRuntimeSpecJson(bundle.specJson), [bundle.specJson]);

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
              {validation.error
                ? `Spec validation failed: ${validation.error}`
                : "Portable runtime spec validated"}
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
          <button type="button" onClick={() => void copy()} style={{ ...buttonStyle, marginLeft: "auto" }}>
            {copied ? "Copied" : "Copy"}
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
          {activeText}
        </pre>
      </div>
    </div>
  );
}
