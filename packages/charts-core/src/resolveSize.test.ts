import { describe, expect, it } from "vitest";
import { resolveSize } from "./resolveSize";

describe("resolveSize", () => {
  it("uses fixed height when provided", () => {
    expect(
      resolveSize({
        measuredWidth: 400,
        measuredHeight: 100,
        height: 320,
      }),
    ).toEqual({ width: 400, height: 320 });
  });

  it("derives height from aspect ratio", () => {
    expect(
      resolveSize({
        measuredWidth: 320,
        measuredHeight: 0,
        aspectRatio: 16 / 9,
      }),
    ).toEqual({ width: 320, height: 180 });
  });

  it("clamps to min and max height", () => {
    expect(
      resolveSize({
        measuredWidth: 200,
        measuredHeight: 40,
        minHeight: 120,
        maxHeight: 200,
      }),
    ).toEqual({ width: 200, height: 120 });

    expect(
      resolveSize({
        measuredWidth: 200,
        measuredHeight: 500,
        maxHeight: 240,
      }),
    ).toEqual({ width: 200, height: 240 });
  });
});
