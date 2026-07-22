import type { AggregateRowsOptions, AggregateSpec } from "../../aggregateRows";
import type { FieldProfile } from "../../types";
import type { VerticalId } from "../../rulePacks/types";

export type PanelRecipeKind = "stat" | "cartesian" | "table" | "waterfall" | "funnel" | "pie" | "donut" | "matrix";

export type ChartMarkType = "bar" | "line" | "area";

export type RecipeWhereClause = NonNullable<AggregateRowsOptions["where"]>[number];

export type PanelRecipe = {
  questionId: string;
  title: string;
  intent: string;
  panelType: PanelRecipeKind;
  markType?: ChartMarkType;
  orientation?: "vertical" | "horizontal";
  vertical?: VerticalId;
  groupBy?: string;
  xField?: string;
  yField?: string;
  yFields?: string[];
  stack?: boolean;
  aggregates?: Record<string, AggregateSpec>;
  where?: RecipeWhereClause[];
  /** Skip aggregate — use preparedRows directly. */
  preparedRows?: Record<string, unknown>[];
  tableColumns?: Array<{ key: string; label?: string; align?: "left" | "right" }>;
  kpiValue?: number;
  kpiLabel?: string;
  stageOrder?: readonly string[];
  waterfallItems?: Array<{
    name: string;
    value: number;
    isTotal?: boolean;
    tone?: string;
  }>;
};

export type ChartGeometry = {
  panelType: PanelRecipeKind;
  markType?: ChartMarkType;
  orientation?: "vertical" | "horizontal";
  rules: string[];
};

export type CompileRecipeOptions = {
  dataProfile?: import("../../types").DataProfile;
  theme?: import("../../types").ThemeName;
  mode?: import("../../types").ChartMode;
};

export type CompiledRecipeResult = {
  panel: import("../../types").PanelSpec;
  rows: Record<string, unknown>[];
  geometry: ChartGeometry;
  matchedRules: string[];
};

export type GeometryInput = {
  kind: "kpi" | "chart" | "table";
  intent: string;
  fieldProfiles: FieldProfile[];
  xField?: string;
  yField?: string;
  yFields?: string[];
  dimensionKey?: string;
  /** C165 — L1 profile hints for geometry selection. */
  grain?: import("../../types").TabularGrain;
  timeSpan?: import("../../types").TimeSpan;
  cardinalities?: Record<string, number>;
};

export function findField(
  fieldProfiles: FieldProfile[],
  pattern: RegExp,
  role?: FieldProfile["role"],
): string | undefined {
  return fieldProfiles.find(
    (profile) => (!role || profile.role === role) && pattern.test(profile.name),
  )?.name;
}

export function roleOf(
  fieldProfiles: FieldProfile[],
  field: string,
): FieldProfile["role"] | undefined {
  return fieldProfiles.find((profile) => profile.name === field)?.role;
}
