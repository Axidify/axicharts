import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

export type ChartSyncState = {
  index: number | null;
  sourceId: string | null;
};

export type ChartSyncContextValue = ChartSyncState & {
  publish: (index: number | null, sourceId: string) => void;
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
  });

  const publish = useCallback((index: number | null, sourceId: string) => {
    setState((prev) => {
      if (prev.index === index && prev.sourceId === sourceId) {
        return prev;
      }
      return { index, sourceId };
    });
  }, []);

  const value = useMemo(
    () => ({ ...state, publish }),
    [state, publish],
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
