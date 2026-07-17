import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import {
  fetchImportPreset,
  HOSTED_IMPORT_PRESETS,
  RUNTIME_SPEC_SCHEMA_URL,
  SHARE_EXPORT_SCHEMA_URL,
  validatePortableImportJson,
  type ImportPresetSource,
  type ShareExport,
} from "@axicharts/charts-runtime/validation";
import { LOCAL_IMPORT_FIXTURES } from "./importPresetFixtures";
import { ErrorList, importSummary, LayerStatus } from "./validationChrome";

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
  initialPresetId?: string;
  onClose: () => void;
  onApply: (exported: ShareExport) => void;
};

function presetSourceLabel(source: ImportPresetSource): string {
  if (source === "hosted") return "GitHub Pages";
  if (source === "local") return "local mirror";
  return "bundled fixture";
}

export function ImportDialog({
  open,
  initialJson = "",
  initialFilename,
  initialPresetId,
  onClose,
  onApply,
}: ImportDialogProps): ReactElement | null {
  const [jsonText, setJsonText] = useState(initialJson);
  const [filename, setFilename] = useState(initialFilename);
  const [loadingPresetId, setLoadingPresetId] = useState<string | null>(null);
  const [presetError, setPresetError] = useState<string | null>(null);
  const [presetSource, setPresetSource] = useState<ImportPresetSource | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setJsonText(initialJson);
      setFilename(initialFilename);
      setPresetError(null);
      setLoadingPresetId(null);
      setPresetSource(null);
    }
  }, [open, initialJson, initialFilename]);

  const validation = useMemo(() => validatePortableImportJson(jsonText), [jsonText]);
  const hasInput = jsonText.trim().length > 0;

  const loadPreset = async (presetId: string): Promise<void> => {
    const preset = HOSTED_IMPORT_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    setLoadingPresetId(preset.id);
    setPresetError(null);
    setPresetSource(null);

    try {
      const result = await fetchImportPreset(preset, {
        localFixtures: LOCAL_IMPORT_FIXTURES,
      });
      setJsonText(result.json);
      setFilename(preset.filename);
      setPresetSource(result.source);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setPresetError(`Failed to load ${preset.label}: ${message}`);
    } finally {
      setLoadingPresetId(null);
    }
  };

  useEffect(() => {
    if (open && initialPresetId) {
      void loadPreset(initialPresetId);
    }
  }, [open, initialPresetId]);

  if (!open) return null;

  const loadFile = async (file: File): Promise<void> => {
    setPresetError(null);
    setPresetSource(null);
    setFilename(file.name);
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
              {filename ? `${filename} · ` : null}
              {presetSource ? (
                <span style={{ color: "#cbd5e1" }}>
                  source: {presetSourceLabel(presetSource)} ·{" "}
                </span>
              ) : null}
              {hasInput ? (
                <>
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
                </>
              ) : (
                <span>
                  Paste share export, workspace bundle, or bare{" "}
                  <code>*.runtime.json</code> with{" "}
                  <a href={RUNTIME_SPEC_SCHEMA_URL} style={{ color: "#93c5fd" }}>
                    $schema
                  </a>{" "}
                  /{" "}
                  <a href={SHARE_EXPORT_SCHEMA_URL} style={{ color: "#93c5fd" }}>
                    share-export
                  </a>
                </span>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} style={buttonStyle}>
            Cancel
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
          {HOSTED_IMPORT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={loadingPresetId !== null}
              onClick={() => void loadPreset(preset.id)}
              style={{
                ...buttonStyle,
                opacity: loadingPresetId === preset.id ? 0.7 : 1,
              }}
            >
              {loadingPresetId === preset.id ? `Loading ${preset.label}…` : preset.label}
            </button>
          ))}
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

        {presetError ? (
          <div style={{ marginTop: 12, fontSize: 12, color: "#f87171" }}>{presetError}</div>
        ) : null}

        <textarea
          value={jsonText}
          onChange={(event) => {
            setPresetError(null);
            setPresetSource(null);
            setJsonText(event.target.value);
          }}
          spellCheck={false}
          placeholder='{ "$schema": "...", "layout": "embed", ... } or share export envelope'
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
