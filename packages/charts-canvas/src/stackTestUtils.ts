import type uPlot from "uplot";

/** Read the stack group the option builders tag onto uPlot series (not a uPlot field). */
export function seriesStackGroup(series: uPlot.Series | undefined): unknown {
  return series && "stack" in series ? series.stack : undefined;
}
