export type ChartSize = {
  width: number;
  height: number;
};

export type SizeConstraints = {
  width?: number | string;
  height?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
  measuredWidth?: number;
  measuredHeight?: number;
};

/**
 * Resolve drawable chart dimensions from props + measured container box.
 * Precedence: fixed height → aspectRatio → measured height (clamped).
 */
export function resolveSize(constraints: SizeConstraints): ChartSize {
  const measuredWidth = Math.max(0, constraints.measuredWidth ?? 0);
  const measuredHeight = Math.max(0, constraints.measuredHeight ?? 0);

  let width = measuredWidth;
  if (typeof constraints.width === "number") {
    width = constraints.width;
  }

  let height = measuredHeight;

  if (typeof constraints.height === "number") {
    height = constraints.height;
  } else if (
    typeof constraints.aspectRatio === "number" &&
    constraints.aspectRatio > 0 &&
    width > 0
  ) {
    height = width / constraints.aspectRatio;
  }

  if (typeof constraints.minHeight === "number") {
    height = Math.max(height, constraints.minHeight);
  }

  if (typeof constraints.maxHeight === "number") {
    height = Math.min(height, constraints.maxHeight);
  }

  return {
    width: Math.max(0, width),
    height: Math.max(0, height),
  };
}
