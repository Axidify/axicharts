export * from "./_container";
export { Stat, type StatProps, type StatSurface, type StatTone } from "../stat/Stat";
export {
  ensurePresentationStyles,
  presentationEnterStyle,
} from "../presentation/motion";
export {
  buildSingleValueA11yDescriptor,
  buildChartA11yTable,
  ChartA11yFallback,
  SingleValueChartA11yRoot,
  CHART_A11Y_ATTR,
  enhanceSvgMarkup,
  resolveChartA11y,
  serializeA11yDescriptor,
  type ChartA11yDescriptor,
  type ChartA11yTable,
} from "../a11y";
export {
  readTagTones,
  resolveTagStatTone,
  seriesToneToStatTone,
} from "../alarm/tagTones";
export type { SeriesTone } from "@axicharts/charts-canvas";
