import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  dashboarderImportDeepLink,
  fetchImportPreset,
  formatValidatePresetCommand,
  hostedImportPresetUrl,
  HOSTED_IMPORT_PRESETS,
  localImportPresetUrl,
  validatePortableImportJson,
  type HostedImportPreset,
  type ImportPresetSource,
} from "@axicharts/charts-runtime/validation";

const base = import.meta.env.BASE_URL;

function presetGalleryPath(presetId: string): string {
  return `/runtime/import?preset=${encodeURIComponent(presetId)}`;
}

function sourceLabel(source: ImportPresetSource): string {
  if (source === "hosted") return "GitHub Pages";
  if (source === "local") return "docs mirror";
  return "bundled fixture";
}

function PresetCard({
  preset,
  highlighted,
}: {
  preset: HostedImportPreset;
  highlighted: boolean;
}): ReactElement {
  const cardRef = useRef<HTMLElement | null>(null);
  const [json, setJson] = useState("");
  const [source, setSource] = useState<ImportPresetSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedValidate, setCopiedValidate] = useState(false);

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

  useEffect(() => {
    if (!highlighted || !cardRef.current) return;
    cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [highlighted, loading]);

  const validation = useMemo(() => validatePortableImportJson(json), [json]);
  const localUrl = localImportPresetUrl(preset, `${base}examples/`);
  const hostedUrl = hostedImportPresetUrl(preset);
  const galleryLink = presetGalleryPath(preset.id);
  const dashboarderLink = dashboarderImportDeepLink(preset.id);
  const validateCommand = formatValidatePresetCommand(preset.id);

  const copy = async (): Promise<void> => {
    if (!json) return;
    await navigator.clipboard.writeText(json);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const copyValidate = async (): Promise<void> => {
    await navigator.clipboard.writeText(validateCommand);
    setCopiedValidate(true);
    window.setTimeout(() => setCopiedValidate(false), 1500);
  };

  return (
    <article
      ref={cardRef}
      id={`preset-${preset.id}`}
      style={{
        border: highlighted ? "2px solid #2563eb" : "1px solid #e2e8f0",
        borderRadius: 10,
        background: "#ffffff",
        overflow: "hidden",
        boxShadow: highlighted ? "0 0 0 4px rgba(37, 99, 235, 0.12)" : undefined,
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
            <code>{preset.filename}</code> · {preset.kind}
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
            <div style={{ fontSize: 12, marginBottom: 12, lineHeight: 1.8 }}>
              <a href={localUrl} style={{ color: "#2563eb", marginRight: 12 }}>
                Docs mirror
              </a>
              <a href={hostedUrl} style={{ color: "#2563eb", marginRight: 12 }}>
                GitHub Pages
              </a>
              <Link to={galleryLink} style={{ color: "#2563eb", marginRight: 12 }}>
                Gallery deep link
              </Link>
              <a href={dashboarderLink} style={{ color: "#2563eb" }}>
                Open in Dashboarder
              </a>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                alignItems: "center",
                marginBottom: 12,
                fontSize: 12,
                color: "#475569",
              }}
            >
              <code
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: "#f1f5f9",
                  color: "#0f172a",
                  fontSize: 11,
                }}
              >
                {validateCommand}
              </code>
              <button
                type="button"
                onClick={() => void copyValidate()}
                style={{
                  fontSize: 12,
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  cursor: "pointer",
                }}
              >
                {copiedValidate ? "Copied" : "Copy validate"}
              </button>
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
  const [searchParams] = useSearchParams();
  const activePresetId = searchParams.get("preset");

  return (
    <div>
      <p style={{ marginTop: 0, fontSize: 13, color: "#64748b" }}>
        <Link to="/runtime">Runtime SDK</Link> / Import gallery
      </p>
      <h1 style={{ marginTop: 8 }}>Import gallery</h1>
      <p style={{ color: "#475569", maxWidth: 720, lineHeight: 1.6 }}>
        Shipped runtime, dashboard, and workspace export fixtures with <code>$schema</code> hints.
        Deep-link a preset with <code>?preset=ops-embed</code> or open directly in Dashboarder via{" "}
        <code>?import=ops-embed</code>. Each card runs the dual JSON Schema + semantic gate used by{" "}
        <code>charts-runtime validate --preset &lt;id&gt; --all</code> (also what{" "}
        <code>pnpm validate:runtime</code> runs in CI).
      </p>

      <section
        style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          background: "#f8fafc",
          maxWidth: 720,
        }}
      >
        <h2 style={{ margin: "0 0 8px", fontSize: 14 }}>Validate in CI</h2>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Shipped presets map to <code>charts-runtime validate --preset</code> shortcuts. Run all
          fixtures with <code>pnpm validate:runtime</code>.
        </p>
        {HOSTED_IMPORT_PRESETS.map((preset) => (
          <div
            key={preset.id}
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 11,
              color: "#334155",
              lineHeight: 1.8,
            }}
          >
            {formatValidatePresetCommand(preset.id)}
          </div>
        ))}
      </section>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
        {HOSTED_IMPORT_PRESETS.map((preset) => (
          <Link
            key={preset.id}
            to={presetGalleryPath(preset.id)}
            style={{
              fontSize: 12,
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              background: activePresetId === preset.id ? "#dbeafe" : "#f8fafc",
              color: "#1e293b",
              textDecoration: "none",
            }}
          >
            {preset.label}
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
        {HOSTED_IMPORT_PRESETS.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            highlighted={activePresetId === preset.id}
          />
        ))}
      </div>

      <p style={{ marginTop: 24, fontSize: 13, color: "#64748b" }}>
        <Link to="/runtime/links" style={{ color: "#2563eb" }}>
          Deep link index
        </Link>
        {" · "}
        <Link to="/runtime/schema" style={{ color: "#2563eb" }}>
          Runtime schema
        </Link>
      </p>
    </div>
  );
}
