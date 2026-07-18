import { shouldUseDualAxis } from "@axicharts/charts-canvas";
import type { ChartBlockMarkSpec, PanelSpec } from "./types";
import { blockMarksToChartProps, marksCurve, marksNeedFill } from "./blockMarks";
import { compilePanel } from "./compilePanel";
import {
  CartesianSpecValidationError,
  validateCartesianSpec,
} from "./cartesianValidation";

export type SimulationOutcome =
  | "works"
  | "silent_bad"
  | "throws"
  | "ignored";

export type SimulationResult = {
  id: string;
  category: string;
  description: string;
  marks: ChartBlockMarkSpec[];
  outcome: SimulationOutcome;
  details: string;
  rfcRecommendation: "allow" | "error" | "warn" | "resolve";
};

const BASE_ROWS = [
  { week: "W1", revenue: 42, target: 40, margin_pct: 0.41 },
  { week: "W2", revenue: 48, target: 44, margin_pct: 0.44 },
  { week: "W3", revenue: 51, target: 48, margin_pct: 0.48 },
];

function hasNaNSeries(series: { data: number[] }[]): boolean {
  return series.some((s) => s.data.some((v) => Number.isNaN(v)));
}

function panelFromMarks(
  marks: ChartBlockMarkSpec[],
  rows: Record<string, unknown>[] = BASE_ROWS,
): PanelSpec {
  return {
    type: "cartesian",
    encoding: { x: { field: "week" } },
    marks,
  };
}

function validatePanel(
  marks: ChartBlockMarkSpec[],
  rows: Record<string, unknown>[] = BASE_ROWS,
): ReturnType<typeof validateCartesianSpec> {
  return validateCartesianSpec(panelFromMarks(marks, rows), { rows });
}

function compileBlocks(
  marks: ChartBlockMarkSpec[],
  rows: Record<string, unknown>[] = BASE_ROWS,
): { ok: boolean; error?: string } {
  try {
    const el = compilePanel(panelFromMarks(marks, rows), rows);
    return { ok: el != null };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof CartesianSpecValidationError
          ? e.errors.map((err) => err.code).join(",")
          : e instanceof Error
            ? e.message
            : String(e),
    };
  }
}

function evaluate(
  id: string,
  category: string,
  description: string,
  marks: ChartBlockMarkSpec[],
  rows: Record<string, unknown>[] = BASE_ROWS,
  rfcRecommendation: SimulationResult["rfcRecommendation"] = "allow",
): SimulationResult {
  const props = blockMarksToChartProps(rows, marks);
  const validation = validatePanel(marks, rows);
  const compiled = compileBlocks(marks, rows);
  const dual = shouldUseDualAxis(props.series, "auto");

  let outcome: SimulationOutcome = "works";
  const notes: string[] = [];

  if (!validation.ok) {
    outcome = "throws";
    notes.push(`validate: ${validation.errors.map((e) => e.code).join(",")}`);
  } else if (!compiled.ok) {
    outcome = "throws";
    notes.push(`compilePanel: ${compiled.error}`);
  }

  if (
    props.series.length === 0 &&
    marks.some((m) => m.type === "bar" || m.type === "line" || m.type === "area") &&
    validation.ok
  ) {
    outcome = "silent_bad";
    notes.push("data marks requested but series empty");
  }

  if (
    props.series.length === 0 &&
    marks.length > 0 &&
    marks.every((m) => m.type === "rule" || m.type === "band") &&
    validation.ok
  ) {
    outcome = "silent_bad";
    notes.push("overlay-only: compiles with zero series");
  }

  if (hasNaNSeries(props.series) && validation.ok) {
    outcome = outcome === "throws" ? "throws" : "silent_bad";
    notes.push("series contains NaN (missing or non-numeric field)");
  }

  const unknownTypes = marks.filter(
    (m) => !["bar", "line", "area", "rule", "band"].includes(m.type),
  );
  if (unknownTypes.length > 0 && validation.ok) {
    const recognized = props.series.length + props.referenceLines.length + props.thresholdBands.length;
    if (recognized < marks.length) {
      outcome = "ignored";
      notes.push(`unknown mark type(s) silently skipped: ${unknownTypes.map((m) => m.type).join(", ")}`);
    }
  }

  if (marks.some((m) => m.type === "band" && m.min >= m.max)) {
    notes.push(`invalid band min>=max still emitted: ${JSON.stringify(props.thresholdBands)}`);
    if (outcome === "works") outcome = "silent_bad";
  }

  if (marksNeedFill(marks) && props.series.some((s) => s.kind === "bar")) {
    notes.push("area mark sets global fill=true alongside bars");
  }

  if (props.series.length >= 2) {
    notes.push(`dualAxis auto=${dual}`);
  }

  const curves = marks.filter((m) => m.type === "line" || m.type === "area") as Array<
    Extract<ChartBlockMarkSpec, { type: "line" | "area" }>
  >;
  if (curves.length > 1 && curves.some((c) => c.curve) && curves.some((c) => c.curve && c.curve !== curves[0]?.curve)) {
    notes.push(`marksCurve picks first only: ${marksCurve(marks)}`);
  }

  return {
    id,
    category,
    description,
    marks,
    outcome,
    details: [
      `series=${props.series.length}`,
      `rules=${props.referenceLines.length}`,
      `bands=${props.thresholdBands.length}`,
      `fill=${props.fill}`,
      ...notes,
    ].join("; "),
    rfcRecommendation,
  };
}

/** Run all composition scenarios against C135 `blockMarks` + `compilePanel` (blocks). */
export function runCompositionSimulations(): SimulationResult[] {
  const results: SimulationResult[] = [];

  results.push(
    evaluate("S01", "canonical", "single bar", [{ type: "bar", field: "revenue" }]),
    evaluate("S02", "canonical", "single line", [{ type: "line", field: "target" }]),
    evaluate("S03", "canonical", "single area", [{ type: "area", field: "revenue" }]),
    evaluate("S04", "canonical", "bar + line combo", [
      { type: "bar", field: "revenue" },
      { type: "line", field: "target" },
    ]),
    evaluate("S05", "canonical", "bar + line + rule + band (fixture)", [
      { type: "bar", field: "revenue", label: "Revenue" },
      { type: "line", field: "target", label: "Target" },
      { type: "rule", value: 50, label: "Quota" },
      { type: "band", min: 44, max: 52, label: "Band" },
    ]),
    evaluate("S06", "multi-data", "two bars different fields", [
      { type: "bar", field: "revenue" },
      { type: "bar", field: "target" },
    ]),
    evaluate("S07", "multi-data", "two lines different fields", [
      { type: "line", field: "revenue" },
      { type: "line", field: "target" },
    ]),
    evaluate("S08", "multi-data", "bar + area + line triple", [
      { type: "bar", field: "revenue" },
      { type: "area", field: "target" },
      { type: "line", field: "margin_pct" },
    ]),
    evaluate("S09", "overlay", "multiple rules", [
      { type: "line", field: "revenue" },
      { type: "rule", value: 45, label: "Low" },
      { type: "rule", value: 55, label: "High" },
    ]),
    evaluate("S10", "overlay", "multiple bands", [
      { type: "line", field: "revenue" },
      { type: "band", min: 40, max: 45, label: "A" },
      { type: "band", min: 48, max: 52, label: "B" },
    ], BASE_ROWS, "warn"),
    evaluate("S11", "overlay", "rule + band only (no data mark)", [
      { type: "rule", value: 50 },
      { type: "band", min: 44, max: 52 },
    ], BASE_ROWS, "error"),
    evaluate("S12", "empty", "empty marks array", [], BASE_ROWS, "error"),
    evaluate("S13", "field", "missing field column", [{ type: "bar", field: "revnue" }], BASE_ROWS, "error"),
    evaluate("S14", "field", "non-numeric values", [{ type: "bar", field: "revenue" }], [
      { week: "W1", revenue: "n/a" },
      { week: "W2", revenue: "bad" },
    ], "error"),
    evaluate("S15", "field", "empty data rows", [{ type: "bar", field: "revenue" }], [], "error"),
    evaluate("S16", "scale", "similar magnitude → shared Y", [
      { type: "bar", field: "revenue" },
      { type: "line", field: "target" },
    ]),
    evaluate("S17", "scale", "different magnitude → dual axis auto", [
      { type: "bar", field: "revenue" },
      { type: "line", field: "margin_pct" },
    ], BASE_ROWS, "resolve"),
    evaluate("S18", "invalid", "band min >= max", [
      { type: "line", field: "revenue" },
      { type: "band", min: 52, max: 44 },
    ], BASE_ROWS, "error"),
    evaluate("S19", "invalid", "unknown mark type point", [
      { type: "point", field: "revenue" } as unknown as ChartBlockMarkSpec,
    ], BASE_ROWS, "error"),
    evaluate("S20", "redundant", "duplicate same field twice", [
      { type: "bar", field: "revenue" },
      { type: "line", field: "revenue" },
    ], BASE_ROWS, "warn"),
    evaluate("S21", "redundant", "area + line same field", [
      { type: "area", field: "revenue" },
      { type: "line", field: "revenue" },
    ], BASE_ROWS, "warn"),
  );

  // Legacy prop merge: marks + props.referenceLines
  try {
    const el = compilePanel(
      {
        type: "blocks",
        encoding: { x: { field: "week" } },
        marks: [{ type: "rule", value: 50, label: "From marks" }],
        props: {
          referenceLines: [{ value: 60, label: "From props" }],
          series: [{ name: "X", data: [1, 2, 3], kind: "line" as const }],
        },
      },
      BASE_ROWS,
    );
    results.push({
      id: "S22",
      category: "legacy",
      description: "marks rule + props.referenceLines merge (duplicate channel)",
      marks: [{ type: "rule", value: 50 }],
      outcome: el ? "works" : "silent_bad",
      details: "compilePanel merges marks overlays with props.referenceLines; props.series ignored when marks provide series from data marks only - here only rule mark so series from marks empty but props.series might be ignored",
      rfcRecommendation: "warn",
    });
  } catch (e) {
    results.push({
      id: "S22",
      category: "legacy",
      description: "marks + props.referenceLines",
      marks: [{ type: "rule", value: 50 }],
      outcome: "throws",
      details: String(e),
      rfcRecommendation: "warn",
    });
  }

  // Re-evaluate S22 with data mark + duplicate overlays
  const dupProps = blockMarksToChartProps(BASE_ROWS, [
    { type: "bar", field: "revenue" },
    { type: "rule", value: 50, label: "marks" },
  ]);
  const mergedCompile = compilePanel(
    {
      type: "blocks",
      encoding: { x: { field: "week" } },
      marks: [
        { type: "bar", field: "revenue" },
        { type: "rule", value: 50, label: "marks" },
      ],
      props: {
        referenceLines: [{ value: 60, label: "props" }],
      },
    },
    BASE_ROWS,
  );
  results.push({
    id: "S22b",
    category: "legacy",
    description: "data + rule in marks + referenceLines in props (duplicate overlays)",
    marks: [
      { type: "bar", field: "revenue" },
      { type: "rule", value: 50 },
    ],
    outcome: mergedCompile ? "works" : "silent_bad",
    details: `blockMarks rules=${dupProps.referenceLines.length}; compile merges props → expect 2 reference lines at render`,
    rfcRecommendation: "warn",
  });

  // Curve conflict
  results.push(
    evaluate("S23", "encoding", "two lines different curve", [
      { type: "line", field: "revenue", curve: "linear" },
      { type: "line", field: "target", curve: "monotone" },
    ], BASE_ROWS, "warn"),
  );

  return results;
}

export function summarizeSimulations(results: SimulationResult[]): {
  works: number;
  silent_bad: number;
  ignored: number;
  throws: number;
  gaps: SimulationResult[];
} {
  const counts = { works: 0, silent_bad: 0, ignored: 0, throws: 0 };
  for (const r of results) {
    counts[r.outcome]++;
  }
  const gaps = results.filter(
    (r) => r.outcome !== "works" || r.rfcRecommendation !== "allow",
  );
  return { ...counts, gaps };
}
