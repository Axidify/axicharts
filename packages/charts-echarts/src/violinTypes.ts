import type { SeriesTone } from "./types";

export type KdePoint = {
  value: number;
  density: number;
};

export type ViolinBoxStats = {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
};

export type ViolinItem = {
  category: string;
  samples?: number[];
  density?: KdePoint[];
  min?: number;
  q1?: number;
  median?: number;
  q3?: number;
  max?: number;
  tone?: SeriesTone;
};

export type ViolinSeries = {
  name: string;
  items: ViolinItem[];
  tone?: SeriesTone;
};

function gaussianKernel(u: number): number {
  return Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = (sorted.length - 1) * p;
  const lo = Math.floor(index);
  const hi = Math.ceil(index);
  if (lo === hi) return sorted[lo]!;
  return sorted[lo]! + (sorted[hi]! - sorted[lo]!) * (index - lo);
}

export function computeBoxStats(samples: number[]): ViolinBoxStats {
  if (samples.length === 0) {
    return { min: 0, q1: 0, median: 0, q3: 0, max: 0 };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  return {
    min: sorted[0]!,
    q1: percentile(sorted, 0.25),
    median: percentile(sorted, 0.5),
    q3: percentile(sorted, 0.75),
    max: sorted[sorted.length - 1]!,
  };
}

export function silvermanBandwidth(samples: number[]): number {
  const n = samples.length;
  if (n < 2) return 1;

  const stats = computeBoxStats(samples);
  const mean = samples.reduce((sum, value) => sum + value, 0) / n;
  const variance =
    samples.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (n - 1);
  const sd = Math.sqrt(variance) || 1;
  const iqr = Math.max(stats.q3 - stats.q1, Number.EPSILON);
  const spread = Math.min(sd, iqr / 1.34);
  return 0.9 * spread * n ** -0.2;
}

export function computeKde(
  samples: number[],
  bandwidth?: number,
  pointCount = 48,
): KdePoint[] {
  if (samples.length === 0) return [];

  const bw = bandwidth ?? silvermanBandwidth(samples);
  const safeBw = Math.max(bw, Number.EPSILON);
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const padding = safeBw * 2;
  const lo = min - padding;
  const hi = max + padding;
  const step = pointCount > 1 ? (hi - lo) / (pointCount - 1) : 0;
  const points: KdePoint[] = [];

  for (let index = 0; index < pointCount; index += 1) {
    const value = lo + step * index;
    let density = 0;
    for (const sample of samples) {
      density += gaussianKernel((value - sample) / safeBw);
    }
    density /= samples.length * safeBw;
    points.push({ value, density });
  }

  return points;
}

export function resolveViolinDensity(
  item: ViolinItem,
  bandwidth?: number,
): KdePoint[] {
  if (item.density && item.density.length > 0) {
    return item.density;
  }
  if (item.samples && item.samples.length > 0) {
    return computeKde(item.samples, bandwidth);
  }
  return [];
}

export function resolveViolinBoxStats(item: ViolinItem): ViolinBoxStats | null {
  const hasStats =
    item.min != null &&
    item.q1 != null &&
    item.median != null &&
    item.q3 != null &&
    item.max != null;

  if (hasStats) {
    return {
      min: item.min!,
      q1: item.q1!,
      median: item.median!,
      q3: item.q3!,
      max: item.max!,
    };
  }

  if (item.samples && item.samples.length > 0) {
    return computeBoxStats(item.samples);
  }

  return null;
}

export function violinCategories(
  items: ViolinItem[] | ViolinSeries[],
): string[] {
  if (items.length === 0) return [];
  const first = items[0]!;
  if ("items" in first) {
    return first.items.map((item) => item.category);
  }
  return (items as ViolinItem[]).map((item) => item.category);
}
