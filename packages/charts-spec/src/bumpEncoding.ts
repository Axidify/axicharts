import type { BumpChartData, BumpSeries } from "@axicharts/charts-echarts";
import type { FieldEncoding } from "./types";

export function bumpFromRows(
  rows: Record<string, unknown>[],
  props: Record<string, unknown>,
  encoding?: {
    x?: FieldEncoding;
    y?: FieldEncoding;
    series?: FieldEncoding;
  },
): BumpChartData {
  const categories = props.categories as string[] | undefined;
  const series = props.series as BumpSeries[] | undefined;
  if (categories && series) {
    return { categories, series };
  }

  const periodField =
    encoding?.x?.field ?? (props.periodField as string | undefined) ?? "period";
  const rankField =
    encoding?.y?.field ?? (props.rankField as string | undefined) ?? "rank";
  const entityField =
    encoding?.series?.field ??
    (props.entityField as string | undefined) ??
    "entity";

  const resolvedCategories = [
    ...new Set(rows.map((row) => String(row[periodField]))),
  ];
  const entityNames = [
    ...new Set(rows.map((row) => String(row[entityField]))),
  ];
  const fallbackRank = Math.max(entityNames.length, 1);

  return {
    categories: resolvedCategories,
    series: entityNames.map((name) => ({
      name,
      ranks: resolvedCategories.map((period) => {
        const match = rows.find(
          (row) =>
            String(row[periodField]) === period &&
            String(row[entityField]) === name,
        );
        const rank = match ? Number(match[rankField]) : fallbackRank;
        return Number.isFinite(rank) ? rank : fallbackRank;
      }),
    })),
  };
}
