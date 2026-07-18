import type { SeriesTone } from "./types";

export type BumpSeries = {
  id?: string;
  name: string;
  color?: string;
  tone?: SeriesTone;
  /** Rank at each category (1 = best); length must match categories. */
  ranks: number[];
};

export type BumpChartData = {
  categories: string[];
  series: BumpSeries[];
};
