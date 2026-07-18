import type {
  ComboSeries,
  DualAxisMode,
  ReferenceLine,
  SeriesTone,
  ThresholdBand,
} from "@axicharts/charts-canvas";
import type { LineCurve } from "@axicharts/charts-theme";
import type { ChartBlockMarkSpec } from "./types";
import { pluckField } from "./data";

export type BlockMarksChartProps = {
  series: ComboSeries[];
  referenceLines: ReferenceLine[];
  thresholdBands: ThresholdBand[];
  /** Chart-level fill — only when all data marks are area (no bars). */
  fill: boolean;
  showValues?: boolean;
  stacked?: boolean;
  dualAxis?: DualAxisMode;
};

function resolveStacked(marks: ChartBlockMarkSpec[]): boolean {
  const barMarks = marks.filter(
    (mark): mark is Extract<ChartBlockMarkSpec, { type: "bar" }> =>
      isSeriesBlockMark(mark) && mark.type === "bar",
  );
  const stackIds = barMarks
    .map((mark) => mark.stack)
    .filter((id): id is string => typeof id === "string" && id.length > 0);
  if (stackIds.length < 2) return false;
  return new Set(stackIds).size === 1;
}

function resolveShowValues(marks: ChartBlockMarkSpec[]): boolean {
  return marks.some(
    (mark) => isSeriesBlockMark(mark) && mark.type === "bar" && mark.labels === true,
  );
}

function resolveDualAxis(marks: ChartBlockMarkSpec[]): DualAxisMode | undefined {
  const axes = marks
    .filter(isSeriesBlockMark)
    .map((mark) => mark.yAxisId)
    .filter((id): id is "left" | "right" => id === "left" || id === "right");
  if (axes.includes("right")) return true;
  if (axes.includes("left") && axes.includes("right")) return true;
  return undefined;
}

const SERIES_KINDS = new Set(["line", "bar", "area"]);

export function isSeriesBlockMark(
  mark: ChartBlockMarkSpec,
): mark is Extract<ChartBlockMarkSpec, { type: "line" | "bar" | "area" }> {
  return SERIES_KINDS.has(mark.type);
}

export function blockMarksToChartProps(
  rows: Record<string, unknown>[],
  marks: ChartBlockMarkSpec[],
): BlockMarksChartProps {
  const series: ComboSeries[] = [];
  const referenceLines: ReferenceLine[] = [];
  const thresholdBands: ThresholdBand[] = [];

  for (const mark of marks) {
    if (isSeriesBlockMark(mark)) {
      const data = pluckField(rows, {
        field: mark.field,
        type: "quantitative",
      }) as number[];
      const kind = mark.type === "bar" ? "bar" : "line";
      series.push({
        name: mark.label ?? mark.field,
        data,
        kind,
        tone: mark.tone as SeriesTone | undefined,
        ...(mark.type === "area" ? { fill: true } : {}),
        ...(mark.curve && mark.type !== "bar" ? { curve: mark.curve } : {}),
      });
      continue;
    }

    if (mark.type === "rule") {
      referenceLines.push({
        value: mark.value,
        label: mark.label,
        tone: mark.tone as SeriesTone | undefined,
      });
      continue;
    }

    if (mark.type === "band") {
      thresholdBands.push({
        min: mark.min,
        max: mark.max,
        label: mark.label,
        tone: mark.tone as SeriesTone | undefined,
      });
    }
  }

  const hasBar = series.some((item) => item.kind === "bar");
  const allArea =
    series.length > 0 && series.every((item) => item.kind === "line" && item.fill);

  return {
    series,
    referenceLines,
    thresholdBands,
    fill: !hasBar && allArea,
    showValues: resolveShowValues(marks),
    stacked: resolveStacked(marks),
    dualAxis: resolveDualAxis(marks),
  };
}

export function marksNeedFill(marks: ChartBlockMarkSpec[]): boolean {
  return marks.some((mark) => mark.type === "area");
}

export function marksCurve(marks: ChartBlockMarkSpec[]): LineCurve | undefined {
  const curves = marks
    .filter(isSeriesBlockMark)
    .filter((mark) => mark.type !== "bar" && mark.curve)
    .map((mark) => mark.curve as LineCurve);
  if (curves.length === 0) return undefined;
  const first = curves[0];
  return curves.every((curve) => curve === first) ? first : undefined;
}
