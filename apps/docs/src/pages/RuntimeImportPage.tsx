import { useEffect, useMemo, useState, type ReactElement } from "react";
import { Link } from "react-router-dom";
import {
  fetchImportPreset,
  hostedImportPresetUrl,
  HOSTED_IMPORT_PRESETS,
  localImportPresetUrl,
  validatePortableImportJson,
  type HostedImportPreset,
  type ImportPresetSource,
} from "@axicharts/charts-runtime/validation";

const base = import.meta.env.BASE_URL;

function sourceLabel(source: ImportPresetSource): string {
  if (source === "hosted") return "GitHub Pages";
  if (source === "local") return "docs mirror";
  return "bundled fixture";
}

function PresetCard({ preset }: { preset: HostedImportPreset }): ReactElement {
  const [json, setJson] = useState("");
  const [source, setSource] = useState<ImportPresetSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void fetchImportPreset(preset, { localBaseUrl: `${base}examples/` })
      .then((result) => {
        if (cancelled) return;
        setJson(result.json);
        setSource(result.source);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        const message = loadError instanceof Error ? loadError.message : String(loadError);
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [preset.id]);

  const validation = useMemo(() => validatePortableImportJson(json), [json]);
  const localUrl = localImportPresetUrl(preset, `${base}examples/`);
  const hostedUrl = hostedImportPresetUrl(preset);

  const copy = async (): Promise<void> => {
    if (!json) return;
    await navigator.clipboard.writeText(json);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <article
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div>
          <strong>{preset.label}</strong>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            <code>{preset.filename}</code>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void copy()}
          disabled={!json || loading}
          style={{
            fontSize: 12,
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #cbd5e1",
            background: "#f8fafc",
            cursor: json ? "pointer" : "not-allowed",
          }}
        >
          {copied ? "Copied" : "Copy JSON"}
        </button>
      </div>

      <div style={{ padding: 16 }}>
        {loading ? (
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Loading example…</p>
        ) : error ? (
          <p style={{ margin: 0, fontSize: 13, color: "#b91c1c" }}>{error}</p>
        ) : (
          <>
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 12, lineHeight: 1.8 }}>
              Source: <strong>{source ? sourceLabel(source) : "unknown"}</strong>
              {" · "}
              JSON Schema:{" "}
              <span style={{ color: validation.schemaOk ? "#15803d" : "#b91c1c" }}>
                {validation.schemaOk ? "ok" : "failed"}
              </span>
              {" · "}
              Semantic:{" "}
              <span style={{ color: validation.semanticOk ? "#15803d" : "#b91c1c" }}>
                {validation.semanticOk ? "ok" : "failed"}
              </span>
            </div>
            <div style={{ fontSize: 12, marginBottom: 12 }}>
              <a href={localUrl} style={{ color: "#2563eb", marginRight: 12 }}>
                Docs mirror
              </a>
              <a href={hostedUrl} style={{ color: "#2563eb" }}>
                GitHub Pages
              </a>
            </div>
            <pre
              style={{
                margin: 0,
                padding: 14,
                background: "#0f172a",
                color: "#e2e8f0",
                fontSize: 11,
                lineHeight: 1.5,
                overflow: "auto",
                maxHeight: 240,
                borderRadius: 8,
              }}
            >
              {json}
            </pre>
          </>
        )}
      </div>
    </article>
  );
}

export function RuntimeImportPage(): ReactElement {
  return (
    <div>
      <p style={{ marginTop: 0, fontSize: 13, color: "#64748b" }}>
        <Link to="/runtime">Runtime SDK</Link> / Import gallery
      </p>
      <h1 style={{ marginTop: 8 }}>Import gallery</h1>
      <p style={{ color: "#475569", maxWidth: 720, lineHeight: 1.6 }}>
        Shipped runtime and share export fixtures with <code>$schema</code> hints. The loader tries
        GitHub Pages first, then the docs site mirror under <code>/examples/</code>, then bundled
        fixtures in Dashboarder. Each card runs the same dual JSON Schema + semantic gate used by{" "}
        <code>charts-runtime validate --all</code>.
      </p>

      <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
        {HOSTED_IMPORT_PRESETS.map((preset) => (
          <PresetCard key={preset.id} preset={preset} />
        ))}
      </div>

      <p style={{ marginTop: 24, fontSize: 13, color: "#64748b" }}>
        See also{" "}
        <Link to="/runtime/schema" style={{ color: "#2563eb" }}>
          Runtime schema
        </Link>{" "}
        for validation CLI flags and editor <code>$schema</code> snippets.
      </p>
    </div>
  );
}
