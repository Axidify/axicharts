import type { ValidationIssue } from "./validatePanel";

type HintResolver = string | ((issue: ValidationIssue) => string);

/** Chat-UI friendly hints keyed by validator code. Falls back to suggestion, then message. */
const HINTS: Record<string, HintResolver> = {
  MISSING_X_FIELD:
    "This chart needs a category field for the horizontal axis. Try grouping by a text or date column (e.g. status, week).",
  MISSING_ANGLE_FIELD:
    "Pie and donut charts need a numeric value field and a category field. Map the value to angle and the label to color.",
  MISSING_DATA_MARK: (issue) => {
    if (issue.message.includes("arc") || issue.message.includes("funnel")) {
      return "Pie and funnel charts need an arc or funnel mark with a numeric field.";
    }
    if (issue.message.includes("bar, line, area")) {
      return "Add at least one bar, line, or area series — overlay marks (rule, band) are not enough on their own.";
    }
    return "The chart spec is missing a data series. Add a bar, line, area, or arc mark with a field.";
  },
  EMPTY_DATA: "No data rows were provided. Pass at least one row before rendering the chart.",
  UNKNOWN_FIELD: (issue) =>
    issue.suggestion
      ? `Field not found in data. Did you mean "${issue.suggestion}"?`
      : "A field referenced in the chart does not exist in the data.",
  NOT_CARTESIAN_PANEL:
    "Use type cartesian with marks[] for bar, line, and area charts — not legacy type line or bar.",
  NOT_DISTRIBUTION_PANEL:
    "Use type distribution with marks[] for pie and donut charts — not legacy type pie.",
  LEGACY_PANEL_NOT_AGENT_SAFE:
    "This panel type is not supported in agent chat. Use cartesian or distribution with marks[].",
  UNSUPPORTED_FAMILY: (issue) =>
    issue.suggestion ?? "This chart family is not supported yet. Try a bar or line chart instead.",
  UNKNOWN_MARK: (issue) =>
    issue.suggestion
      ? `Unknown mark type. Supported marks: ${issue.suggestion}.`
      : "Unknown mark type. Use list_marks or create_panel to pick a valid mark.",
  DUPLICATE_OVERLAY_CHANNEL:
    "Remove legacy props.referenceLines — use rule marks in marks[] instead.",
  INVALID_BAND_RANGE: "Band overlay min must be less than max.",
  INVALID_RULE_VALUE: "Reference line overlays need a finite numeric value.",
  CELL_WITHOUT_COLOR_ENCODING:
    "Highlight cells require a color encoding on the panel (e.g. encoding.color.field).",
  MULTIPLE_DATA_MARKS:
    "Pie and funnel panels allow only one arc or funnel mark per panel.",
};

/**
 * Map a validation issue to a short, user-facing hint for chat UIs and activity timelines.
 * Server logs should still use the full `ValidationIssue` (code, path, fix).
 */
export function toUserFacingHint(issue: ValidationIssue): string {
  const entry = HINTS[issue.code];
  if (typeof entry === "function") return entry(issue);
  if (typeof entry === "string") return entry;
  if (issue.suggestion) return issue.suggestion;
  return issue.message;
}

/** Map multiple validation issues to user-facing hints (deduped, order preserved). */
export function toUserFacingHints(issues: ValidationIssue[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const issue of issues) {
    const hint = toUserFacingHint(issue);
    if (!seen.has(hint)) {
      seen.add(hint);
      out.push(hint);
    }
  }
  return out;
}
