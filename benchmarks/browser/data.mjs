export function sinWaveSeries(pointCount, amplitude = 10, period = 40) {
  const x = Array.from({ length: pointCount }, (_, index) => index);
  const y = x.map((index) => 40 + Math.sin(index / period) * amplitude);
  return { x, y };
}

export function shiftSeries(y) {
  const last = y[y.length - 1] ?? 0;
  const delta = (Math.random() - 0.5) * 2;
  return [...y.slice(1), Math.max(0, last + delta)];
}

export function percentile(sorted, p) {
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * p) - 1),
  );
  return sorted[index] ?? 0;
}

export const FIXTURE_POINTS = {
  small: 500,
  medium: 5000,
  large: 10000,
};

export const FIXTURE_BUDGETS = {
  small: 8,
  medium: 16,
  large: 16,
};
