import type { RuntimeDashboardSpec } from "../types";

type LayoutSpec<K extends string> = Extract<RuntimeDashboardSpec, Record<K, unknown>>;

function layoutPart<K extends "dashboard" | "wall" | "hybrid">(
  spec: RuntimeDashboardSpec | undefined,
  key: K,
): LayoutSpec<K>[K] {
  if (!spec || !(key in spec)) {
    throw new Error(`expected a runtime spec with "${key}", got layout ${String(spec?.layout)}`);
  }
  return (spec as LayoutSpec<K>)[key];
}

/** Test helpers: narrow a RuntimeDashboardSpec to one layout or throw. */
export const embedDashboard = (spec: RuntimeDashboardSpec | undefined) =>
  layoutPart(spec, "dashboard");
export const mosaicWall = (spec: RuntimeDashboardSpec | undefined) => layoutPart(spec, "wall");
export const hybridLayout = (spec: RuntimeDashboardSpec | undefined) =>
  layoutPart(spec, "hybrid");
