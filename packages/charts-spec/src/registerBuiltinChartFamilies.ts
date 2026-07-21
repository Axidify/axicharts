import { CARTESIAN_MARK_CATALOG } from "./createCartesianPanel";
import { DISTRIBUTION_MARK_CATALOG } from "./createDistributionPanel";
import { MATRIX_MARK_CATALOG } from "./createMatrixPanel";
import { clearChartFamilies, getChartFamily, registerChartFamily } from "./familyRegistry";
import { normalizeToCartesian } from "./normalizeToCartesian";
import { normalizeToDistribution } from "./normalizeToDistribution";
import { normalizeToMatrix } from "./normalizeToMatrix";
import type { PanelSpec } from "./types";
import { validateCartesianSpec } from "./cartesianValidation";
import { validateDistributionSpec } from "./distributionValidation";
import { validateMatrixSpec } from "./matrixValidation";
import type { ValidatePanelOptions, ValidatePanelResult } from "./validatePanel";

function cartesianValidate(
  spec: PanelSpec,
  options: ValidatePanelOptions,
): ValidatePanelResult {
  const family = "cartesian" as const;
  const normalized =
    spec.type === "cartesian" || spec.type === "blocks" ? spec : normalizeToCartesian(spec);
  const strict = options.strict ?? false;
  const result = validateCartesianSpec(normalized, { ...options, strict });
  if (!result.ok) {
    return {
      ok: false,
      family,
      errors: result.errors.map((issue) => ({ ...issue, family })),
    };
  }
  return {
    ok: true,
    family,
    spec: normalized,
    warnings: result.warnings.map((issue) => ({ ...issue, family })),
  };
}

function distributionValidate(
  spec: PanelSpec,
  options: ValidatePanelOptions,
): ValidatePanelResult {
  const family = "distribution" as const;
  const normalized =
    spec.type === "distribution" ? spec : normalizeToDistribution(spec);
  const result = validateDistributionSpec(normalized, options);
  if (!result.ok) {
    return {
      ok: false,
      family,
      errors: result.errors.map((issue) => ({ ...issue, family })),
    };
  }
  return {
    ok: true,
    family,
    spec: normalized,
    warnings: result.warnings.map((issue) => ({ ...issue, family })),
  };
}

function matrixValidate(spec: PanelSpec, options: ValidatePanelOptions): ValidatePanelResult {
  const family = "matrix" as const;
  const normalized = spec.type === "matrix" ? spec : normalizeToMatrix(spec);
  const result = validateMatrixSpec(normalized, options);
  if (!result.ok) {
    return {
      ok: false,
      family,
      errors: result.errors.map((issue) => ({ ...issue, family })),
    };
  }
  return {
    ok: true,
    family,
    spec: normalized,
    warnings: result.warnings.map((issue) => ({ ...issue, family })),
  };
}

let builtinsRegistered = false;

/** Register RFC-004 built-in agent families (idempotent). */
export function registerBuiltinChartFamilies(): void {
  if (builtinsRegistered) return;

  if (!getChartFamily("cartesian")) {
    registerChartFamily({
      family: "cartesian",
      panelTypes: ["cartesian", "blocks", "line", "bar", "area", "combo"],
      coordinateSystem: "cartesian",
      markCatalog: CARTESIAN_MARK_CATALOG.map((entry) => ({
        mark: entry.mark,
        role: entry.role,
        required: entry.required,
        optional: entry.optional,
      })),
      validate: cartesianValidate,
    });
  }

  if (!getChartFamily("distribution")) {
    registerChartFamily({
      family: "distribution",
      panelTypes: ["distribution", "pie", "donut", "funnel"],
      coordinateSystem: "polar",
      markCatalog: DISTRIBUTION_MARK_CATALOG.map((entry) => ({
        mark: entry.mark,
        role: entry.role,
        required: entry.required,
        optional: entry.optional,
      })),
      validate: distributionValidate,
    });
  }

  if (!getChartFamily("matrix")) {
    registerChartFamily({
      family: "matrix",
      panelTypes: ["matrix", "heatmap", "calendar", "calendar-heatmap"],
      coordinateSystem: "matrix",
      markCatalog: MATRIX_MARK_CATALOG.map((entry) => ({
        mark: entry.mark,
        role: entry.role,
        required: entry.required,
        optional: entry.optional,
      })),
      validate: matrixValidate,
    });
  }

  builtinsRegistered = true;
}

/** Test helper — clears built-in registration latch. */
export function resetChartFamilyRegistry(): void {
  builtinsRegistered = false;
  clearChartFamilies();
}
