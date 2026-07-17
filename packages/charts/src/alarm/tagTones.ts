import type { SeriesTone, PlotSeries } from "@axicharts/charts-canvas";
import type { StatTone } from "../stat/Stat";

export type AlarmSeverity = "normal" | "warning" | "alarm" | "critical";

const SERIES_TONE_RANK: Record<SeriesTone, number> = {
  default: 0,
  info: 1,
  success: 1,
  warning: 2,
  critical: 3,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function alarmSeverityToSeriesTone(severity: string): SeriesTone {
  switch (severity) {
    case "critical":
    case "alarm":
      return "critical";
    case "warning":
      return "warning";
    default:
      return "default";
  }
}

export function seriesToneToStatTone(tone: SeriesTone): StatTone {
  switch (tone) {
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "critical":
      return "critical";
    default:
      return "neutral";
  }
}

function parseToneValue(value: string): SeriesTone {
  if (
    value === "default" ||
    value === "info" ||
    value === "success" ||
    value === "warning" ||
    value === "critical"
  ) {
    return value;
  }
  return alarmSeverityToSeriesTone(value);
}

export function mergeSeriesTone(
  current: SeriesTone | undefined,
  next: SeriesTone,
): SeriesTone {
  if (!current) return next;
  return SERIES_TONE_RANK[next] >= SERIES_TONE_RANK[current] ? next : current;
}

export function readTagTones(
  data: Record<string, unknown>,
): Record<string, SeriesTone> {
  const tones: Record<string, SeriesTone> = {};

  const explicit = data.tones ?? data.tagTones;
  if (isRecord(explicit)) {
    for (const [key, value] of Object.entries(explicit)) {
      if (typeof value === "string") {
        tones[key] = parseToneValue(value);
      }
    }
  }

  const alarms = data.alarms;
  if (!Array.isArray(alarms)) return tones;

  for (const item of alarms) {
    if (!isRecord(item) || item.acknowledged) continue;
    const tag = item.tag ?? item.metric ?? item.panelId;
    if (typeof tag !== "string") continue;
    const severity = item.severity;
    if (typeof severity !== "string") continue;
    tones[tag] = mergeSeriesTone(
      tones[tag],
      alarmSeverityToSeriesTone(severity),
    );
  }

  return tones;
}

export function applyTagTonesToSeries(
  series: PlotSeries[],
  tagTones: Record<string, SeriesTone>,
): PlotSeries[] {
  return series.map((item) => {
    const fromTag = tagTones[item.name];
    if (!fromTag || item.tone) return item;
    return { ...item, tone: fromTag };
  });
}

export function resolveTagStatTone(
  tagTones: Record<string, SeriesTone> | undefined,
  key: string | undefined,
  explicit?: StatTone,
): StatTone | undefined {
  if (explicit) return explicit;
  if (!key || !tagTones?.[key]) return undefined;
  return seriesToneToStatTone(tagTones[key]);
}
