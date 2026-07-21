import type { DataProfile, PanelSpec } from "./types";
import type { MatrixMarkSpec } from "./types";
import { isMatrixDataMark, normalizeMatrixMark, normalizeMatrixMarks } from "./matrixMarks";
import { suggestField } from "./fieldSuggest";

export type MatrixValidationIssue = {
  code: string;
  path: string;
  message: string;
  suggestion?: string;
  severity: "error" | "warning";
  fix?: Record<string, unknown>;
};

export type ValidateMatrixOptions = {
  dataProfile?: DataProfile;
  rows?: Record<string, unknown>[];
};

function fieldKeys(
  options: ValidateMatrixOptions,
  rows: Record<string, unknown>[],
): string[] {
  const fromProfile = options.dataProfile?.fields ?? [];
  const fromRows = rows.length > 0 ? Object.keys(rows[0] ?? {}) : [];
  return [...new Set([...fromProfile, ...fromRows])];
}

function unknownFieldIssue(
  path: string,
  field: string,
  keys: string[],
): MatrixValidationIssue {
  const suggestion = keys.length > 0 ? suggestField(field, keys) : undefined;
  return {
    code: "UNKNOWN_FIELD",
    path,
    message: `Field "${field}" not found in data`,
    suggestion,
    fix: suggestion ? { [path]: suggestion } : undefined,
    severity: "error",
  };
}

function rawMarkKind(raw: unknown): string | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const record = raw as Record<string, unknown>;
  const kind = record.mark ?? record.type;
  return typeof kind === "string" ? kind : undefined;
}

export function validateMatrixSpec(
  spec: PanelSpec,
  options: ValidateMatrixOptions = {},
): {
  ok: true;
  warnings: MatrixValidationIssue[];
} | {
  ok: false;
  errors: MatrixValidationIssue[];
} {
  const errors: MatrixValidationIssue[] = [];
  const warnings: MatrixValidationIssue[] = [];

  if (spec.type !== "matrix") {
    errors.push({
      code: "NOT_MATRIX_PANEL",
      path: "type",
      message: `Expected type "matrix", got "${spec.type}"`,
      severity: "error",
    });
    return { ok: false, errors };
  }

  const xField = spec.encoding?.x?.field;
  const yEncoding = Array.isArray(spec.encoding?.y)
    ? spec.encoding.y[0]
    : spec.encoding?.y;
  const yField = yEncoding?.field;

  if (!xField || typeof xField !== "string") {
    errors.push({
      code: "MISSING_X_FIELD",
      path: "encoding.x.field",
      message: "encoding.x.field is required",
      severity: "error",
    });
  }

  if (!yField || typeof yField !== "string") {
    errors.push({
      code: "MISSING_Y_FIELD",
      path: "encoding.y.field",
      message: "encoding.y.field is required",
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

  const normalizedMarks: MatrixMarkSpec[] = [];
  for (let i = 0; i < rawMarks.length; i++) {
    const raw = rawMarks[i];
    const kind = rawMarkKind(raw);
    const mark = normalizeMatrixMark(raw);
    if (!mark) {
      errors.push({
        code: kind ? "UNKNOWN_MARK" : "INVALID_MARK",
        path: `marks[${i}]`,
        message: kind ? `Unknown mark "${kind}"` : "Mark could not be normalized",
        suggestion: "cell, colorScale, axis",
        severity: "error",
      });
      continue;
    }
    normalizedMarks.push(mark);
  }

  const dataMarks = normalizedMarks.filter(isMatrixDataMark);
  if (dataMarks.length === 0 && normalizedMarks.length > 0) {
    errors.push({
      code: "MISSING_DATA_MARK",
      path: "marks",
      message: 'At least one data mark ("cell") is required',
      severity: "error",
    });
  }

  if (dataMarks.length > 1) {
    errors.push({
      code: "MULTIPLE_DATA_MARKS",
      path: "marks",
      message: "Only one cell mark is allowed per panel",
      severity: "error",
    });
  }

  if (xField && keys.length > 0 && !keys.includes(xField)) {
    errors.push(unknownFieldIssue("encoding.x.field", xField, keys));
  }

  if (yField && keys.length > 0 && !keys.includes(yField)) {
    errors.push(unknownFieldIssue("encoding.y.field", yField, keys));
  }

  for (let i = 0; i < normalizedMarks.length; i++) {
    const mark = normalizedMarks[i]!;
    if (mark.type === "cell") {
      if (!mark.field) {
        errors.push({
          code: "MISSING_FIELD",
          path: `marks[${i}].field`,
          message: "cell marks require field",
          severity: "error",
        });
        continue;
      }
      if (keys.length > 0 && !keys.includes(mark.field)) {
        errors.push(unknownFieldIssue(`marks[${i}].field`, mark.field, keys));
      }
    }
  }

  if (!normalizedMarks.some((mark) => mark.type === "colorScale")) {
    warnings.push({
      code: "MISSING_COLOR_SCALE",
      path: "marks",
      message: "colorScale mark omitted — theme default will be used",
      severity: "warning",
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, warnings };
}
