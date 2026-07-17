import { describe, expect, it } from "vitest";
import { resolveRenderer } from "./resolveRenderer";

describe("resolveRenderer", () => {
  it("does not sample small interactive series", () => {
    expect(
      resolveRenderer({
        pointCount: 120,
        mode: "interactive",
        plotWidth: 400,
      }),
    ).toEqual({ engine: "svg", maxPoints: null });
  });

  it("samples large series in auto mode", () => {
    const resolved = resolveRenderer({
      pointCount: 10_000,
      mode: "interactive",
      plotWidth: 500,
    });
    expect(resolved.engine).toBe("canvas");
    expect(resolved.maxPoints).toBe(1000);
  });

  it("forces canvas and sampling for live mode", () => {
    const resolved = resolveRenderer({
      pointCount: 5_000,
      mode: "live",
      plotWidth: 300,
    });
    expect(resolved.engine).toBe("canvas");
    expect(resolved.maxPoints).toBe(600);
  });

  it("honors explicit svg renderer", () => {
    expect(
      resolveRenderer({
        renderer: "svg",
        pointCount: 50_000,
        mode: "live",
      }),
    ).toEqual({ engine: "svg", maxPoints: null });
  });

  it("honors explicit canvas renderer", () => {
    const resolved = resolveRenderer({
      renderer: "canvas",
      pointCount: 3_000,
      plotWidth: 200,
    });
    expect(resolved.engine).toBe("canvas");
    expect(resolved.maxPoints).toBe(500);
  });
});
