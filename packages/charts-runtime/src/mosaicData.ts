function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function pluckMosaicData(
  root: Record<string, unknown>,
  path?: string,
): Record<string, unknown> {
  if (!path) return root;

  let current: unknown = root;
  for (const segment of path.split(".")) {
    if (!isRecord(current)) return {};
    current = current[segment];
  }

  if (isRecord(current)) return current;
  if (current === undefined) return {};
  return { value: current };
}

export function mergeMosaicData(
  ...layers: Array<Record<string, unknown>>
): Record<string, unknown> {
  return layers.reduce<Record<string, unknown>>(
    (accumulator, layer) => ({ ...accumulator, ...layer }),
    {},
  );
}
