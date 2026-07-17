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
import type { TooltipRow } from "../chrome/Tooltip";

export type ItemHoverEvent = {
  title: string;
  rows: TooltipRow[];
  left: number;
  top: number;
} | null;

export type ChartInteractionContextValue = {
  cursor: PlotCursorEvent;
  itemHover: ItemHoverEvent;
  setCursor: (cursor: PlotCursorEvent) => void;
  setItemHover: (hover: ItemHoverEvent) => void;
};

const ChartInteractionContext =
  createContext<ChartInteractionContextValue | null>(null);

export function ChartInteractionProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [cursor, setCursorState] = useState<PlotCursorEvent>(null);
  const [itemHover, setItemHoverState] = useState<ItemHoverEvent>(null);

  const setCursor = useCallback((next: PlotCursorEvent) => {
    setCursorState(next);
    if (next) setItemHoverState(null);
  }, []);

  const setItemHover = useCallback((next: ItemHoverEvent) => {
    setItemHoverState(next);
    if (next) setCursorState(null);
  }, []);

  const value = useMemo(
    () => ({ cursor, itemHover, setCursor, setItemHover }),
    [cursor, itemHover, setCursor, setItemHover],
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
