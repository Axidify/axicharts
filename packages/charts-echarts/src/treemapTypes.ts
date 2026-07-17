import type { SeriesTone } from "./types";

export type TreemapNode = {
  name: string;
  value?: number;
  tone?: SeriesTone;
  children?: TreemapNode[];
};
