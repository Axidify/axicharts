"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactElement } from "react";
import { Chart } from "../Chart";
import {
  BLOCKS_PLAYGROUND_PRESETS,
  findPlaygroundPreset,
  presetSpecJson,
  type BlocksPlaygroundPreset,
} from "./presets";
import { evaluatePlaygroundSpec, parsePlaygroundData } from "./evaluate";
import { createCartesianPanel } from "../createCartesianPanel";
import {
  dataColumnsChanged,
  dataFieldSignature,
  plannerReviewMessage,
} from "./playgroundReview";

export type BlocksPlaygroundProps = {
  initialPresetId?: string;
  /** Compact layout for Storybook sidebars */
  compact?: boolean;
};

const paneStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  background: "#ffffff",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
};

const paneHeader: CSSProperties = {
  padding: "10px 14px",
  borderBottom: "1px solid #e2e8f0",
  fontSize: 13,
  fontWeight: 600,
  background: "#f8fafc",
};

const chipStyle: CSSProperties = {
  fontSize: 12,
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  color: "#1e293b",
  cursor: "pointer",
};

function activeChip(active: boolean): CSSProperties {
  return {
    ...chipStyle,
    background: active ? "#dbeafe" : "#f8fafc",
    borderColor: active ? "#93c5fd" : "#cbd5e1",
    fontWeight: active ? 600 : 400,
  };
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function CopyButton({
  label,
  text,
}: {
  label: string;
  text: string;
}): ReactElement {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void copyText(text).then((ok) => {
          if (ok) {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }
        });
      }}
      style={{
        fontSize: 11,
        padding: "4px 10px",
        borderRadius: 6,
        border: "1px solid #cbd5e1",
        background: copied ? "#dcfce7" : "#fff",
        cursor: "pointer",
      }}
    >
      {copied ? "Copied" : label}
    </button>
  );
}

export function BlocksPlayground({
  initialPresetId = "revenue-target",
  compact = false,
}: BlocksPlaygroundProps): ReactElement {
  const initial = findPlaygroundPreset(initialPresetId) ?? BLOCKS_PLAYGROUND_PRESETS[0]!;
  const [presetId, setPresetId] = useState(initial.id);
  const [rows, setRows] = useState(initial.rows);
  const [specText, setSpecText] = useState(() => presetSpecJson(initial));
  const [dataText, setDataText] = useState(() => JSON.stringify(initial.rows, null, 2));
  const [showDataEditor, setShowDataEditor] = useState(false);
  const [intent, setIntent] = useState(initial.intent ?? "");
  const [needsReview, setNeedsReview] = useState(false);
  const [reviewReason, setReviewReason] = useState<string | null>(null);
  const [specRemapped, setSpecRemapped] = useState(false);
  const dataFieldSignatureRef = useRef<string | null>(null);

  const loadPreset = useCallback((preset: BlocksPlaygroundPreset) => {
    setPresetId(preset.id);
    setRows(preset.rows);
    setSpecText(presetSpecJson(preset));
    setDataText(JSON.stringify(preset.rows, null, 2));
    setNeedsReview(false);
    setReviewReason(null);
    setSpecRemapped(false);
    dataFieldSignatureRef.current = dataFieldSignature(preset.rows);
  }, []);

  const dataParse = useMemo(() => parsePlaygroundData(dataText), [dataText]);
  const dataParseError = dataParse.ok ? undefined : dataParse.error;
  const parsedRows = dataParse.ok ? dataParse.rows : rows;
  const currentDataSignature = useMemo(
    () => (dataParse.ok ? dataFieldSignature(parsedRows) : ""),
    [dataParse.ok, parsedRows],
  );

  const applyPlannerResult = useCallback(
    (result: ReturnType<typeof createCartesianPanel>, remapped = false) => {
      setSpecText(JSON.stringify(result.panel, null, 2));
      setNeedsReview(result.needsReview);
      setReviewReason(result.reviewReason);
      if (remapped) {
        setSpecRemapped(true);
        window.setTimeout(() => setSpecRemapped(false), 4000);
      }
    },
    [],
  );

  const generateFromIntent = useCallback(
    (remapped = false) => {
      const fields =
        Array.isArray(parsedRows) && parsedRows.length > 0
          ? Object.keys(parsedRows[0] ?? {})
          : Array.isArray(initial.rows) && initial.rows.length > 0
            ? Object.keys(initial.rows[0] ?? {})
            : [];
      applyPlannerResult(createCartesianPanel({ intent, fields }), remapped);
    },
    [applyPlannerResult, initial.rows, intent, parsedRows],
  );

  useEffect(() => {
    if (!dataParse.ok || !intent.trim()) return;

    if (dataFieldSignatureRef.current === null) {
      dataFieldSignatureRef.current = currentDataSignature;
      return;
    }

    if (
      dataColumnsChanged(dataFieldSignatureRef.current, currentDataSignature)
    ) {
      dataFieldSignatureRef.current = currentDataSignature;
      generateFromIntent(true);
    }
  }, [currentDataSignature, dataParse.ok, generateFromIntent, intent]);

  const evaluation = useMemo(
    () => evaluatePlaygroundSpec(specText, parsedRows),
    [specText, parsedRows],
  );

  const canShowChart =
    evaluation.canRender && evaluation.panel && !dataParseError;

  const dataSpecMismatch = evaluation.errors.some(
    (error) => error.code === "UNKNOWN_FIELD",
  );

  const reviewBannerText =
    needsReview && reviewReason
      ? plannerReviewMessage(reviewReason as "vague_intent" | "no_data_mark")
      : null;

  const reviewBannerStyle: CSSProperties = {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #f59e0b",
    background: "#fffbeb",
    fontSize: 12,
    color: "#92400e",
    fontWeight: 500,
  };

  const gridStyle: CSSProperties = compact
    ? { display: "grid", gap: 12, gridTemplateColumns: "1fr" }
    : {
        display: "grid",
        gap: 16,
        gridTemplateColumns: "minmax(240px, 1fr) minmax(280px, 1.1fr) minmax(240px, 1fr)",
        alignItems: "stretch",
      };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: "#475569", maxWidth: 720 }}>
          Edit cartesian <code>marks[]</code> JSON — validation runs before render. Ejected JSX
          uses the same composable blocks agents target via <code>createCartesianPanel</code> (C139).
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {BLOCKS_PLAYGROUND_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              style={activeChip(preset.id === presetId)}
              onClick={() => loadPreset(preset)}
              title={preset.intent}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            style={activeChip(showDataEditor)}
            onClick={() => setShowDataEditor((v) => !v)}
          >
            {showDataEditor ? "Hide data" : "Edit data"}
          </button>
        </div>
        {findPlaygroundPreset(presetId)?.description ? (
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "#64748b" }}>
            {findPlaygroundPreset(presetId)!.description}
            {findPlaygroundPreset(presetId)!.intent ? (
              <>
                {" "}
                · Intent: <em>{findPlaygroundPreset(presetId)!.intent}</em>
              </>
            ) : null}
          </p>
        ) : null}
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <input
            type="text"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="Intent → createCartesianPanel (C139 rules)"
            style={{
              flex: "1 1 280px",
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              fontSize: 13,
            }}
          />
          <button
            type="button"
            style={chipStyle}
            onClick={() => generateFromIntent()}
          >
            Generate spec
          </button>
        </div>
        {specRemapped ? (
          <div
            role="status"
            style={{
              ...reviewBannerStyle,
              marginTop: 12,
              borderColor: "#93c5fd",
              background: "#eff6ff",
              color: "#1e40af",
            }}
          >
            Data columns changed — spec remapped from current intent.
          </div>
        ) : null}
        {reviewBannerText ? (
          <div role="alert" style={reviewBannerStyle}>
            <strong style={{ display: "block", marginBottom: 4 }}>Planner needs review</strong>
            {reviewBannerText}
          </div>
        ) : null}
      </div>

      {showDataEditor ? (
        <div style={paneStyle}>
          <div style={paneHeader}>Sample data (rows)</div>
          <textarea
            value={dataText}
            onChange={(e) => setDataText(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              minHeight: 120,
              margin: 0,
              padding: 12,
              border: "none",
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
              resize: "vertical",
            }}
          />
          {dataParseError ? (
            <div
              style={{
                padding: "8px 12px",
                borderTop: "1px solid #e2e8f0",
                fontSize: 11,
                color: "#b91c1c",
              }}
            >
              Data parse error: {dataParseError}
            </div>
          ) : dataSpecMismatch && !intent.trim() ? (
            <div
              style={{
                padding: "8px 12px",
                borderTop: "1px solid #e2e8f0",
                fontSize: 11,
                color: "#b45309",
              }}
            >
              Data columns don&apos;t match the spec. Add an intent and click Generate spec, or
              edit marks manually.
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={gridStyle}>
        <div style={paneStyle}>
          <div
            style={{
              ...paneHeader,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>Spec</span>
            <CopyButton label="Copy JSON" text={specText} />
          </div>
          <textarea
            value={specText}
            onChange={(e) => setSpecText(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              minHeight: compact ? 200 : 320,
              margin: 0,
              padding: 12,
              border: "none",
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
              lineHeight: 1.45,
              resize: "vertical",
            }}
          />
          <div style={{ padding: "8px 12px", borderTop: "1px solid #e2e8f0", fontSize: 11 }}>
            {reviewBannerText ? (
              <div
                role="alert"
                style={{
                  marginBottom: 8,
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid #f59e0b",
                  background: "#fffbeb",
                  color: "#92400e",
                }}
              >
                <strong>Planner:</strong> {reviewBannerText}
              </div>
            ) : null}
            {evaluation.parseError ? (
              <span style={{ color: "#b91c1c" }}>Parse: {evaluation.parseError}</span>
            ) : evaluation.errors.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 18, color: "#b91c1c" }}>
                {evaluation.errors.map((err) => (
                  <li key={`${err.code}-${err.path}`}>
                    <code>{err.code}</code> @ {err.path}: {err.message}
                    {err.suggestion ? ` → try "${err.suggestion}"` : ""}
                  </li>
                ))}
              </ul>
            ) : evaluation.warnings.length > 0 ? (
              <div>
                <span style={{ color: "#b45309", fontWeight: 600 }}>
                  Valid · {evaluation.warnings.length} warning
                  {evaluation.warnings.length === 1 ? "" : "s"}
                </span>
                <ul style={{ margin: "6px 0 0", paddingLeft: 18, color: "#b45309" }}>
                  {evaluation.warnings.map((w) => (
                    <li key={`${w.code}-${w.path}`}>
                      <code>{w.code}</code>: {w.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <span style={{ color: "#15803d" }}>Valid cartesian spec</span>
            )}
          </div>
        </div>

        <div style={paneStyle}>
          <div style={paneHeader}>Chart</div>
          <div style={{ flex: 1, padding: 12, minHeight: compact ? 200 : 320 }}>
            {canShowChart ? (
              <Chart panel={evaluation.panel!} data={parsedRows} width="100%" />
            ) : (
              <div
                style={{
                  height: "100%",
                  minHeight: 180,
                  display: "grid",
                  placeItems: "center",
                  color: "#94a3b8",
                  fontSize: 13,
                  textAlign: "center",
                  padding: 16,
                }}
              >
                {dataParseError
                  ? "Fix data JSON to preview the chart"
                  : "Fix validation errors to preview the chart"}
              </div>
            )}
          </div>
        </div>

        <div style={paneStyle}>
          <div
            style={{
              ...paneHeader,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>Ejected JSX</span>
            {evaluation.ejected ? (
              <CopyButton label="Copy code" text={evaluation.ejected} />
            ) : null}
          </div>
          <pre
            style={{
              flex: 1,
              margin: 0,
              padding: 12,
              overflow: "auto",
              fontSize: 10,
              lineHeight: 1.45,
              background: "#0f172a",
              color: "#e2e8f0",
              minHeight: compact ? 200 : 320,
            }}
          >
            {evaluation.ejected ?? "// Valid spec required to eject composable JSX"}
          </pre>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
        Custom SVG (<code>renderPath</code> / <code>renderBar</code>) is L3 composable-only — not
        expressible in <code>marks[]</code> v1. See Storybook <strong>Charts/Static SVG custom</strong>.
      </p>
    </div>
  );
}
