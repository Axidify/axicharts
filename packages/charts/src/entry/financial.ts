export * from "./_container";
export {
  CandlestickChart,
  type CandlestickChartProps,
  type OhlcPoint,
} from "../candlestick/CandlestickChart";
export {
  WaterfallChart,
  type WaterfallChartProps,
  type WaterfallItem,
} from "../waterfall/WaterfallChart";
export {
  ChartSyncGroup,
  useChartSync,
  useOptionalChartSync,
} from "../sync/ChartSyncContext";
export {
  resolveFollowerBrushRange,
  type BrushRange,
} from "../sync/brushSync";
export {
  normalizeBrushRange,
  isEmptyBrushRange,
  DEFAULT_BRUSH_MIN_RANGE_PERCENT,
} from "../sync/brushRange";
export {
  useCartesianBrush,
  useBrushSync,
  type UseCartesianBrushInput,
} from "../sync/useCartesianBrush";
export { useEChartsInteraction } from "../sync/useEChartsInteraction";
export {
  buildCandlestickA11yDescriptor,
  buildChartA11yTable,
  ChartA11yFallback,
  EChartsChartA11yRoot,
  CHART_A11Y_ATTR,
  enhanceSvgMarkup,
  resolveChartA11y,
  serializeA11yDescriptor,
  type ChartA11yDescriptor,
  type ChartA11yTable,
} from "../a11y";
export {
  formatTick,
  registerTickFormat,
  unregisterTickFormat,
} from "@axicharts/charts-core";
