import { useEffect, useState } from "react";

export function useIsStale(
  lastUpdatedAt: number | undefined,
  staleAfterMs: number | undefined,
  enabled: boolean,
): boolean {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled || lastUpdatedAt == null || staleAfterMs == null) {
      return;
    }

    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [enabled, lastUpdatedAt, staleAfterMs]);

  if (!enabled || lastUpdatedAt == null || staleAfterMs == null) {
    return false;
  }

  return now - lastUpdatedAt >= staleAfterMs;
}
