/** Levenshtein distance for field name suggestions. */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]!;
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j]!;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j]! + 1, dp[j - 1]! + 1, prev + cost);
      prev = temp;
    }
  }
  return dp[n]!;
}

export function suggestField(name: string, fields: string[]): string | undefined {
  if (fields.length === 0) return undefined;
  const lower = name.toLowerCase();
  const exact = fields.find((f) => f.toLowerCase() === lower);
  if (exact) return exact;

  let best: { field: string; distance: number } | undefined;
  for (const field of fields) {
    const distance = levenshtein(lower, field.toLowerCase());
    const threshold = Math.max(2, Math.floor(field.length / 3));
    if (distance <= threshold && (!best || distance < best.distance)) {
      best = { field, distance };
    }
  }
  return best?.field;
}
