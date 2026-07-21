export type AgentErrorExample = {
  code: string;
  family: "cartesian" | "distribution" | "matrix" | "cross-family";
  note: string;
  bad: string;
  fixed: string;
};

/** P4-2 — one bad→fixed example per major validator code (Track C2). */
export const AGENT_ERROR_GALLERY: AgentErrorExample[] = [
  {
    code: "UNKNOWN_FIELD",
    family: "cartesian",
    note: "Typo in encoding or mark field — validator suggests closest column.",
    bad: `{ "type": "cartesian", "encoding": { "x": { "field": "wek" } }, "marks": [{ "type": "bar", "field": "revenue" }] }`,
    fixed: `{ "encoding": { "x": { "field": "week" } }, "marks": [{ "type": "bar", "field": "revenue" }] }`,
  },
  {
    code: "MISSING_DATA_MARK",
    family: "cartesian",
    note: "Overlays (rule/band) require at least one bar, line, or area mark.",
    bad: `{ "type": "cartesian", "marks": [{ "type": "rule", "value": 50 }] }`,
    fixed: `{ "marks": [{ "type": "bar", "field": "revenue" }, { "type": "rule", "value": 50 }] }`,
  },
  {
    code: "INVALID_BAND_RANGE",
    family: "cartesian",
    note: "Band min must be less than max.",
    bad: `{ "marks": [{ "type": "band", "min": 80, "max": 20 }] }`,
    fixed: `{ "marks": [{ "type": "band", "min": 20, "max": 80 }] }`,
  },
  {
    code: "INVALID_RULE_VALUE",
    family: "cartesian",
    note: "Rule overlay needs a finite numeric value.",
    bad: `{ "marks": [{ "type": "bar", "field": "revenue" }, { "type": "rule", "value": "fifty" }] }`,
    fixed: `{ "marks": [{ "type": "bar", "field": "revenue" }, { "type": "rule", "value": 50 }] }`,
  },
  {
    code: "DUPLICATE_OVERLAY_CHANNEL",
    family: "cartesian",
    note: "Prefer marks[] only — legacy props.referenceLines duplicates rule marks. Strict validate_panel blocks this (B5).",
    bad: `{ "marks": [{ "type": "bar", "field": "revenue" }, { "type": "rule", "value": 50 }], "props": { "referenceLines": [{ "value": 60 }] } }`,
    fixed: `{ "marks": [{ "type": "bar", "field": "revenue" }, { "type": "rule", "value": 50, "label": "Quota" }] }`,
  },
  {
    code: "UNKNOWN_MARK",
    family: "cartesian",
    note: "Closed catalog — call list_marks({ family: \"cartesian\" }).",
    bad: `{ "marks": [{ "type": "column", "field": "revenue" }] }`,
    fixed: `{ "marks": [{ "type": "bar", "field": "revenue" }] }`,
  },
  {
    code: "NOT_CARTESIAN_PANEL",
    family: "cartesian",
    note: "Use type cartesian + marks[], not legacy type line.",
    bad: `{ "type": "line", "props": { "series": [{ "field": "revenue" }] } }`,
    fixed: `{ "type": "cartesian", "encoding": { "x": { "field": "week" } }, "marks": [{ "type": "line", "field": "revenue" }] }`,
  },
  {
    code: "NOT_DISTRIBUTION_PANEL",
    family: "distribution",
    note: "Pie/donut/funnel use type distribution + marks[], not type pie.",
    bad: `{ "type": "pie", "props": { "data": [{ "name": "Chrome", "value": 48 }] } }`,
    fixed: `{ "type": "distribution", "encoding": { "angle": { "field": "share" }, "color": { "field": "browser" } }, "marks": [{ "type": "arc", "field": "share" }] }`,
  },
  {
    code: "MISSING_ANGLE_FIELD",
    family: "distribution",
    note: "Distribution panels need angle encoding + arc or funnel mark.",
    bad: `{ "type": "distribution", "marks": [{ "type": "label", "show": true }] }`,
    fixed: `{ "encoding": { "angle": { "field": "share" }, "color": { "field": "browser" } }, "marks": [{ "type": "arc", "field": "share" }] }`,
  },
  {
    code: "CELL_WITHOUT_COLOR_ENCODING",
    family: "distribution",
    note: "Highlight cell mark requires color encoding on the panel.",
    bad: `{ "type": "distribution", "marks": [{ "type": "cell", "field": "Enterprise" }] }`,
    fixed: `{ "encoding": { "color": { "field": "browser" } }, "marks": [{ "type": "arc", "field": "share" }, { "type": "cell", "field": "Enterprise" }] }`,
  },
  {
    code: "NOT_MATRIX_PANEL",
    family: "matrix",
    note: "Heatmaps use type matrix + cell mark, not type heatmap.",
    bad: `{ "type": "heatmap", "props": { "xField": "hour", "yField": "day" } }`,
    fixed: `{ "type": "matrix", "encoding": { "x": { "field": "hour" }, "y": { "field": "day" }, "value": { "field": "latency" } }, "marks": [{ "type": "cell", "field": "latency" }, { "type": "colorScale", "field": "latency" }] }`,
  },
  {
    code: "MISSING_COLOR_SCALE",
    family: "matrix",
    note: "Matrix heatmaps need cell + colorScale marks together.",
    bad: `{ "type": "matrix", "marks": [{ "type": "cell", "field": "latency" }] }`,
    fixed: `{ "marks": [{ "type": "cell", "field": "latency" }, { "type": "colorScale", "field": "latency" }] }`,
  },
  {
    code: "LEGACY_PANEL_NOT_AGENT_SAFE",
    family: "cross-family",
    note: "strict validate_panel rejects Tier-2 types (gauge, waterfall, donut as type).",
    bad: `{ "type": "gauge", "props": { "value": 72, "min": 0, "max": 100 } }`,
    fixed: `create_panel({ family: "cartesian", intent: "utilization gauge as bar with target rule at 80", fields: ["asset", "utilization"] })`,
  },
];
