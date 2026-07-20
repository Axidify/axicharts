const NOMINAL_DIMENSION_RE =
  /priority|severity|status|stage|risk|urgency|impact|tier|rank/i;

const LABEL_COLOR_RULES: ReadonlyArray<{ pattern: RegExp; color: string }> = [
  { pattern: /\bp1\b|critical|urgent|blocker/i, color: "#f43f5e" },
  { pattern: /\bp2\b|\bhigh\b/i, color: "#f59e0b" },
  { pattern: /\bp3\b|\bmedium\b|\bmed\b/i, color: "#3b82f6" },
  { pattern: /\bp4\b|\blow\b/i, color: "#64748b" },
  { pattern: /\bopen\b/i, color: "#3b82f6" },
  { pattern: /\bin[\s-]?progress\b|\bdoing\b/i, color: "#f59e0b" },
  { pattern: /\bclosed\b|\bdone\b|\bresolved\b|\bcomplete/i, color: "#16a34a" },
];

export function isNominalColorDimension(fieldName: string): boolean {
  return NOMINAL_DIMENSION_RE.test(fieldName);
}

/** Map priority/status/stage labels to semantic dashboard colors. */
export function resolveNominalFill(label: unknown): string | undefined {
  if (typeof label !== "string") return undefined;
  const text = label.trim();
  if (!text) return undefined;

  for (const rule of LABEL_COLOR_RULES) {
    if (rule.pattern.test(text)) {
      return rule.color;
    }
  }

  return undefined;
}

export function chartConfigFromNominalLabels(
  labels: string[],
): Record<string, { color: string }> {
  const config: Record<string, { color: string }> = {};
  for (const label of labels) {
    const color = resolveNominalFill(label);
    if (color) {
      config[label] = { color };
    }
  }
  return config;
}
