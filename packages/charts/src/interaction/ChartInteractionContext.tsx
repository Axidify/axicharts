import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import type { PlotCursorEvent } from "@axicharts/charts-canvas";

export type ChartInteractionContextValue = {
  cursor: PlotCursorEvent;
  setCursor: (cursor: PlotCursorEvent) => void;
};

const ChartInteractionContext =
  createContext<ChartInteractionContextValue | null>(null);

export function ChartInteractionProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [cursor, setCursorState] = useState<PlotCursorEvent>(null);
  const setCursor = useCallback((next: PlotCursorEvent) => {
    setCursorState(next);
  }, []);

  const value = useMemo(
    () => ({ cursor, setCursor }),
    [cursor, setCursor],
  );

  return (
    <ChartInteractionContext.Provider value={value}>
      {children}
    </ChartInteractionContext.Provider>
  );
}

export function useChartInteraction(): ChartInteractionContextValue {
  const ctx = useContext(ChartInteractionContext);
  if (!ctx) {
    throw new Error(
      "useChartInteraction must be used within ChartInteractionProvider",
    );
  }
  return ctx;
}
