import type { DataProfile, PanelSpec } from "./types";
import type { ChartBlockMarkSpec } from "./types";
import { asRows } from "./data";
import { normalizeBlockMark, isDataMark, isOverlayMark } from "./cartesianMarks";
import { suggestField } from "./fieldSuggest";
import { readPanelAnnotations } from "./panelAnnotations";

export type ValidationSeverity = "error" | "warning";

export type CartesianValidationIssue = {
  code: string;
  path: string;
  message: string;
  suggestion?: string;
  severity: ValidationSeverity;
};

export type CartesianValidationError = CartesianValidationIssue & {
  severity: "error";
};

export type ValidateCartesianOptions = {
  dataProfile?: DataProfile;
  rows?: Record<string, unknown>[];
};

const DATA_MARKS = new Set(["bar", "line", "area"]);
const OVERLAY_MARKS = new Set(["rule", "band"]);
const ALL_MARKS = new Set([...DATA_MARKS, ...OVERLAY_MARKS]);

function fieldKeys(
  options: ValidateCartesianOptions,
  rows: Record<string, unknown>[],
): string[] {
  const fromProfile = options.dataProfile?.fields ?? [];
  const fromRows =
    rows.length > 0 ? Object.keys(rows[0] ?? {}) : [];
  return [...new Set([...fromProfile, ...fromRows])];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function rowValueNumeric(rows: Record<string, unknown>[], field: string): boolean {
  if (rows.length === 0) return true;
  return rows.every((row) => {
    const value = row[field];
    if (value == null || value === "") return true;
    return typeof value === "number" || (typeof value === "string" && value !== "" && !Number.isNaN(Number(value)));
  });
}

function rawMarkKind(raw: unknown): string | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const record = raw as Record<string, unknown>;
  const kind = record.mark ?? record.type;
  return typeof kind === "string" ? kind : undefined;
}

export function validateCartesianSpec(
  spec: PanelSpec,
  options: ValidateCartesianOptions = {},
): {
  ok: true;
  warnings: CartesianValidationIssue[];
} | {
  ok: false;
  errors: CartesianValidationError[];
} {
  const errors: CartesianValidationError[] = [];
  const warnings: CartesianValidationIssue[] = [];

  if (spec.type !== "cartesian" && spec.type !== "blocks") {
    errors.push({
      code: "NOT_CARTESIAN_PANEL",
      path: "type",
      message: `Expected type "cartesian", got "${spec.type}"`,
      severity: "error",
    });
    return { ok: false, errors };
  }

  const xField = spec.encoding?.x?.field;
  if (!xField || typeof xField !== "string") {
    errors.push({
      code: "MISSING_X_FIELD",
      path: "encoding.x.field",
      message: "encoding.x.field is required for cartesian panels",
      severity: "error",
    });
  }

  const rows = options.rows ?? [];
  const keys = fieldKeys(options, rows);

  if (rows.length === 0) {
    errors.push({
      code: "EMPTY_DATA",
      path: "data",
      message: "At least one data row is required",
      severity: "error",
    });
  }

  const rawMarks = spec.marks ?? [];
  if (rawMarks.length === 0) {
    errors.push({
      code: "MISSING_DATA_MARK",
      path: "marks",
      message: "At least one mark is required",
      severity: "error",
    });
  }

  const normalizedMarks: ChartBlockMarkSpec[] = [];
  for (let i = 0; i < rawMarks.length; i++) {
    const raw = rawMarks[i];
    const kind = rawMarkKind(raw);
    if (!kind || !ALL_MARKS.has(kind)) {
      errors.push({
        code: "UNKNOWN_MARK",
        path: `marks[${i}]`,
        message: kind
          ? `Unknown mark "${kind}"`
          : "Mark must include mark or type",
        suggestion: [...ALL_MARKS].join(", "),
        severity: "error",
      });
      continue;
    }

    const mark = normalizeBlockMark(raw);
    if (!mark) {
      errors.push({
        code: "INVALID_MARK",
        path: `marks[${i}]`,
        message: "Mark could not be normalized",
        severity: "error",
      });
      continue;
    }
    normalizedMarks.push(mark);
  }

  const dataMarks = normalizedMarks.filter(isDataMark);
  if (dataMarks.length === 0 && normalizedMarks.length > 0) {
    errors.push({
      code: "MISSING_DATA_MARK",
      path: "marks",
      message: "At least one data mark (bar, line, area) is required",
      severity: "error",
    });
  }

  if (xField && keys.length > 0 && !keys.includes(xField)) {
    errors.push({
      code: "UNKNOWN_FIELD",
      path: "encoding.x.field",
      message: `Field "${xField}" not found in data`,
      suggestion: suggestField(xField, keys),
      severity: "error",
    });
  }

  for (let i = 0; i < normalizedMarks.length; i++) {
    const mark = normalizedMarks[i]!;
    if (isDataMark(mark)) {
      if (!mark.field) {
        errors.push({
          code: "MISSING_FIELD",
          path: `marks[${i}].field`,
          message: "Data marks require field",
          severity: "error",
        });
        continue;
      }
      if (keys.length > 0 && !keys.includes(mark.field)) {
        errors.push({
          code: "UNKNOWN_FIELD",
          path: `marks[${i}].field`,
          message: `Field "${mark.field}" not found in data`,
          suggestion: suggestField(mark.field, keys),
          severity: "error",
        });
      } else if (rows.length > 0 && !rowValueNumeric(rows, mark.field)) {
        errors.push({
          code: "INVALID_FIELD_TYPE",
          path: `marks[${i}].field`,
          message: `Field "${mark.field}" must be numeric for data marks`,
          severity: "error",
        });
      }
    }

    if (mark.type === "rule") {
      if (!isFiniteNumber(mark.value)) {
        errors.push({
          code: "INVALID_RULE_VALUE",
          path: `marks[${i}].value`,
          message: "rule.value must be a finite number",
          severity: "error",
        });
      }
    }

    if (mark.type === "band") {
      if (!isFiniteNumber(mark.min) || !isFiniteNumber(mark.max)) {
        errors.push({
          code: "INVALID_BAND_RANGE",
          path: `marks[${i}]`,
          message: "band.min and band.max must be finite numbers",
          severity: "error",
        });
      } else if (mark.min >= mark.max) {
        errors.push({
          code: "INVALID_BAND_RANGE",
          path: `marks[${i}]`,
          message: "band.min must be less than band.max",
          severity: "error",
        });
      }
    }
  }

  const props = spec.props ?? {};
  const legacyRules = Array.isArray(props.referenceLines) ? props.referenceLines.length : 0;
  const legacyBands = Array.isArray(props.thresholdBands) ? props.thresholdBands.length : 0;
  const annotationOverlays = (readPanelAnnotations(spec) ?? []).filter(
    (annotation) => annotation.type === "line" || annotation.type === "band",
  ).length;
  const markRules = normalizedMarks.filter((m) => m.type === "rule").length;
  const markBands = normalizedMarks.filter((m) => m.type === "band").length;
  if (
    (legacyRules > 0 && markRules > 0) ||
    (legacyBands > 0 && markBands > 0) ||
    (annotationOverlays > 0 && (markRules > 0 || markBands > 0))
  ) {
    warnings.push({
      code: "DUPLICATE_OVERLAY_CHANNEL",
      path: "props",
      message:
        "Overlay marks in marks[] and legacy referenceLines/thresholdBands props both set — prefer marks[] only",
      severity: "warning",
    });
  }

  const fieldUse = new Map<string, string[]>();
  for (const mark of dataMarks) {
    const list = fieldUse.get(mark.field) ?? [];
    list.push(mark.type);
    fieldUse.set(mark.field, list);
  }
  for (const [field, kinds] of fieldUse) {
    if (kinds.length > 1) {
      warnings.push({
        code: "REDUNDANT_MARK",
        path: "marks",
        message: `Field "${field}" used on multiple marks (${kinds.join(", ")})`,
        severity: "warning",
      });
    }
  }

  if (normalizedMarks.filter((m) => m.type === "band").length > 3) {
    warnings.push({
      code: "MANY_BANDS",
      path: "marks",
      message: "More than three band marks may clutter the chart",
      severity: "warning",
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, warnings };
}

export class CartesianSpecValidationError extends Error {
  readonly errors: CartesianValidationError[];

  constructor(errors: CartesianValidationError[]) {
    super(
      `Cartesian spec validation failed: ${errors.map((e) => e.code).join(", ")}`,
    );
    this.name = "CartesianSpecValidationError";
    this.errors = errors;
  }
}

/** Validate panel + data rows (convenience). */
export function assertValidCartesianSpec(
  spec: PanelSpec,
  data: Parameters<typeof asRows>[0],
  options: Omit<ValidateCartesianOptions, "rows"> = {},
): CartesianValidationIssue[] {
  const result = validateCartesianSpec(spec, {
    ...options,
    rows: asRows(data),
  });
  if (!result.ok) {
    throw new CartesianSpecValidationError(result.errors);
  }
  return result.warnings;
}
