import type { ComponentType } from "react";

export type ChartRenderer = "svg" | "canvas";

/** Inputs a spec compiler hands to a registered chart type's `fromSpec` mapper. */
export type ChartSpecInput = {
  /** Panel `props`, after spec-level normalization. */
  props: Record<string, unknown>;
  /** Object-shaped panel data (e.g. `{ nodes, links }`); `{}` for row data. */
  data: Record<string, unknown>;
  /** Row-shaped panel data; `[]` for object data. */
  rows: Record<string, unknown>[];
};

export type ChartTypeRegistration = {
  type: string;
  Chart: ComponentType<Record<string, unknown>>;
  defaultRenderer?: ChartRenderer;
  /**
   * Map a panel spec to `Chart` props. When omitted, spec compilers merge
   * object data, the first row, and panel props.
   */
  fromSpec?: (input: ChartSpecInput) => Record<string, unknown>;
};
