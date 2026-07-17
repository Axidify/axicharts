import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import {
  RUNTIME_SPEC_SCHEMA_URL,
  SHARE_EXPORT_SCHEMA_URL,
  type ShareExport,
} from "@axicharts/charts-runtime";
import { validateShareImportJson } from "@axicharts/charts-runtime/validation";

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

function LayerStatus({
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

function ErrorList({
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

  const validation = useMemo(() => validateShareImportJson(jsonText), [jsonText]);
  const hasInput = jsonText.trim().length > 0;

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
              {initialFilename ? `${initialFilename} · ` : null}
              {hasInput ? (
                <>
                  <LayerStatus
                    label="JSON Schema"
                    ok={validation.schemaOk}
                    schemaUrl={SHARE_EXPORT_SCHEMA_URL}
                  />
                  <LayerStatus label="Semantic" ok={validation.semanticOk} />
                  {validation.ok && validation.export ? (
                    <span style={{ color: "#4ade80" }}>{importSummary(validation.export)}</span>
                  ) : null}
                </>
              ) : (
                <span>
                  Paste JSON or choose a file · expects share export or bare runtime with{" "}
                  <a href={RUNTIME_SPEC_SCHEMA_URL} style={{ color: "#93c5fd" }}>
                    $schema
                  </a>
                </span>
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
            disabled={!validation.ok || !validation.export}
            onClick={() => {
              if (!validation.ok || !validation.export) return;
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
          placeholder='{ "$schema": "...", "version": 1, "kind": "dashboard", ... }'
          style={{
            marginTop: 12,
            width: "100%",
            minHeight: 280,
            boxSizing: "border-box",
            padding: 14,
            borderRadius: 8,
            background: "#020617",
            border: `1px solid ${validation.ok || !hasInput ? "#334155" : "#7f1d1d"}`,
            color: "#e2e8f0",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11,
            lineHeight: 1.5,
            resize: "vertical",
          }}
        />

        {hasInput && !validation.ok ? (
          <>
            <ErrorList title="JSON Schema" errors={validation.schemaErrors} />
            <ErrorList title="Semantic" errors={validation.semanticErrors} />
          </>
        ) : null}
      </div>
    </div>
  );
}
