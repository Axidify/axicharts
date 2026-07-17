import type { AlarmItem } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readAlarms(data: Record<string, unknown>): AlarmItem[] {
  const alarms = data.alarms;
  if (!Array.isArray(alarms)) return [];

  return alarms.filter(
    (item): item is AlarmItem =>
      isRecord(item) && typeof item.id === "string" && typeof item.message === "string",
  );
}
