export function sinWaveSeries(
  pointCount: number,
  amplitude = 10,
  period = 40,
): { x: number[]; y: number[] } {
  const x = Array.from({ length: pointCount }, (_, index) => index);
  const y = x.map((index) => 40 + Math.sin(index / period) * amplitude);
  return { x, y };
}

export function sinWaveMultiSeries(
  pointCount: number,
  seriesCount: number,
): { x: number[]; ys: number[][] } {
  const { x, y } = sinWaveSeries(pointCount);
  const ys = [y];
  for (let s = 1; s < seriesCount; s++) {
    const phase = (s * Math.PI) / seriesCount;
    ys.push(x.map((index) => 40 + Math.sin(index / 40 + phase) * 10));
  }
  return { x, ys };
}
