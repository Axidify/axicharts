import type {
  CartesianMotionPresetName,
  ChartAnimateConfig,
  ChartAnimateEnterConfig,
  ChartMotionPresetName,
  CountUpMotionConfig,
} from "./types";

const CARTESIAN_MOTION_PRESETS: Record<
  CartesianMotionPresetName,
  ChartAnimateConfig
> = {
  stagger: {
    enter: {
      duration: 520,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      delay: 0,
      staggerMs: 80,
    },
  },
  spring: {
    enter: {
      duration: 680,
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      delay: 0,
    },
  },
  gentle: {
    enter: {
      duration: 780,
      easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      delay: 40,
    },
  },
  morph: {
    enter: {
      duration: 520,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    },
    update: {
      duration: 320,
    },
  },
};

export const COUNT_UP_MOTION_CONFIG: CountUpMotionConfig = {
  duration: 900,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
};

export const MOTION_PRESETS: Record<
  ChartMotionPresetName,
  ChartAnimateConfig | CountUpMotionConfig
> = {
  ...CARTESIAN_MOTION_PRESETS,
  countUp: COUNT_UP_MOTION_CONFIG,
};

const CARTESIAN_PRESET_NAMES = Object.keys(
  CARTESIAN_MOTION_PRESETS,
) as CartesianMotionPresetName[];

const MOTION_PRESET_NAMES = Object.keys(MOTION_PRESETS) as ChartMotionPresetName[];

export function isMotionPresetName(
  value: string,
): value is ChartMotionPresetName {
  return (MOTION_PRESET_NAMES as string[]).includes(value);
}

export function isCartesianMotionPresetName(
  value: string,
): value is CartesianMotionPresetName {
  return (CARTESIAN_PRESET_NAMES as string[]).includes(value);
}

export function resolveMotionPreset(
  name: ChartMotionPresetName,
): ChartAnimateConfig | CountUpMotionConfig {
  return MOTION_PRESETS[name];
}

export function resolveCartesianMotionPreset(
  name: CartesianMotionPresetName,
): ChartAnimateConfig {
  return CARTESIAN_MOTION_PRESETS[name];
}

export function resolveSeriesEnterDelay(
  enter: ChartAnimateEnterConfig,
  seriesIndex = 0,
): number {
  const base = enter.delay ?? 0;
  const stagger = enter.staggerMs ?? 0;
  return base + seriesIndex * stagger;
}

export function applyCountUpPreset(duration?: number): CountUpMotionConfig {
  if (duration == null) return { ...COUNT_UP_MOTION_CONFIG };
  return { ...COUNT_UP_MOTION_CONFIG, duration };
}

function enterConfigsEqual(
  a: ChartAnimateEnterConfig | false | null | undefined,
  b: ChartAnimateEnterConfig | false | null | undefined,
): boolean {
  if (a === false || b === false) return a === b;
  if (a == null || b == null) return a === b;
  return (
    (a.duration ?? 520) === (b.duration ?? 520) &&
    (a.easing ?? "cubic-bezier(0.22, 1, 0.36, 1)") ===
      (b.easing ?? "cubic-bezier(0.22, 1, 0.36, 1)") &&
    (a.delay ?? 0) === (b.delay ?? 0) &&
    (a.staggerMs ?? 0) === (b.staggerMs ?? 0)
  );
}

function updateConfigsEqual(
  a: ChartAnimateConfig["update"],
  b: ChartAnimateConfig["update"],
): boolean {
  if (a === false || b === false) return a === b;
  if (a == null || b == null) return a === b;
  const aDuration =
    typeof a.easing === "object"
      ? (a.easing.duration ?? a.duration ?? 220)
      : (a.duration ?? 220);
  const bDuration =
    typeof b.easing === "object"
      ? (b.easing.duration ?? b.duration ?? 220)
      : (b.duration ?? 220);
  return aDuration === bDuration;
}

export function matchCartesianMotionPreset(
  config: ChartAnimateConfig,
): CartesianMotionPresetName | undefined {
  for (const name of CARTESIAN_PRESET_NAMES) {
    const preset = CARTESIAN_MOTION_PRESETS[name];
    if (
      enterConfigsEqual(config.enter, preset.enter) &&
      updateConfigsEqual(config.update, preset.update)
    ) {
      return name;
    }
  }
  return undefined;
}
