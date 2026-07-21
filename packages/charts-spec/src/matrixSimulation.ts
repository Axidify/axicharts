import type { MatrixMarkSpec, PanelSpec } from "./types";
import { blockMarksToMatrixProps } from "./blockMarksToMatrixProps";
import { compilePanel } from "./compilePanel";
import { validateMatrixSpec } from "./matrixValidation";
import { PanelValidationError } from "./validatePanel";
import type { SimulationOutcome, SimulationResult } from "./compositionSimulation";
export type { SimulationOutcome, SimulationResult } from "./compositionSimulation";
export { summarizeSimulations } from "./compositionSimulation";

const BASE_ROWS = [
  { hour: "09:00", day: "Mon", latency: 42 },
  { hour: "10:00", day: "Mon", latency: 55 },
  { hour: "09:00", day: "Tue", latency: 38 },
  { hour: "10:00", day: "Tue", latency: 61 },
];

function panelFromMarks(
  marks: MatrixMarkSpec[],
  rows: Record<string, unknown>[] = BASE_ROWS,
): PanelSpec {
  return {
    type: "matrix",
    encoding: {
      x: { field: "hour", type: "nominal" },
      y: { field: "day", type: "nominal" },
      value: { field: "latency", type: "quantitative" },
    },
    marks,
  };
}

function validatePanel(
  marks: MatrixMarkSpec[],
  rows: Record<string, unknown>[] = BASE_ROWS,
): ReturnType<typeof validateMatrixSpec> {
  return validateMatrixSpec(panelFromMarks(marks, rows), { rows });
}

function compileMatrix(
  marks: MatrixMarkSpec[],
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
  marks: MatrixMarkSpec[],
  rows: Record<string, unknown>[] = BASE_ROWS,
  rfcRecommendation: SimulationResult["rfcRecommendation"] = "allow",
): SimulationResult {
  const props = blockMarksToMatrixProps(rows, marks, panelFromMarks(marks, rows).encoding);
  const validation = validatePanel(marks, rows);
  const compiled = compileMatrix(marks, rows);

  let outcome: SimulationOutcome = "works";
  const notes: string[] = [];

  if (!validation.ok) {
    outcome = "throws";
    notes.push(`validate: ${validation.errors.map((issue) => issue.code).join(",")}`);
  } else if (!compiled.ok) {
    outcome = "throws";
    notes.push(`compilePanel: ${compiled.error}`);
  }

  const hasCell = marks.some((mark) => mark.type === "cell");
  if (!hasCell && marks.length > 0 && validation.ok) {
    outcome = "silent_bad";
    notes.push("chrome-only marks without cell mark");
  }

  if (
    hasCell &&
    props.matrix.values.every((row) => row.every((value) => value === 0)) &&
    validation.ok &&
    rows.length > 0
  ) {
    outcome = "silent_bad";
    notes.push("cell mark present but matrix values all zero");
  }

  const knownMarks = new Set(["cell", "colorScale", "axis"]);
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
      `x=${props.matrix.xCategories.length}`,
      `y=${props.matrix.yCategories.length}`,
      ...notes,
    ].join("; "),
    rfcRecommendation,
  };
}

/** Run matrix composition scenarios (RFC-004 C188). */
export function runMatrixSimulations(): SimulationResult[] {
  return [
    evaluate("M01", "canonical", "cell + colorScale", [
      { type: "cell", field: "latency" },
      { type: "colorScale", field: "latency" },
    ]),
    evaluate("M02", "canonical", "full matrix chrome", [
      { type: "cell", field: "latency" },
      { type: "colorScale", field: "latency", min: 0, max: 100 },
      { type: "axis", dimension: "x", show: true },
      { type: "axis", dimension: "y", show: true },
    ]),
    evaluate(
      "M03",
      "overlay",
      "colorScale only (no cell)",
      [{ type: "colorScale", field: "latency" }],
      BASE_ROWS,
      "error",
    ),
    evaluate("M04", "empty", "empty marks array", [], BASE_ROWS, "error"),
    evaluate(
      "M05",
      "field",
      "unknown value field",
      [{ type: "cell", field: "latncy" }],
      BASE_ROWS,
      "error",
    ),
    evaluate("M06", "field", "empty data rows", [{ type: "cell", field: "latency" }], [], "error"),
    evaluate(
      "M07",
      "invalid",
      "unknown mark type grid",
      [{ type: "grid", field: "latency" } as unknown as MatrixMarkSpec],
      BASE_ROWS,
      "error",
    ),
    evaluate(
      "M08",
      "invalid",
      "duplicate cell marks",
      [
        { type: "cell", field: "latency" },
        { type: "cell", field: "latency" },
      ],
      BASE_ROWS,
      "error",
    ),
  ];
}
