import type { DataProfile, PanelSpec } from "./types";
import type { DistributionMarkSpec } from "./types";
import {
  isDistributionDataMark,
  normalizeDistributionMark,
  normalizeDistributionMarks,
} from "./distributionMarks";
import { suggestField } from "./fieldSuggest";

export type DistributionValidationIssue = {
  code: string;
  path: string;
  message: string;
  suggestion?: string;
  severity: "error" | "warning";
  fix?: Record<string, unknown>;
};

export type ValidateDistributionOptions = {
  dataProfile?: DataProfile;
  rows?: Record<string, unknown>[];
};

function fieldKeys(
  options: ValidateDistributionOptions,
  rows: Record<string, unknown>[],
): string[] {
  const fromProfile = options.dataProfile?.fields ?? [];
  const fromRows = rows.length > 0 ? Object.keys(rows[0] ?? {}) : [];
  return [...new Set([...fromProfile, ...fromRows])];
}

function rowValueNumeric(rows: Record<string, unknown>[], field: string): boolean {
  if (rows.length === 0) return true;
  return rows.every((row) => {
    const value = row[field];
    if (value == null || value === "") return true;
    return (
      typeof value === "number" ||
      (typeof value === "string" && value !== "" && !Number.isNaN(Number(value)))
    );
  });
}

function unknownFieldIssue(
  path: string,
  field: string,
  keys: string[],
): DistributionValidationIssue {
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

export function validateDistributionSpec(
  spec: PanelSpec,
  options: ValidateDistributionOptions = {},
): {
  ok: true;
  warnings: DistributionValidationIssue[];
} | {
  ok: false;
  errors: DistributionValidationIssue[];
} {
  const errors: DistributionValidationIssue[] = [];
  const warnings: DistributionValidationIssue[] = [];

  if (spec.type !== "distribution") {
    errors.push({
      code: "NOT_DISTRIBUTION_PANEL",
      path: "type",
      message: `Expected type "distribution", got "${spec.type}"`,
      severity: "error",
    });
    return { ok: false, errors };
  }

  const angleField = spec.encoding?.angle?.field ?? spec.encoding?.value?.field;
  const colorField = spec.encoding?.color?.field ?? spec.encoding?.name?.field;

  if (!angleField || typeof angleField !== "string") {
    errors.push({
      code: "MISSING_ANGLE_FIELD",
      path: "encoding.angle.field",
      message: "encoding.angle.field (or encoding.value.field) is required",
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

  const normalizedMarks: DistributionMarkSpec[] = [];
  for (let i = 0; i < rawMarks.length; i++) {
    const raw = rawMarks[i];
    const kind = rawMarkKind(raw);
    const mark = normalizeDistributionMark(raw);
    if (!mark) {
      errors.push({
        code: kind ? "UNKNOWN_MARK" : "INVALID_MARK",
        path: `marks[${i}]`,
        message: kind ? `Unknown mark "${kind}"` : "Mark could not be normalized",
        suggestion: "arc, funnel, donut, cell, label",
        severity: "error",
      });
      continue;
    }
    normalizedMarks.push(mark);
  }

  const dataMarks = normalizedMarks.filter(isDistributionDataMark);
  if (dataMarks.length === 0 && normalizedMarks.length > 0) {
    errors.push({
      code: "MISSING_DATA_MARK",
      path: "marks",
      message: 'At least one data mark ("arc" or "funnel") is required',
      severity: "error",
    });
  }

  if (dataMarks.length > 1) {
    errors.push({
      code: "MULTIPLE_DATA_MARKS",
      path: "marks",
      message: "Only one data mark (arc or funnel) is allowed per panel",
      severity: "error",
    });
  }

  if (angleField && keys.length > 0 && !keys.includes(angleField)) {
    errors.push(unknownFieldIssue("encoding.angle.field", angleField, keys));
  }

  if (colorField && keys.length > 0 && !keys.includes(colorField)) {
    errors.push(unknownFieldIssue("encoding.color.field", colorField, keys));
  }

  for (let i = 0; i < normalizedMarks.length; i++) {
    const mark = normalizedMarks[i]!;
    if (mark.type === "arc" || mark.type === "funnel") {
      if (!mark.field) {
        errors.push({
          code: "MISSING_FIELD",
          path: `marks[${i}].field`,
          message: `${mark.type} marks require field`,
          severity: "error",
        });
        continue;
      }
      if (keys.length > 0 && !keys.includes(mark.field)) {
        errors.push(unknownFieldIssue(`marks[${i}].field`, mark.field, keys));
      } else if (rows.length > 0 && !rowValueNumeric(rows, mark.field)) {
        errors.push({
          code: "INVALID_FIELD_TYPE",
          path: `marks[${i}].field`,
          message: `Field "${mark.field}" must be numeric for ${mark.type} marks`,
          severity: "error",
        });
      }
    }
    if (mark.type === "cell") {
      if (keys.length > 0 && colorField && !keys.includes(colorField)) {
        warnings.push({
          code: "CELL_WITHOUT_COLOR_ENCODING",
          path: `marks[${i}]`,
          message: "cell marks work best with encoding.color.field",
          severity: "warning",
        });
      }
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, warnings };
}
