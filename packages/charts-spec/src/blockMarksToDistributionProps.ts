import type { SeriesTone } from "@axicharts/charts-canvas";
import type { DistributionMarkSpec, PanelSpec } from "./types";
import { isDistributionDataMark, normalizeDistributionMarks } from "./distributionMarks";

export type DistributionSlice = {
  name: string;
  value: number;
  key?: string;
  color?: string;
  tone?: SeriesTone;
};

export type DistributionFunnelStage = {
  name: string;
  value: number;
  key?: string;
  tone?: SeriesTone;
};

export type DistributionPieChartProps = {
  variant: "pie";
  slices: DistributionSlice[];
  innerRadius?: number;
  showLabels?: boolean;
};

export type DistributionFunnelChartProps = {
  variant: "funnel";
  stages: DistributionFunnelStage[];
  sort?: "ascending" | "descending" | "none";
  showLabels?: boolean;
};

export type DistributionChartProps = DistributionPieChartProps | DistributionFunnelChartProps;

function readDataField(
  marks: DistributionMarkSpec[],
  encoding: PanelSpec["encoding"],
): string {
  const dataMark = marks.find(isDistributionDataMark);
  return (
    dataMark?.field ??
    encoding?.angle?.field ??
    encoding?.value?.field ??
    "value"
  );
}

function readColorField(encoding: PanelSpec["encoding"]): string {
  return encoding?.color?.field ?? encoding?.name?.field ?? "name";
}

function readShowLabels(marks: DistributionMarkSpec[]): boolean | undefined {
  const label = marks.find((mark) => mark.type === "label");
  return label ? label.show !== false : undefined;
}

/**
 * Compile distribution `marks[]` + encoding to PieChart or FunnelChart props (RFC-004 C181).
 */
export function blockMarksToDistributionProps(
  rows: Record<string, unknown>[],
  rawMarks: DistributionMarkSpec[] | unknown[],
  encoding: PanelSpec["encoding"] = {},
): DistributionChartProps {
  const marks = normalizeDistributionMarks(rawMarks as unknown[]);
  const dataMark = marks.find(isDistributionDataMark);
  const angleField = readDataField(marks, encoding);
  const colorField = readColorField(encoding);
  const showLabels = readShowLabels(marks);

  if (dataMark?.type === "funnel") {
    const stages: DistributionFunnelStage[] = rows.map((row) => ({
      key: String(row[colorField] ?? ""),
      name: String(row[colorField] ?? ""),
      value: Number(row[angleField] ?? 0),
      ...(row.tone ? { tone: row.tone as SeriesTone } : {}),
    }));

    return {
      variant: "funnel",
      stages,
      ...(dataMark.sort ? { sort: dataMark.sort } : {}),
      ...(showLabels != null ? { showLabels } : {}),
    };
  }

  const cellStyles = new Map<string, { tone?: SeriesTone; color?: string }>();
  let innerRadius: number | undefined;

  for (const mark of marks) {
    if (mark.type === "donut") {
      innerRadius = mark.innerRadius ?? 42;
    }
    if (mark.type === "cell") {
      cellStyles.set(mark.dataKey, {
        tone: mark.tone as SeriesTone | undefined,
        color: mark.color,
      });
    }
  }

  const slices: DistributionSlice[] = rows.map((row) => {
    const name = String(row[colorField] ?? "");
    const value = Number(row[angleField] ?? 0);
    const style = cellStyles.get(name);
    return {
      key: name,
      name,
      value,
      tone: style?.tone,
      color: style?.color,
    };
  });

  return {
    variant: "pie",
    slices,
    ...(innerRadius != null ? { innerRadius } : {}),
    ...(showLabels != null ? { showLabels } : {}),
  };
}
