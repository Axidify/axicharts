import {
  formatValidationErrors,
  validateRuntimeSpecJson,
} from "./runtimeValidation";
import { RUNTIME_SPEC_SCHEMA_URL, withSchemaHint } from "./schemaUrls";
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

export type SerializeRuntimeSpecOptions = {
  schema?: boolean;
  schemaUrl?: string;
};

export function serializeRuntimeSpec(
  spec: RuntimeDashboardSpec,
  pretty = true,
  options?: SerializeRuntimeSpecOptions,
): string {
  const portable = toPortableRuntimeSpec(spec);
  const payload =
    options?.schema === true
      ? withSchemaHint(portable, options.schemaUrl ?? RUNTIME_SPEC_SCHEMA_URL)
      : portable;
  return JSON.stringify(payload, null, pretty ? 2 : undefined);
}

export function parseRuntimeSpec(json: string): RuntimeDashboardSpec {
  const result = validateRuntimeSpecJson(json);
  if (!result.ok) {
    throw new Error(formatValidationErrors(result.errors));
  }
  return result.spec;
}
