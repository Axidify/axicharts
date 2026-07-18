import type { SeriesTone } from "./types";

export type BoxplotItem = {
  category: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  tone?: SeriesTone;
};

export type BoxplotSeries = {
  name: string;
  items: BoxplotItem[];
  tone?: SeriesTone;
};

export type BoxplotTuple = [number, number, number, number, number];

export function boxplotTuple(item: BoxplotItem): BoxplotTuple {
  return [item.min, item.q1, item.median, item.q3, item.max];
}

export function boxplotCategories(
  items: BoxplotItem[] | BoxplotSeries[],
): string[] {
  if (items.length === 0) return [];
  const first = items[0]!;
  if ("items" in first) {
    return first.items.map((item) => item.category);
  }
  return (items as BoxplotItem[]).map((item) => item.category);
}
