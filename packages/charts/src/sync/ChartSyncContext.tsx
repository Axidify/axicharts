import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

export type BrushRange = {
  start: number;
  end: number;
};

export type ChartSyncState = {
  index: number | null;
  sourceId: string | null;
  brushRange: BrushRange | null;
  brushSourceId: string | null;
};

export type ChartSyncContextValue = ChartSyncState & {
  publish: (index: number | null, sourceId: string) => void;
  publishBrushRange: (range: BrushRange | null, sourceId: string) => void;
};

const ChartSyncContext = createContext<ChartSyncContextValue | null>(null);

export function ChartSyncGroup({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [state, setState] = useState<ChartSyncState>({
    index: null,
    sourceId: null,
    brushRange: null,
    brushSourceId: null,
  });

  const publish = useCallback((index: number | null, sourceId: string) => {
    setState((prev) => {
      if (prev.index === index && prev.sourceId === sourceId) {
        return prev;
      }
      return { ...prev, index, sourceId };
    });
  }, []);

  const publishBrushRange = useCallback(
    (brushRange: BrushRange | null, brushSourceId: string) => {
      setState((prev) => {
        if (
          prev.brushRange?.start === brushRange?.start &&
          prev.brushRange?.end === brushRange?.end &&
          prev.brushSourceId === brushSourceId
        ) {
          return prev;
        }
        return { ...prev, brushRange, brushSourceId };
      });
    },
    [],
  );

  const value = useMemo(
    () => ({ ...state, publish, publishBrushRange }),
    [state, publish, publishBrushRange],
  );

  return (
    <ChartSyncContext.Provider value={value}>
      {children}
    </ChartSyncContext.Provider>
  );
}

export function useOptionalChartSync(): ChartSyncContextValue | null {
  return useContext(ChartSyncContext);
}

export function useChartSync(): ChartSyncContextValue {
  const ctx = useContext(ChartSyncContext);
  if (!ctx) {
    throw new Error("useChartSync must be used within ChartSyncGroup");
  }
  return ctx;
}
