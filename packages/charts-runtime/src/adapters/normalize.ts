function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function defaultRestMapper(payload: unknown): Record<string, unknown> {
  if (!isRecord(payload)) {
    throw new Error("REST adapter expects a JSON object");
  }
  return payload;
}

export function mergeAdapterExtras(
  mapped: Record<string, unknown>,
  payload: unknown,
): Record<string, unknown> {
  if (!isRecord(payload)) return mapped;
  const extras: Record<string, unknown> = {};
  if (Array.isArray(payload.alarms)) {
    extras.alarms = payload.alarms;
  }
  return Object.keys(extras).length > 0 ? { ...mapped, ...extras } : mapped;
}
