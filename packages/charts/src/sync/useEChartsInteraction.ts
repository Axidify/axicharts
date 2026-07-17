import { useCallback } from "react";
import type {
  EChartCursorEvent,
  EChartItemHoverEvent,
} from "@axicharts/charts-echarts";
import { useChartInteraction } from "../interaction/ChartInteractionContext";
import { useEChartsSync } from "./useEChartsSync";

export function useEChartsInteraction() {
  const { setCursor, setItemHover } = useChartInteraction();
  const sync = useEChartsSync();

  const onCursor = useCallback(
    (event: EChartCursorEvent) => {
      setCursor(event);
    },
    [setCursor],
  );

  const onItemHover = useCallback(
    (event: EChartItemHoverEvent) => {
      setItemHover(event);
    },
    [setItemHover],
  );

  return {
    ...sync,
    onCursor,
    onItemHover,
  };
}
