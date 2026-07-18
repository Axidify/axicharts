import type {
  ComboSeries,
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
  fill: boolean;
};

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
  let fill = false;

  for (const mark of marks) {
    if (isSeriesBlockMark(mark)) {
      const data = pluckField(rows, {
        field: mark.field,
        type: "quantitative",
      }) as number[];
      const kind = mark.type === "bar" ? "bar" : "line";
      if (mark.type === "area") {
        fill = true;
      }
      series.push({
        name: mark.label ?? mark.field,
        data,
        kind,
        tone: mark.tone as SeriesTone | undefined,
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

  return { series, referenceLines, thresholdBands, fill };
}

export function marksNeedFill(marks: ChartBlockMarkSpec[]): boolean {
  return marks.some((mark) => mark.type === "area");
}

export function marksCurve(marks: ChartBlockMarkSpec[]): LineCurve | undefined {
  const curve = marks.find(
    (mark) => isSeriesBlockMark(mark) && mark.curve,
  ) as Extract<ChartBlockMarkSpec, { type: "line" | "bar" | "area" }> | undefined;
  return curve?.curve;
}
