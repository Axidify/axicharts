import type { SeriesTone } from "./types";

export type ScatterPoint = {
  x: number;
  y: number;
  label?: string;
  /** Bubble radius in px when size encoding is active. */
  size?: number;
};

export type ScatterSeries = {
  name: string;
  points: ScatterPoint[];
  tone?: SeriesTone;
};
