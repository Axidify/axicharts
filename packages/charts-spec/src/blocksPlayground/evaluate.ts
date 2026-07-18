import { ejectPanel } from "../eject";
import { normalizePanelSpec } from "../parseSpec";
import { normalizeToCartesian } from "../normalizeToCartesian";
import {
  detectPreNormalizeWarnings,
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

export function parsePlaygroundData(
  jsonText: string,
): { ok: true; rows: SpecData } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(jsonText) as unknown;
    if (!Array.isArray(parsed)) {
      return { ok: false, error: "Data must be a JSON array of row objects" };
    }
    return { ok: true, rows: parsed as SpecData };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}

/** Prepends sample rows and targets the cartesian entry import for copy-paste. */
export function formatPlaygroundEject(code: string, rows: SpecData): string {
  const rowsConst = `const rows = ${JSON.stringify(rows, null, 2)};\n\n`;
  const withCartesianImport = code.replace(
    /from "@axicharts\/charts"/g,
    'from "@axicharts/charts/cartesian"',
  );
  return rowsConst + withCartesianImport;
}

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

  const preWarnings = CARTESIAN_LIKE.has(spec.type)
    ? detectPreNormalizeWarnings(spec)
    : [];

  const panel = CARTESIAN_LIKE.has(spec.type)
    ? normalizeToCartesian(spec)
    : spec;

  const validation = validateCartesianSpec(panel, { rows });
  if (!validation.ok) {
    return {
      panel,
      errors: validation.errors,
      warnings: preWarnings,
      canRender: false,
    };
  }

  const warnings = [...preWarnings, ...validation.warnings];
  const ejected = formatPlaygroundEject(
    ejectPanel(panel, "rows", { style: "composable" }),
    rows,
  );
  return {
    panel,
    errors: [],
    warnings,
    ejected,
    canRender: true,
  };
}
