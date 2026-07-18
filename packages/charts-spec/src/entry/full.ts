import {
  registerCategory,
  type PanelCategory,
} from "../panelCategories";

const ALL_CATEGORIES: PanelCategory[] = [
  "cartesian",
  "distribution",
  "financial",
  "matrix",
  "industrial",
  "kpi",
];

registerCategory(...ALL_CATEGORIES);

export * from "../index";
