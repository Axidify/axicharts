import { CARTESIAN_MARK_CATALOG } from "./createCartesianPanel";
import { DISTRIBUTION_MARK_CATALOG } from "./createDistributionPanel";
import { MATRIX_MARK_CATALOG } from "./createMatrixPanel";
import { clearChartFamilies, getChartFamily, registerChartFamily } from "./familyRegistry";
import { normalizeToCartesian } from "./normalizeToCartesian";
import { normalizeToDistribution } from "./normalizeToDistribution";
import { normalizeToMatrix } from "./normalizeToMatrix";
import type { PanelSpec } from "./types";
import { detectLegacyOverlayProps, validateCartesianSpec } from "./cartesianValidation";
import { validateDistributionSpec } from "./distributionValidation";
import { validateMatrixSpec } from "./matrixValidation";
import type { ValidatePanelOptions, ValidatePanelResult } from "./validatePanel";

const LEGACY_SERIES_TYPES = new Set(["line", "bar", "area", "combo"]);

/**
 * Legacy `type: "line" | "bar" | "area" | "combo"` panels that carry chart-ready
 * `props.categories` / `props.series` instead of row encoding. `compilePanel`
 * renders them directly; they can't normalize to `marks[]` (no fields).
 */
function isLegacySeriesPropsPanel(spec: PanelSpec): boolean {
  if (!LEGACY_SERIES_TYPES.has(spec.type)) return false;
  const y = spec.encoding?.y;
  const hasRowEncoding = Array.isArray(y) ? y.length > 0 : Boolean(y?.field);
  return !hasRowEncoding && Array.isArray(spec.props?.series);
}

function cartesianValidate(
  spec: PanelSpec,
  options: ValidatePanelOptions,
): ValidatePanelResult {
  const family = "cartesian" as const;
  const strict = options.strict ?? false;
  if (isLegacySeriesPropsPanel(spec)) {
    const issue = {
      code: strict ? "LEGACY_PANEL_NOT_AGENT_SAFE" : "LEGACY_PANEL",
      path: "props.series",
      message: `Panel type "${spec.type}" with props.series is Tier-2 — renders, but is not agent grammar`,
      suggestion: "Use type cartesian with encoding.x + marks[] over row data",
      family,
    };
    return strict
      ? { ok: false, family, errors: [{ ...issue, severity: "error" as const }] }
      : { ok: true, family, spec, warnings: [{ ...issue, severity: "warning" as const }] };
  }
  const normalized =
    spec.type === "cartesian" || spec.type === "blocks" ? spec : normalizeToCartesian(spec);
  const result = validateCartesianSpec(normalized, { ...options, strict });
  if (!result.ok) {
    return {
      ok: false,
      family,
      errors: result.errors.map((issue) => ({ ...issue, family })),
    };
  }
  const legacy = detectLegacyOverlayProps(spec);
  return {
    ok: true,
    family,
    spec: normalized,
    warnings: [...(legacy ? [legacy] : []), ...result.warnings].map((issue) => ({
      ...issue,
      family,
    })),
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
