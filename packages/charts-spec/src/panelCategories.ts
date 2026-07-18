export type PanelCategory =
  | "cartesian"
  | "distribution"
  | "financial"
  | "matrix"
  | "industrial"
  | "kpi"
  | "platform";

export const PANEL_TYPE_CATEGORY: Record<string, PanelCategory> = {
  line: "cartesian",
  area: "cartesian",
  bar: "cartesian",
  combo: "cartesian",
  scatter: "cartesian",
  navigator: "cartesian",
  pie: "distribution",
  donut: "distribution",
  funnel: "distribution",
  boxplot: "distribution",
  histogram: "distribution",
  waterfall: "financial",
  candlestick: "financial",
  heatmap: "matrix",
  calendar: "matrix",
  "calendar-heatmap": "matrix",
  radar: "matrix",
  parallel: "matrix",
  "theme-river": "matrix",
  wordcloud: "matrix",
  "word-cloud": "matrix",
  treemap: "matrix",
  sunburst: "matrix",
  gauge: "industrial",
  digital: "industrial",
  stat: "kpi",
  table: "platform",
  alert: "platform",
  markdown: "platform",
  text: "platform",
  echarts: "platform",
};

const registered = new Set<PanelCategory>();
let scoped = false;

export function registerCategory(...categories: PanelCategory[]): void {
  scoped = true;
  for (const category of categories) {
    registered.add(category);
  }
}

export function clearCategoryRegistration(): void {
  registered.clear();
  scoped = false;
}

export function listRegisteredCategories(): PanelCategory[] {
  if (!scoped) {
    return Object.values(PANEL_TYPE_CATEGORY).filter(
      (category, index, list) => list.indexOf(category) === index,
    );
  }
  return [...registered];
}

export function isCategoryRegistered(category: PanelCategory): boolean {
  if (!scoped) return true;
  if (category === "platform") return true;
  return registered.has(category);
}

export function resolvePanelCategory(type: string): PanelCategory {
  return PANEL_TYPE_CATEGORY[type] ?? "platform";
}

export function assertPanelCategoryEnabled(type: string): void {
  const category = resolvePanelCategory(type);
  if (!isCategoryRegistered(category)) {
    throw new Error(
      `[AxiCharts] Panel type "${type}" requires category "${category}". Call registerCategory("${category}") or import from @axicharts/charts-spec/${category}.`,
    );
  }
}
