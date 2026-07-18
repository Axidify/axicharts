import type { SeriesTone } from "./types";
import { computeBoxStats } from "./violinTypes";

export type SwarmItem = {
  category: string;
  values?: number[];
  /** @deprecated Use `values` — alias for violin-shaped props */
  samples?: number[];
  tone?: SeriesTone;
};

export type SwarmSeries = {
  name: string;
  items: SwarmItem[];
  tone?: SeriesTone;
};

export type SwarmPoint = {
  value: number;
  xOffset: number;
};

function hash32(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function itemValues(item: SwarmItem): number[] {
  return item.values ?? item.samples ?? [];
}

export function swarmCategories(items: SwarmItem[] | SwarmSeries[]): string[] {
  if (items.length === 0) return [];
  const first = items[0]!;
  if ("items" in first) {
    return first.items.map((item) => item.category);
  }
  return (items as SwarmItem[]).map((item) => item.category);
}

export function layoutSwarmPoints(
  samples: number[],
  categoryKey: string,
  jitterWidth = 0.75,
  pointDiameter = 0.12,
): SwarmPoint[] {
  if (samples.length === 0) return [];

  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const range = Math.max(max - min, Number.EPSILON);
  const order = samples
    .map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value || a.index - b.index);

  const offsets = new Array<number>(samples.length).fill(0);
  const placed: { x: number; y: number }[] = [];

  for (const { value, index } of order) {
    const yNorm = (value - min) / range;
    let placedPoint = false;

    for (let attempt = 0; attempt < 64 && !placedPoint; attempt += 1) {
      let x = 0;
      if (attempt > 0) {
        const seed = hash32(`${categoryKey}:${index}:${value}:${attempt}`);
        const angle = ((seed % 6283) / 1000) * Math.PI * 2;
        const ring = Math.ceil(attempt / 6);
        x = ring * pointDiameter * 0.55 * Math.cos(angle);
      }
      x = Math.max(-jitterWidth / 2, Math.min(jitterWidth / 2, x));

      let ok = true;
      for (const point of placed) {
        const dx = (x - point.x) / pointDiameter;
        const dy = (yNorm - point.y) * 2;
        if (dx * dx + dy * dy < 1) {
          ok = false;
          break;
        }
      }

      if (ok) {
        offsets[index] = x;
        placed.push({ x, y: yNorm });
        placedPoint = true;
      }
    }

    if (!placedPoint) {
      const seed = hash32(`${categoryKey}:${index}`);
      offsets[index] = ((seed % 1000) / 1000 - 0.5) * jitterWidth;
      placed.push({ x: offsets[index]!, y: yNorm });
    }
  }

  return samples.map((value, pointIndex) => ({
    value,
    xOffset: offsets[pointIndex]!,
  }));
}

export function resolveSwarmMedian(item: SwarmItem): number | null {
  const values = itemValues(item);
  if (values.length === 0) return null;
  return computeBoxStats(values).median;
}

export function resolveSwarmPoints(
  item: SwarmItem,
  categoryKey: string,
  jitterWidth?: number,
): SwarmPoint[] {
  return layoutSwarmPoints(itemValues(item), categoryKey, jitterWidth);
}
