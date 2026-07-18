import type { FieldEncoding } from "./types";

export function resolveLiquidFillValue(
  rows: Record<string, unknown>[],
  props: Record<string, unknown>,
  encoding?: { value?: FieldEncoding },
): number {
  if (props.value != null) {
    return Number(props.value);
  }

  const valueField = encoding?.value?.field ?? "value";
  return Number(rows[0]?.[valueField] ?? 0);
}
