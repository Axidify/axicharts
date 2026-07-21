import type { PanelSpec } from "./types";
import {
  resolvePanelFamily,
  type AgentChartFamily,
  type PanelFamily,
} from "./resolvePanelFamily";
import { resolveRegisteredFamily } from "./familyRegistry";
import { registerBuiltinChartFamilies } from "./registerBuiltinChartFamilies";

export type ValidationSeverity = "error" | "warning";

export type ValidationIssue = {
  code: string;
  path: string;
  message: string;
  suggestion?: string;
  severity: ValidationSeverity;
  /** Mechanical patch agents can apply without re-reasoning (RFC-004). */
  fix?: Record<string, unknown>;
  family?: PanelFamily;
};

export type ValidatePanelOptions = {
  dataProfile?: import("./types").DataProfile;
  rows?: Record<string, unknown>[];
  /**
   * When true (default for MCP `validate_panel`), Tier-2 and unimplemented families
   * return errors instead of passing with warnings.
   */
  strict?: boolean;
};

export type ValidatePanelSuccess = {
  ok: true;
  family: PanelFamily;
  spec: PanelSpec;
  warnings: ValidationIssue[];
};

export type ValidatePanelFailure = {
  ok: false;
  family: PanelFamily;
  errors: ValidationIssue[];
};

export type ValidatePanelResult = ValidatePanelSuccess | ValidatePanelFailure;

function legacyPanelResult(
  spec: PanelSpec,
  strict: boolean,
): ValidatePanelResult {
  const warning: ValidationIssue = {
    code: "LEGACY_PANEL",
    path: "type",
    message: `Panel type "${spec.type}" is Tier-2 — not agent grammar (no validator)`,
    suggestion: "Use create_panel({ family: \"cartesian\" }) for agent-safe charts",
    severity: "warning",
    family: "legacy",
  };

  if (strict) {
    return {
      ok: false,
      family: "legacy",
      errors: [
        {
          ...warning,
          severity: "error",
          code: "LEGACY_PANEL_NOT_AGENT_SAFE",
        },
      ],
    };
  }

  return { ok: true, family: "legacy", spec, warnings: [warning] };
}

function unsupportedFamilyError(
  family: AgentChartFamily,
  spec: PanelSpec,
): ValidatePanelFailure {
  return {
    ok: false,
    family,
    errors: [
      {
        code: "UNSUPPORTED_FAMILY",
        path: "type",
        message: `Family "${family}" is not agent-ready yet (panel type "${spec.type}")`,
        suggestion:
          family === "matrix"
            ? "Use create_panel({ family: \"matrix\" }) with cell + colorScale marks"
            : "Use a supported agent family",
        severity: "error",
        family,
      },
    ],
  };
}

/**
 * Unified validation gate (RFC-004 C180). Dispatches by registered family, then legacy tier.
 */
export function validatePanel(
  spec: PanelSpec,
  options: ValidatePanelOptions = {},
): ValidatePanelResult {
  registerBuiltinChartFamilies();
  const strict = options.strict ?? false;

  const registered = resolveRegisteredFamily(spec);
  if (registered) {
    return registered.validate(spec, { ...options, strict });
  }

  const family = resolvePanelFamily(spec);
  if (family === "cartesian" || family === "distribution" || family === "matrix") {
    return unsupportedFamilyError(family, spec);
  }

  return legacyPanelResult(spec, strict);
}

export class PanelValidationError extends Error {
  readonly family: PanelFamily;
  readonly errors: ValidationIssue[];

  constructor(family: PanelFamily, errors: ValidationIssue[]) {
    super(
      `Panel validation failed (${family}): ${errors.map((e) => e.code).join(", ")}`,
    );
    this.name = "PanelValidationError";
    this.family = family;
    this.errors = errors;
  }
}

/** Validate and throw on failure (cartesian runtime gate). */
export function assertValidPanel(
  spec: PanelSpec,
  options: ValidatePanelOptions = {},
): { spec: PanelSpec; warnings: ValidationIssue[]; family: PanelFamily } {
  const result = validatePanel(spec, options);
  if (!result.ok) {
    throw new PanelValidationError(result.family, result.errors);
  }
  return {
    spec: result.spec,
    warnings: result.warnings,
    family: result.family,
  };
}
