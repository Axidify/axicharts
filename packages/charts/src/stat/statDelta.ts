import type { StatSurface } from "./Stat";

export type StatDeltaDirection = "up" | "down" | "neutral";

export function inferStatDeltaDirection(delta: string): StatDeltaDirection {
  const trimmed = delta.trim();
  if (trimmed.startsWith("+")) return "up";
  if (trimmed.startsWith("-")) return "down";
  return "neutral";
}

export function statDeltaChipStyle(
  direction: StatDeltaDirection,
  surface: StatSurface,
): { background: string; color: string } {
  if (surface === "light") {
    if (direction === "up") return { background: "#ecfdf5", color: "#15803d" };
    if (direction === "down") return { background: "#fff7ed", color: "#c2410c" };
    return { background: "#f1f5f9", color: "#64748b" };
  }
  if (direction === "up") {
    return { background: "rgba(22, 163, 74, 0.16)", color: "#4ade80" };
  }
  if (direction === "down") {
    return { background: "rgba(220, 38, 38, 0.16)", color: "#f87171" };
  }
  return { background: "rgba(100, 116, 139, 0.2)", color: "#94a3b8" };
}
