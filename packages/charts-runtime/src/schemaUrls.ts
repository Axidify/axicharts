export const RUNTIME_SPEC_SCHEMA_URL =
  "https://axidify.github.io/axicharts/schema/runtime-spec.schema.json";

export const SHARE_EXPORT_SCHEMA_URL =
  "https://axidify.github.io/axicharts/schema/share-export.schema.json";

export type WithSchemaHint<T extends Record<string, unknown>> = T & {
  $schema: string;
};

export function withSchemaHint<T extends Record<string, unknown>>(
  value: T,
  schemaUrl: string,
): WithSchemaHint<T> {
  return { $schema: schemaUrl, ...value };
}
