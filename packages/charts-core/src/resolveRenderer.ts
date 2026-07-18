export type ChartMode =
  | "static"
  | "interactive"
  | "live"
  | "presentation";

export type RendererPreference = "auto" | "canvas" | "svg";

export type ResolveRendererInput = {
  renderer?: RendererPreference;
  mode?: ChartMode;
  pointCount: number;
  seriesCount?: number;
  refreshHz?: number;
  plotWidth?: number;
};

export type ResolvedRenderer = {
  /** Target rendering engine — cartesian charts use canvas today. */
  engine: "canvas" | "svg";
  /** When set, plot data should be downsampled to this many points. */
  maxPoints: number | null;
};

const LARGE_SERIES_THRESHOLD = 2000;
const MIN_SAMPLE_POINTS = 500;

function computeSampleTarget(
  pointCount: number,
  plotWidth?: number,
): number {
  const widthTarget =
    plotWidth != null
      ? Math.max(Math.floor(plotWidth * 2), MIN_SAMPLE_POINTS)
      : LARGE_SERIES_THRESHOLD;
  return Math.min(Math.max(widthTarget, 2), pointCount);
}

function resolveMaxPoints(
  pointCount: number,
  plotWidth: number | undefined,
  sample: boolean,
): number | null {
  if (!sample || pointCount <= LARGE_SERIES_THRESHOLD) {
    return null;
  }
  return computeSampleTarget(pointCount, plotWidth);
}

/**
 * Heuristics from CAPABILITIES.md — point count, mode, and refresh rate.
 */
export function resolveRenderer(
  input: ResolveRendererInput,
): ResolvedRenderer {
  const {
    renderer = "auto",
    mode = "interactive",
    pointCount,
    refreshHz,
    plotWidth,
  } = input;

  if (renderer === "svg") {
    return {
      engine: "svg",
      maxPoints: null,
    };
  }

  if (renderer === "canvas") {
    return {
      engine: "canvas",
      maxPoints: resolveMaxPoints(pointCount, plotWidth, true),
    };
  }

  if (mode === "live" || (refreshHz != null && refreshHz >= 1)) {
    return {
      engine: "canvas",
      maxPoints: resolveMaxPoints(pointCount, plotWidth, true),
    };
  }

  if (mode === "static" && pointCount < LARGE_SERIES_THRESHOLD) {
    return {
      engine: "svg",
      maxPoints: null,
    };
  }

  if (pointCount >= LARGE_SERIES_THRESHOLD) {
    return {
      engine: "canvas",
      maxPoints: resolveMaxPoints(pointCount, plotWidth, true),
    };
  }

  return {
    engine: mode === "presentation" ? "svg" : "canvas",
    maxPoints: null,
  };
}
