import { describe, expect, it } from "vitest";
import { resolveHistogramBinAxisStyle } from "./histogramBins";

describe("histogramBins", () => {
  it("rotates compact labels when there are six or more bins", () => {
    expect(resolveHistogramBinAxisStyle(5, true)).toEqual({
      denseBins: false,
      rotate: 0,
      bottomGutter: 0,
    });
    expect(resolveHistogramBinAxisStyle(6, true)).toEqual({
      denseBins: true,
      rotate: -25,
      bottomGutter: 40,
    });
  });

  it("keeps full-size histogram labels horizontal", () => {
    expect(resolveHistogramBinAxisStyle(8, false)).toEqual({
      denseBins: true,
      rotate: 0,
      bottomGutter: 0,
    });
  });
});
