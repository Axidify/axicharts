export type HistogramBinAxisStyle = {
  denseBins: boolean;
  rotate: number;
  bottomGutter: number;
};

export function resolveHistogramBinAxisStyle(
  binCount: number,
  compact: boolean,
): HistogramBinAxisStyle {
  const denseBins = binCount >= 6;

  return {
    denseBins,
    rotate: compact && denseBins ? -25 : 0,
    bottomGutter: compact && denseBins ? 40 : 0,
  };
}
