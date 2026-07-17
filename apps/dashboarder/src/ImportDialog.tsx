import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import {
  SHARE_EXPORT_SCHEMA_URL,
  validateShareExportJson,
  type ShareExport,
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

export type ImportDialogProps = {
  open: boolean;
  initialJson?: string;
  initialFilename?: string;
  onClose: () => void;
  onApply: (exported: ShareExport) => void;
};

function importSummary(exported: ShareExport): string {
  if (exported.kind === "workspace") {
    return `Workspace · ${exported.name} · ${exported.dashboards.length} dashboard${
      exported.dashboards.length === 1 ? "" : "s"
    }`;
  }
  return `Dashboard · ${exported.name}`;
}

export function ImportDialog({
  open,
  initialJson = "",
  initialFilename,
  onClose,
  onApply,
}: ImportDialogProps): ReactElement | null {
  const [jsonText, setJsonText] = useState(initialJson);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setJsonText(initialJson);
    }
  }, [open, initialJson]);

  const validation = useMemo(() => validateShareExportJson(jsonText), [jsonText]);

  if (!open) return null;

  const loadFile = async (file: File): Promise<void> => {
    setJsonText(await file.text());
  };

  return (
    <div style={overlayStyle} role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-labelledby="import-title"
        style={panelStyle}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div id="import-title" style={{ fontSize: 16, fontWeight: 700 }}>
              Import JSON
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
              Validates against{" "}
              <a href={SHARE_EXPORT_SCHEMA_URL} style={{ color: "#93c5fd" }}>
                share-export.schema.json
              </a>
              {initialFilename ? ` · ${initialFilename}` : null}
              {validation.ok ? (
                <span style={{ color: "#4ade80" }}> · {importSummary(validation.export)}</span>
              ) : jsonText.trim() ? (
                <span style={{ color: "#f87171" }}>
                  {" "}
                  · {validation.errors.length} validation issue
                  {validation.errors.length === 1 ? "" : "s"}
                </span>
              ) : (
                <span> · paste JSON or choose a file</span>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} style={buttonStyle}>
            Cancel
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button type="button" onClick={() => fileInputRef.current?.click()} style={buttonStyle}>
            Choose file
          </button>
          <button
            type="button"
            disabled={!validation.ok}
            onClick={() => {
              if (!validation.ok) return;
              onApply(validation.export);
              onClose();
            }}
            style={{ ...buttonStyle, marginLeft: "auto" }}
          >
            Apply import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void loadFile(file);
            }}
          />
        </div>

        <textarea
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
          spellCheck={false}
          placeholder='{ "version": 1, "kind": "dashboard", ... }'
          style={{
            marginTop: 12,
            width: "100%",
            minHeight: 280,
            boxSizing: "border-box",
            padding: 14,
            borderRadius: 8,
            background: "#020617",
            border: `1px solid ${validation.ok || !jsonText.trim() ? "#334155" : "#7f1d1d"}`,
            color: "#e2e8f0",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11,
            lineHeight: 1.5,
            resize: "vertical",
          }}
        />

        {!validation.ok && jsonText.trim() ? (
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
