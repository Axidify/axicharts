import { useEffect, useRef, useState, type RefObject } from "react";

type Size = { width: number; height: number };

export function useResizeObserver(
  debounceMs = 50,
): [RefObject<HTMLDivElement | null>, Size] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const next = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      };

      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setSize(next), debounceMs);
    });

    observer.observe(element);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [debounceMs]);

  return [ref, size];
}
