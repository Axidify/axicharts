import type { SeriesTone } from "./types";

export type PictorialBarItem = {
  category: string;
  value: number;
  symbol?: string;
  color?: string;
  tone?: SeriesTone;
};

export type PictorialBarData = {
  items: PictorialBarItem[];
  symbol?: string;
};
