const TIME_FIELD_RE =
  /week|month|day|hour|date|time|period|quarter|timestamp|ts/i;

/**
 * Pick the category / time axis column from a data profile.
 * Prefers time-like field names, then the first non-metric column.
 */
export function inferCategoryFieldFromProfile(
  profileFields: string[] | undefined,
  metricNames: string[],
): string {
  const fields = profileFields ?? [];
  const metricSet = new Set(metricNames);

  for (const field of fields) {
    if (!metricSet.has(field) && TIME_FIELD_RE.test(field)) {
      return field;
    }
  }

  for (const field of fields) {
    if (!metricSet.has(field)) {
      return field;
    }
  }

  return "time";
}

export { TIME_FIELD_RE };
