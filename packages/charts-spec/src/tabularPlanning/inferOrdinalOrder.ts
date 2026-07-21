/** Known ordinal sequences for common business dimensions (C176 partial). */
const ORDINAL_BY_FIELD: Array<{ pattern: RegExp; order: readonly string[] }> = [
  { pattern: /priority/i, order: ["Critical", "High", "Medium", "Low"] },
  { pattern: /severity/i, order: ["Critical", "High", "Medium", "Low"] },
  { pattern: /stage/i, order: ["Discovery", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"] },
  {
    pattern: /status/i,
    order: ["Open", "In Progress", "Pending", "On Hold", "Resolved", "Closed"],
  },
];

/**
 * Infer sort order for nominal dimensions (priority, stage, status).
 * Returns undefined when the field name does not match a known ordinal kind.
 */
export function inferOrdinalOrder(
  fieldName: string,
  sampleValues: unknown[] = [],
): readonly string[] | undefined {
  const match = ORDINAL_BY_FIELD.find((entry) => entry.pattern.test(fieldName));
  if (!match) return undefined;

  const present = new Set(
    sampleValues.map((value) => String(value ?? "").trim()).filter(Boolean),
  );
  if (present.size === 0) return match.order;

  const ordered = match.order.filter((label) => present.has(label));
  const extras = [...present].filter((label) => !match.order.includes(label)).sort();
  return ordered.length > 0 ? [...ordered, ...extras] : match.order;
}
