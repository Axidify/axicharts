import type { PanelSpec } from "./types";

export const SIZE_SCALE_HELPER = `function resolveSizeMark(
  raw: unknown,
  min: number,
  max: number,
  kind: "bar" | "point" | "bubble",
  range?: [number, number],
): number {
  const output = range ?? (kind === "bar" ? [0.35, 1] : kind === "bubble" ? [6, 28] : [3, 10]);
  const numeric =
    typeof raw === "number" && Number.isFinite(raw)
      ? raw
      : typeof raw === "boolean"
        ? raw
          ? 1
          : 0
        : null;
  if (numeric == null) return (output[0]! + output[1]!) / 2;
  if (max === min) return (output[0]! + output[1]!) / 2;
  const t = (numeric - min) / (max - min);
  return output[0]! + t * (output[1]! - output[0]!);
}`;

export function sizeFieldMinMaxBlock(
  dataVar: string,
  field: string,
  prefix: string,
): string {
  return `const ${prefix}SizeMinMax = (() => {
  const nums = ${dataVar}
    .map((row) => {
      const raw = row.${field};
      if (typeof raw === "number" && Number.isFinite(raw)) return raw;
      if (typeof raw === "boolean") return raw ? 1 : 0;
      return null;
    })
    .filter((value): value is number => value != null);
  const min = nums.length > 0 ? Math.min(...nums) : 0;
  const max = nums.length > 0 ? Math.max(...nums) : 1;
  return { min, max };
})();`;
}

export function ejectSizeProp(
  spec: PanelSpec,
  dataVar: string,
  sizePrefix: string,
): string | undefined {
  const size = spec.encoding?.size;
  if (!size?.field) return undefined;

  const kind =
    spec.type === "bar" ? "bar" : spec.type === "scatter" ? "bubble" : "point";
  const prop = kind === "bar" ? "size" : "radius";
  const range =
    size.range != null ? `, ${JSON.stringify(size.range)}` : "";

  return `${prop}={resolveSizeMark(row.${size.field}, ${sizePrefix}SizeMinMax.min, ${sizePrefix}SizeMinMax.max, "${kind}"${range})}`;
}

export function cartesianHasSizeEncoding(spec: PanelSpec): boolean {
  return (
    (spec.type === "line" || spec.type === "area" || spec.type === "bar") &&
    Boolean(spec.encoding?.size?.field)
  );
}

export function scatterHasSizeEncoding(spec: PanelSpec): boolean {
  return spec.type === "scatter" && Boolean(spec.encoding?.size?.field);
}
