import type { DistributionMarkSpec, PanelSpec } from "./types";
import { blockMarksToDistributionProps } from "./blockMarksToDistributionProps";
import { compilePanel } from "./compilePanel";
import { validateDistributionSpec } from "./distributionValidation";
import { PanelValidationError } from "./validatePanel";
import type { SimulationOutcome, SimulationResult } from "./compositionSimulation";
export type { SimulationOutcome, SimulationResult } from "./compositionSimulation";
export { summarizeSimulations } from "./compositionSimulation";

const BASE_ROWS = [
  { browser: "Chrome", share: 48 },
  { browser: "Safari", share: 32 },
  { browser: "Firefox", share: 20 },
];

function panelFromMarks(
  marks: DistributionMarkSpec[],
  rows: Record<string, unknown>[] = BASE_ROWS,
): PanelSpec {
  return {
    type: "distribution",
    encoding: {
      angle: { field: "share", type: "quantitative" },
      color: { field: "browser", type: "nominal" },
    },
    marks,
  };
}

function validatePanel(
  marks: DistributionMarkSpec[],
  rows: Record<string, unknown>[] = BASE_ROWS,
): ReturnType<typeof validateDistributionSpec> {
  return validateDistributionSpec(panelFromMarks(marks, rows), { rows });
}

function compileDistribution(
  marks: DistributionMarkSpec[],
  rows: Record<string, unknown>[] = BASE_ROWS,
): { ok: boolean; error?: string } {
  try {
    const el = compilePanel(panelFromMarks(marks, rows), rows);
    return { ok: el != null };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof PanelValidationError
          ? error.errors.map((issue) => issue.code).join(",")
          : error instanceof Error
            ? error.message
            : String(error),
    };
  }
}

function evaluate(
  id: string,
  category: string,
  description: string,
  marks: DistributionMarkSpec[],
  rows: Record<string, unknown>[] = BASE_ROWS,
  rfcRecommendation: SimulationResult["rfcRecommendation"] = "allow",
): SimulationResult {
  const props = blockMarksToDistributionProps(rows, marks, panelFromMarks(marks, rows).encoding);
  const validation = validatePanel(marks, rows);
  const compiled = compileDistribution(marks, rows);

  let outcome: SimulationOutcome = "works";
  const notes: string[] = [];

  if (!validation.ok) {
    outcome = "throws";
    notes.push(`validate: ${validation.errors.map((issue) => issue.code).join(",")}`);
  } else if (!compiled.ok) {
    outcome = "throws";
    notes.push(`compilePanel: ${compiled.error}`);
  }

  const hasDataMark = marks.some((mark) => mark.type === "arc" || mark.type === "funnel");
  if (!hasDataMark && marks.length > 0 && validation.ok) {
    outcome = "silent_bad";
    notes.push("chrome-only marks without data mark");
  }

  if (props.variant === "pie") {
    if (hasDataMark && props.slices.length === 0 && validation.ok) {
      outcome = "silent_bad";
      notes.push("arc mark present but slices empty");
    }

    if (
      props.slices.some((slice) => Number.isNaN(slice.value)) &&
      validation.ok
    ) {
      outcome = outcome === "throws" ? "throws" : "silent_bad";
      notes.push("slices contain NaN (missing or non-numeric angle field)");
    }
  }

  if (props.variant === "funnel") {
    if (props.stages.length === 0 && validation.ok) {
      outcome = "silent_bad";
      notes.push("funnel mark present but stages empty");
    }

    if (
      props.stages.some((stage) => Number.isNaN(stage.value)) &&
      validation.ok
    ) {
      outcome = outcome === "throws" ? "throws" : "silent_bad";
      notes.push("stages contain NaN (missing or non-numeric value field)");
    }
  }

  const knownMarks = new Set(["arc", "funnel", "donut", "cell", "label"]);
  const unknownMarks = marks.filter((mark) => !knownMarks.has(mark.type));
  if (unknownMarks.length > 0 && validation.ok) {
    outcome = "ignored";
    notes.push(`unknown mark type(s): ${unknownMarks.map((mark) => mark.type).join(", ")}`);
  }

  return {
    id,
    category,
    description,
    marks: marks as unknown as SimulationResult["marks"],
    outcome,
    details: [
      props.variant === "funnel"
        ? `stages=${props.stages.length}`
        : `slices=${props.slices.length}`,
      props.variant === "pie" ? `innerRadius=${props.innerRadius ?? "none"}` : `sort=${props.sort ?? "default"}`,
      `showLabels=${props.showLabels ?? "default"}`,
      ...notes,
    ].join("; "),
    rfcRecommendation,
  };
}

/** Run distribution composition scenarios (RFC-004 C185). */
export function runDistributionSimulations(): SimulationResult[] {
  return [
    evaluate("D01", "canonical", "single arc (pie)", [{ type: "arc", field: "share" }]),
    evaluate("D02", "canonical", "arc + donut", [
      { type: "arc", field: "share" },
      { type: "donut", innerRadius: 42 },
    ]),
    evaluate("D03", "canonical", "browser share donut with labels", [
      { type: "arc", field: "share" },
      { type: "donut", innerRadius: 42 },
      { type: "label", show: true },
    ]),
    evaluate("D04", "style", "arc + semantic cell tones", [
      { type: "arc", field: "share" },
      { type: "cell", dataKey: "Chrome", tone: "success" },
      { type: "cell", dataKey: "Safari", tone: "info" },
    ]),
    evaluate(
      "D05",
      "canonical",
      "full browser share fixture",
      [
        { type: "arc", field: "share" },
        { type: "donut", innerRadius: 42 },
        { type: "label", show: true },
        { type: "cell", dataKey: "Firefox", tone: "warning" },
      ],
      BASE_ROWS,
    ),
    evaluate(
      "D06",
      "overlay",
      "donut + label only (no arc)",
      [
        { type: "donut", innerRadius: 42 },
        { type: "label", show: true },
      ],
      BASE_ROWS,
      "error",
    ),
    evaluate("D07", "empty", "empty marks array", [], BASE_ROWS, "error"),
    evaluate(
      "D08",
      "field",
      "unknown angle field",
      [{ type: "arc", field: "shre" }],
      BASE_ROWS,
      "error",
    ),
    evaluate(
      "D09",
      "field",
      "non-numeric share values",
      [{ type: "arc", field: "share" }],
      [
        { browser: "Chrome", share: "n/a" },
        { browser: "Safari", share: "bad" },
      ],
      "error",
    ),
    evaluate("D10", "field", "empty data rows", [{ type: "arc", field: "share" }], [], "error"),
    evaluate(
      "D11",
      "invalid",
      "unknown mark type wedge",
      [{ type: "wedge", field: "share" } as unknown as DistributionMarkSpec],
      BASE_ROWS,
      "error",
    ),
    evaluate(
      "D12",
      "redundant",
      "duplicate arc marks",
      [
        { type: "arc", field: "share" },
        { type: "arc", field: "share" },
      ],
      BASE_ROWS,
      "error",
    ),
    evaluate(
      "D13",
      "canonical",
      "funnel mark by category",
      [{ type: "funnel", field: "share" }],
    ),
  ];
}
