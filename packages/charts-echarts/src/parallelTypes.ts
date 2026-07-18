import type { SeriesTone } from "./types";

export type ParallelDimension = {
  name: string;
  field?: string;
  min?: number;
  max?: number;
};

export type ParallelSeries = {
  name: string;
  values: number[];
  tone?: SeriesTone;
  color?: string;
};
