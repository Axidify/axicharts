import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  dashboarderImportDeepLink,
  fetchImportPreset,
  filterImportPresets,
  findImportPreset,
  formatValidatePresetCommand,
  hostedImportPresetUrl,
  HOSTED_IMPORT_PRESETS,
  importGalleryFilterPath,
  IMPORT_GALLERY_ADAPTER_FILTERS,
  IMPORT_GALLERY_KIND_FILTERS,
  isImportGalleryFilterActive,
  localImportPresetUrl,
  parseImportGalleryFilter,
  validatePortableImportJson,
  type HostedImportPreset,
  type ImportGalleryFilter,
  type ImportPresetKind,
  type ImportPresetSource,
} from "@axicharts/charts-runtime/validation";
import { ValidateCommandCopy } from "../components/ValidateCommandCopy";

const base = import.meta.env.BASE_URL;

const chipStyle = {
  fontSize: 12,
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  color: "#1e293b",
  textDecoration: "none",
  cursor: "pointer",
} as const;

function activeChipStyle(active: boolean): typeof chipStyle {
  return {
    ...chipStyle,
    background: active ? "#dbeafe" : "#f8fafc",
    borderColor: active ? "#93c5fd" : "#cbd5e1",
    fontWeight: active ? 600 : 400,
  };
}

function presetGalleryPath(presetId: string): string {
  return `/runtime/import?preset=${encodeURIComponent(presetId)}`;
}

function kindLabel(kind: ImportPresetKind): string {
  if (kind === "runtime") return "Runtime";
  if (kind === "dashboard") return "Dashboard";
  return "Workspace";
}

function sourceLabel(source: ImportPresetSource): string {
  if (source === "hosted") return "GitHub Pages";
  if (source === "local") return "docs mirror";
  return "bundled fixture";
}

function visiblePresets(
  filter: ImportGalleryFilter,
  activePresetId: string | null,
): HostedImportPreset[] {
  const filtered = filterImportPresets(filter);
  if (!activePresetId || filtered.some((preset) => preset.id === activePresetId)) {
    return filtered;
  }
  const highlighted = findImportPreset(activePresetId);
  return highlighted ? [highlighted, ...filtered] : filtered;
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
            {preset.adapter ? (
              <>
                {" · "}
                <code>{preset.adapter}</code> adapter
              </>
            ) : null}
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
            <ValidateCommandCopy command={validateCommand} buttonLabel="Copy validate" />
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
  const galleryFilter = parseImportGalleryFilter(searchParams.toString());
  const presets = useMemo(
    () => visiblePresets(galleryFilter, activePresetId),
    [galleryFilter, activePresetId],
  );

  return (
    <div>
      <p style={{ marginTop: 0, fontSize: 13, color: "#64748b" }}>
        <Link to="/runtime">Runtime SDK</Link> / Import gallery
      </p>
      <h1 style={{ marginTop: 8 }}>Import gallery</h1>
      <p style={{ color: "#475569", maxWidth: 720, lineHeight: 1.6 }}>
        Shipped runtime, dashboard, and workspace export fixtures with <code>$schema</code> hints.
        Deep-link a preset with <code>?preset=ops-embed</code> or filter by adapter with{" "}
        <code>?adapter=rest</code>. Each card runs the dual JSON Schema + semantic gate used by{" "}
        <code>charts-runtime validate --preset &lt;id&gt; --all</code>.
        {" "}
        <Link to="/runtime/adapters">Adapter cookbook →</Link>
      </p>

      <section
        style={{
          marginTop: 16,
          padding: 14,
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          maxWidth: 720,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Adapter fixture track</div>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          All six runtime adapter types ship a validated import preset — use the filters below or
          browse the <Link to="/runtime/adapters">cookbook</Link> for field tables and payload
          shapes.
        </p>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Kind</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <Link
            to={importGalleryFilterPath({ type: "all" })}
            style={activeChipStyle(isImportGalleryFilterActive(galleryFilter, { type: "all" }))}
          >
            All ({HOSTED_IMPORT_PRESETS.length})
          </Link>
          {IMPORT_GALLERY_KIND_FILTERS.map((kind) => (
            <Link
              key={kind}
              to={importGalleryFilterPath({ type: "kind", value: kind })}
              style={activeChipStyle(
                isImportGalleryFilterActive(galleryFilter, { type: "kind", value: kind }),
              )}
            >
              {kindLabel(kind)} ({filterImportPresets({ type: "kind", value: kind }).length})
            </Link>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Adapter</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {IMPORT_GALLERY_ADAPTER_FILTERS.map((adapter) => (
            <Link
              key={adapter}
              to={importGalleryFilterPath({ type: "adapter", value: adapter })}
              style={activeChipStyle(
                isImportGalleryFilterActive(galleryFilter, { type: "adapter", value: adapter }),
              )}
            >
              {adapter} ({filterImportPresets({ type: "adapter", value: adapter }).length})
            </Link>
          ))}
        </div>
      </section>

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
        {presets.map((preset) => (
          <ValidateCommandCopy
            key={preset.id}
            label={preset.label}
            command={formatValidatePresetCommand(preset.id)}
          />
        ))}
      </section>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
        {presets.map((preset) => (
          <Link
            key={preset.id}
            to={presetGalleryPath(preset.id)}
            style={{
              ...chipStyle,
              background: activePresetId === preset.id ? "#dbeafe" : "#f8fafc",
              fontWeight: activePresetId === preset.id ? 600 : 400,
            }}
          >
            {preset.label}
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
        {presets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            highlighted={activePresetId === preset.id}
          />
        ))}
      </div>

      {presets.length === 0 ? (
        <p style={{ marginTop: 16, fontSize: 13, color: "#64748b" }}>
          No presets match this filter.{" "}
          <Link to={importGalleryFilterPath({ type: "all" })}>Show all</Link>.
        </p>
      ) : null}

      <p style={{ marginTop: 24, fontSize: 13, color: "#64748b" }}>
        <Link to="/runtime/links" style={{ color: "#2563eb" }}>
          Deep link index
        </Link>
        {" · "}
        <Link to="/runtime/schema" style={{ color: "#2563eb" }}>
          Runtime schema
        </Link>
        {" · "}
        <Link to="/runtime" style={{ color: "#2563eb" }}>
          Runtime SDK
        </Link>
      </p>
    </div>
  );
}
