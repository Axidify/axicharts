import type { ChartMode } from "@axicharts/charts-core";
import type {
  ChartAnimate,
  ChartAnimateConfig,
  ChartAnimateEnterConfig,
  ChartAnimateUpdateConfig,
  ResolvedChartAnimate,
} from "./types";
import {
  isCartesianMotionPresetName,
  resolveCartesianMotionPreset,
  resolveSeriesEnterDelay,
} from "./presets";

export { resolveSeriesEnterDelay } from "./presets";

const DEFAULT_ENTER: ChartAnimateEnterConfig = {
  duration: 520,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  delay: 0,
};

const DEFAULT_UPDATE: ChartAnimateUpdateConfig = {
  duration: 220,
};

let liveAnimateWarned = false;

/** @internal test helper */
export function __resetLiveAnimateWarnForTests(): void {
  liveAnimateWarned = false;
}

function normalizeEnter(
  enter: ChartAnimateConfig["enter"],
): ChartAnimateEnterConfig | null {
  if (enter === false) return null;
  if (enter == null) return { ...DEFAULT_ENTER };
  return { ...DEFAULT_ENTER, ...enter };
}

function normalizeUpdate(
  update: ChartAnimateConfig["update"],
): ChartAnimateUpdateConfig | null {
  if (update === false) return null;
  if (update == null) return { ...DEFAULT_UPDATE };
  if (update.easing === true) {
    return { duration: update.duration ?? DEFAULT_UPDATE.duration };
  }
  if (typeof update.easing === "object") {
    return {
      duration: update.easing.duration ?? update.duration ?? DEFAULT_UPDATE.duration,
    };
  }
  return { ...DEFAULT_UPDATE, ...update };
}

function resolvePreset(animate: ChartAnimate): ResolvedChartAnimate {
  if (typeof animate === "string" && isCartesianMotionPresetName(animate)) {
    return resolvePreset(resolveCartesianMotionPreset(animate));
  }

  switch (animate) {
    case "none":
      return { enter: null, update: null };
    case "enter":
      return { enter: { ...DEFAULT_ENTER }, update: null };
    case "update":
      return { enter: null, update: { ...DEFAULT_UPDATE } };
    default:
      return {
        enter:
          "enter" in animate ? normalizeEnter(animate.enter) : null,
        update:
          "update" in animate
            ? normalizeUpdate(animate.update)
            : null,
      };
  }
}

export function resolveChartAnimate(
  mode: ChartMode,
  animate?: ChartAnimate,
): ResolvedChartAnimate {
  if (animate == null) {
    return { enter: null, update: null };
  }

  if (mode === "live") {
    if (
      process.env.NODE_ENV !== "production" &&
      animate !== "none" &&
      !liveAnimateWarned
    ) {
      liveAnimateWarned = true;
      console.warn(
        "[AxiCharts] animate is ignored in live mode — animation is forced off for performance.",
      );
    }
    return { enter: null, update: null };
  }

  return resolvePreset(animate);
}

export function shouldAnimateEnter(
  config: ResolvedChartAnimate,
  options?: { dataKey?: string; reducedMotion?: boolean },
): boolean {
  if (options?.reducedMotion) return false;
  if (!config.enter) return false;
  return true;
}

export function shouldAnimateUpdate(
  config: ResolvedChartAnimate,
  mode: ChartMode,
  options?: { reducedMotion?: boolean },
): boolean {
  if (mode === "live" || mode === "presentation") return false;
  if (options?.reducedMotion) return false;
  return config.update != null;
}

export function seriesDataSignature(
  categories: string[],
  series: { name: string; data: number[] }[],
): string {
  const seriesPart = series
    .map((item) => `${item.name}:${item.data.join(",")}`)
    .join("|");
  return `${categories.join(",")}::${seriesPart}`;
}
