import type { SeriesTone } from "./types";

export type GraphNode = {
  id: string;
  name?: string;
  value?: number;
  category?: number | string;
  symbolSize?: number;
  color?: string;
  tone?: SeriesTone;
};

export type GraphEdge = {
  source: string;
  target: string;
  value?: number;
  lineStyle?: { width?: number; opacity?: number };
};

export type GraphCategory = { name: string };

export type GraphChartData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  categories?: GraphCategory[];
};
