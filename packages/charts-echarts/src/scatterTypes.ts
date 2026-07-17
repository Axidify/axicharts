import type { SeriesTone } from "./types";

export type ScatterPoint = {
  x: number;
  y: number;
  label?: string;
};

export type ScatterSeries = {
  name: string;
  points: ScatterPoint[];
  tone?: SeriesTone;
};
