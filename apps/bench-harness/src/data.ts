export function sinWaveSeries(
  pointCount: number,
  amplitude = 10,
  period = 40,
): { categories: string[]; values: number[] } {
  const values = Array.from({ length: pointCount }, (_, index) =>
    40 + Math.sin(index / period) * amplitude,
  );
  const categories = values.map((_, index) => String(index));
  return { categories, values };
}

export function shiftValues(values: number[]): number[] {
  const last = values[values.length - 1] ?? 0;
  const delta = (Math.random() - 0.5) * 2;
  return [...values.slice(1), Math.max(0, last + delta)];
}

export function percentile(sorted: number[], p: number): number {
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * p) - 1),
  );
  return sorted[index] ?? 0;
}

export const FIXTURE_POINTS: Record<string, number> = {
  small: 500,
  medium: 5000,
  large: 10000,
};
