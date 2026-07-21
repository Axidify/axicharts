import type { PanelSpec } from "./types";
import type { ValidatePanelOptions, ValidatePanelResult } from "./validatePanel";

export type FamilyMarkCatalogEntry = {
  mark: string;
  role: "data" | "overlay" | "chrome";
  required: string[];
  optional?: string[];
};

export type ChartFamilyRegistration = {
  /** Stable family id — e.g. cartesian, distribution, or plugin id. */
  family: string;
  /** Panel `type` values handled by this registration. */
  panelTypes: string[];
  coordinateSystem: "cartesian" | "polar" | "matrix" | "none";
  markCatalog: FamilyMarkCatalogEntry[];
  normalize?: (spec: PanelSpec) => PanelSpec;
  validate: (spec: PanelSpec, options: ValidatePanelOptions) => ValidatePanelResult;
};

const families = new Map<string, ChartFamilyRegistration>();
const panelTypeIndex = new Map<string, string>();

export function registerChartFamily(registration: ChartFamilyRegistration): void {
  const family = registration.family.trim();
  if (!family) {
    throw new Error("[AxiCharts] registerChartFamily: family is required");
  }
  if (families.has(family)) {
    throw new Error(`[AxiCharts] Chart family "${family}" is already registered`);
  }
  for (const panelType of registration.panelTypes) {
    const key = panelType.trim();
    if (!key) continue;
    if (panelTypeIndex.has(key)) {
      throw new Error(
        `[AxiCharts] Panel type "${key}" is already registered to family "${panelTypeIndex.get(key)}"`,
      );
    }
    panelTypeIndex.set(key, family);
  }
  families.set(family, registration);
}

export function getChartFamily(family: string): ChartFamilyRegistration | undefined {
  return families.get(family);
}

export function listChartFamilies(): ChartFamilyRegistration[] {
  return [...families.values()];
}

export function resolveRegisteredFamily(spec: PanelSpec): ChartFamilyRegistration | undefined {
  const familyId = panelTypeIndex.get(spec.type);
  if (!familyId) return undefined;
  return families.get(familyId);
}

export function clearChartFamilies(): void {
  families.clear();
  panelTypeIndex.clear();
}
