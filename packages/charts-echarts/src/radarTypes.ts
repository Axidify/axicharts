import type { SeriesTone } from "./types";

export type RadarIndicator = {
  name: string;
  max?: number;
};

export type RadarSeries = {
  name: string;
  values: number[];
  tone?: SeriesTone;
  color?: string;
};
