import { ejectPanel } from "../eject";
import { normalizePanelSpec } from "../parseSpec";
import { normalizeToCartesian } from "../normalizeToCartesian";
import {
  validateCartesianSpec,
  type CartesianValidationError,
  type CartesianValidationIssue,
} from "../cartesianValidation";
import type { PanelSpec, SpecData } from "../types";

const CARTESIAN_LIKE = new Set([
  "line",
  "bar",
  "area",
  "combo",
  "blocks",
  "cartesian",
]);

export type PlaygroundEvaluation = {
  parseError?: string;
  panel?: PanelSpec;
  errors: CartesianValidationError[];
  warnings: CartesianValidationIssue[];
  ejected?: string;
  canRender: boolean;
};

export function evaluatePlaygroundSpec(
  jsonText: string,
  rows: SpecData,
): PlaygroundEvaluation {
  let raw: unknown;
  try {
    raw = JSON.parse(jsonText);
  } catch (error) {
    return {
      parseError: error instanceof Error ? error.message : "Invalid JSON",
      errors: [],
      warnings: [],
      canRender: false,
    };
  }

  let spec: PanelSpec;
  try {
    spec = normalizePanelSpec(raw);
  } catch (error) {
    return {
      parseError: error instanceof Error ? error.message : "Invalid panel spec",
      errors: [],
      warnings: [],
      canRender: false,
    };
  }

  const panel = CARTESIAN_LIKE.has(spec.type)
    ? normalizeToCartesian(spec)
    : spec;

  const validation = validateCartesianSpec(panel, { rows });
  if (!validation.ok) {
    return {
      panel,
      errors: validation.errors,
      warnings: [],
      canRender: false,
    };
  }

  const ejected = ejectPanel(panel, "rows", { style: "composable" });
  return {
    panel,
    errors: [],
    warnings: validation.warnings,
    ejected,
    canRender: true,
  };
}
