import type { ChartTheme } from "./themes";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/** Extend a base theme with partial overrides — brand forks without copy-paste. */
export function createTheme(
  base: ChartTheme,
  overrides: DeepPartial<ChartTheme> & { name: string },
): ChartTheme {
  return {
    ...base,
    ...overrides,
    grid: { ...base.grid, ...overrides.grid },
    axis: { ...base.axis, ...overrides.axis },
    line: { ...base.line, ...overrides.line },
    area: { ...base.area, ...overrides.area },
    bar: { ...base.bar, ...overrides.bar },
    caption: { ...base.caption, ...overrides.caption },
    values: { ...base.values, ...overrides.values },
  };
}
