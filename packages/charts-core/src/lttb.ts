export type LttbPoint = {
  x: number;
  y: number;
};

/**
 * Largest-Triangle-Three-Buckets downsampling (Steinarsson, 2013).
 * Preserves visual shape for time-series line charts.
 */
export function downsampleLTTB(
  points: LttbPoint[],
  threshold: number,
): LttbPoint[] {
  if (threshold <= 0 || points.length <= threshold) {
    return points;
  }
  if (threshold === 1) {
    return [points[0]];
  }
  if (threshold === 2) {
    return [points[0], points[points.length - 1]];
  }

  const sampled: LttbPoint[] = [points[0]];
  const bucketSize = (points.length - 2) / (threshold - 2);
  let previousIndex = 0;

  for (let i = 0; i < threshold - 2; i += 1) {
    const avgStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgEnd = Math.min(
      Math.floor((i + 2) * bucketSize) + 1,
      points.length,
    );
    const avgLength = Math.max(avgEnd - avgStart, 1);

    let avgX = 0;
    let avgY = 0;
    for (let j = avgStart; j < avgEnd; j += 1) {
      avgX += points[j].x;
      avgY += points[j].y;
    }
    avgX /= avgLength;
    avgY /= avgLength;

    const rangeStart = Math.floor(i * bucketSize) + 1;
    const rangeEnd = Math.min(
      Math.floor((i + 1) * bucketSize) + 1,
      points.length - 1,
    );

    let maxArea = -1;
    let maxIndex = rangeStart;
    const anchor = points[previousIndex];

    for (let j = rangeStart; j < rangeEnd; j += 1) {
      const point = points[j];
      const area = Math.abs(
        (anchor.x - avgX) * (point.y - anchor.y) -
          (anchor.x - point.x) * (avgY - anchor.y),
      );
      if (area > maxArea) {
        maxArea = area;
        maxIndex = j;
      }
    }

    sampled.push(points[maxIndex]);
    previousIndex = maxIndex;
  }

  sampled.push(points[points.length - 1]);
  return sampled;
}

/** Returns indices to keep when downsampling a single numeric series. */
export function downsampleIndicesLTTB(
  values: number[],
  threshold: number,
): number[] {
  if (values.length <= threshold || threshold <= 0) {
    return values.map((_, index) => index);
  }

  const points = values.map((y, x) => ({ x, y }));
  const sampled = downsampleLTTB(points, threshold);
  return sampled.map((point) => point.x);
}
