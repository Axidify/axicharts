import type { SeriesTone } from "./types";

/** Shared nested hierarchy node for treemap and sunburst charts. */
export type HierarchyNode = {
  name: string;
  value?: number;
  tone?: SeriesTone;
  children?: HierarchyNode[];
};
