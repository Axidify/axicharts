import type { SeriesTone } from "./types";

export type ThemeRiverPoint = {
  time: string | number;
  value: number;
  series: string;
  tone?: SeriesTone;
  color?: string;
};
