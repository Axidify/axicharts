import { useCallback, useMemo, useState } from "react";

export type ChromeInsetRegistrar = (id: string, height: number) => void;

export function useChromeInsets(): {
  total: number;
  register: ChromeInsetRegistrar;
} {
  const [insets, setInsets] = useState<Record<string, number>>({});

  const register = useCallback((id: string, height: number) => {
    setInsets((prev) => {
      if (prev[id] === height) return prev;
      if (height <= 0) {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: height };
    });
  }, []);

  const total = useMemo(
    () => Object.values(insets).reduce((sum, height) => sum + height, 0),
    [insets],
  );

  return { total, register };
}
