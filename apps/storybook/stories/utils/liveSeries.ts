import { useEffect, useState } from "react";

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function useLiveSeries(initial: number[], hz = 5): number[] {
  const [data, setData] = useState(initial);

  useEffect(() => {
    const id = window.setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1] ?? 0;
        const delta = (Math.random() - 0.5) * (last * 0.08 + 1);
        return [...prev.slice(1), Math.max(0, last + delta)];
      });
    }, 1000 / hz);

    return () => window.clearInterval(id);
  }, [hz]);

  return data;
}
