import {
  formatValidationErrors,
  validateRuntimeSpecJson,
} from "./runtimeValidation";
import type { RuntimeDashboardSpec } from "./types";

export type {
  RuntimeValidationIssue,
  RuntimeValidationResult,
} from "./runtimeValidation";
export {
  assertRuntimeSpec,
  formatValidationErrors,
  validateRuntimeSpecJson,
  validateRuntimeSpecRaw,
} from "./runtimeValidation";

export function toPortableRuntimeSpec(spec: RuntimeDashboardSpec): RuntimeDashboardSpec {
  return JSON.parse(JSON.stringify(spec)) as RuntimeDashboardSpec;
}

export function serializeRuntimeSpec(spec: RuntimeDashboardSpec, pretty = true): string {
  const portable = toPortableRuntimeSpec(spec);
  return JSON.stringify(portable, null, pretty ? 2 : undefined);
}

export function parseRuntimeSpec(json: string): RuntimeDashboardSpec {
  const result = validateRuntimeSpecJson(json);
  if (!result.ok) {
    throw new Error(formatValidationErrors(result.errors));
  }
  return result.spec;
}
