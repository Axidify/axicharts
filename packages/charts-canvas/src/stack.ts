export const STACK_GROUP = "axicharts-stack";

export function shouldStackSeries(
  stacked: boolean | undefined,
  seriesCount: number,
): boolean {
  return Boolean(stacked) && seriesCount > 1;
}
