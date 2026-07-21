import type { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { BlocksPlayground } from "@axicharts/charts-spec";

const PRESET_LINKS = [
  { id: "revenue-target", label: "Revenue + target (bar, line, rule, band)" },
  { id: "ops-slo", label: "Ops SLO (line, rule, band)" },
  { id: "studio-cell", label: "Studio cell (bar)" },
  { id: "dual-metric", label: "Dual metric (bar + line)" },
] as const;

export function BlocksPlaygroundPage(): ReactElement {
  const [params] = useSearchParams();
  const preset = params.get("preset") ?? undefined;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Blocks playground</h1>
      <p style={{ color: "#64748b", lineHeight: 1.6, maxWidth: 720 }}>
        RFC-002 cartesian building blocks — edit panel JSON, validate, preview
        the chart, and copy ejected composable JSX. Presets are canonical few-shot examples for
        agents (see{" "}
        <a href="https://github.com/Axidify/axiboard/blob/main/docs/charts/rfcs/RFC-002-gap-analysis.md">
          RFC-002 gap analysis
        </a>
        ). Use <strong>Generate spec</strong> after editing intent or data columns.
      </p>
      <BlocksPlayground initialPresetId={preset} />
      <p style={{ fontSize: 12, color: "#64748b", marginTop: 16 }}>
        Preset deep links:{" "}
        {PRESET_LINKS.map((entry, index) => (
          <span key={entry.id}>
            {index > 0 ? " · " : ""}
            <a href={`/spec/blocks?preset=${entry.id}`}>{entry.label}</a>
          </span>
        ))}
      </p>
    </div>
  );
}
