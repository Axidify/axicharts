export type MapSurface = "light" | "dark";

export function resolveBounds(
  values: number[],
  min?: number,
  max?: number,
): { min: number; max: number } {
  const computedMin = min ?? Math.min(...values, 0);
  const computedMax = max ?? Math.max(...values, 1);
  return {
    min: computedMin,
    max: computedMax === computedMin ? computedMin + 1 : computedMax,
  };
}

export function colorForValue(
  value: number,
  min: number,
  max: number,
  surface: MapSurface,
): string {
  const fraction = (value - min) / (max - min);
  const clamped = Math.min(1, Math.max(0, fraction));
  if (surface === "dark") {
    const start = { r: 30, g: 58, b: 95 };
    const end = { r: 56, g: 189, b: 248 };
    const r = Math.round(start.r + (end.r - start.r) * clamped);
    const g = Math.round(start.g + (end.g - start.g) * clamped);
    const b = Math.round(start.b + (end.b - start.b) * clamped);
    return `rgb(${r}, ${g}, ${b})`;
  }
  const start = { r: 219, g: 234, b: 254 };
  const end = { r: 29, g: 78, b: 216 };
  const r = Math.round(start.r + (end.r - start.r) * clamped);
  const g = Math.round(start.g + (end.g - start.g) * clamped);
  const b = Math.round(start.b + (end.b - start.b) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

export function resolveSurface(
  explicit: MapSurface | undefined,
  themeName: string | undefined,
): MapSurface {
  if (explicit) return explicit;
  if (themeName === "live" || themeName === "industrial") return "dark";
  return "light";
}
