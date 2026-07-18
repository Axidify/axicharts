import uPlot from "uplot";
import type { LineCurve } from "@axicharts/charts-theme";

export type { LineCurve };

/** uPlot path builder for theme / Recharts-style curve interpolation. */
export function lineSeriesPaths(
  curve: LineCurve,
): uPlot.Series.PathBuilder | undefined {
  if (curve === "linear") return undefined;
  return uPlot.paths.spline!();
}

export function resolveLineCurve(
  themeCurve: LineCurve,
  override?: LineCurve,
): LineCurve {
  return override ?? themeCurve;
}
