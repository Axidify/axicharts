import type { PlannerReviewReason } from "../createCartesianPanel";
import type { SpecData } from "../types";

export function plannerReviewMessage(reviewReason: PlannerReviewReason): string {
  if (reviewReason === "vague_intent") {
    return "Intent is too vague — name a chart type (bar, line, area) and what to plot. No marks were generated.";
  }
  if (reviewReason === "no_data_mark") {
    return "Intent matched overlays only (rule/band) — add a data mark (bar, line, area) or refine your intent.";
  }
  return "Generated spec needs review — adjust marks manually or refine your intent.";
}

export function dataFieldSignature(rows: SpecData): string {
  if (rows.length === 0) return "";
  return Object.keys(rows[0] ?? {})
    .sort()
    .join("\0");
}

export function dataColumnsChanged(previous: string, next: string): boolean {
  return previous !== "" && next !== "" && previous !== next;
}
