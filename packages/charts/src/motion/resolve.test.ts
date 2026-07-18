import { describe, expect, it, vi, afterEach } from "vitest";
import {
  resolveChartAnimate,
  shouldAnimateEnter,
  shouldAnimateUpdate,
  __resetLiveAnimateWarnForTests,
} from "./resolve";

describe("resolveChartAnimate", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    __resetLiveAnimateWarnForTests();
  });

  it("returns null config when animate is undefined", () => {
    expect(resolveChartAnimate("interactive")).toEqual({
      enter: null,
      update: null,
    });
  });

  it("resolves enter preset", () => {
    const resolved = resolveChartAnimate("static", "enter");
    expect(resolved.enter).toMatchObject({ duration: 520 });
    expect(resolved.update).toBeNull();
  });

  it("resolves update preset", () => {
    const resolved = resolveChartAnimate("interactive", "update");
    expect(resolved.enter).toBeNull();
    expect(resolved.update).toMatchObject({ duration: 220 });
  });

  it("forces none in live mode", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveChartAnimate("live", "enter")).toEqual({
      enter: null,
      update: null,
    });
    expect(warn).toHaveBeenCalledOnce();
  });

  it("does not warn twice in live mode", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    resolveChartAnimate("live", "enter");
    resolveChartAnimate("live", "update");
    expect(warn).toHaveBeenCalledOnce();
  });

  it("parses object config", () => {
    const resolved = resolveChartAnimate("static", {
      enter: { duration: 400, delay: 50 },
      update: { duration: 180 },
    });
    expect(resolved.enter).toMatchObject({ duration: 400, delay: 50 });
    expect(resolved.update).toMatchObject({ duration: 180 });
  });
});

describe("shouldAnimateEnter", () => {
  it("is false when enter is disabled", () => {
    expect(shouldAnimateEnter({ enter: null, update: null })).toBe(false);
  });

  it("is true when enter is configured", () => {
    expect(
      shouldAnimateEnter({
        enter: { duration: 400 },
        update: null,
      }),
    ).toBe(true);
  });
});

describe("shouldAnimateUpdate", () => {
  it("is false in live and presentation modes", () => {
    const config = { enter: null, update: { duration: 200 } };
    expect(shouldAnimateUpdate(config, "live")).toBe(false);
    expect(shouldAnimateUpdate(config, "presentation")).toBe(false);
  });

  it("is true in static mode when update is configured", () => {
    expect(
      shouldAnimateUpdate(
        { enter: null, update: { duration: 200 } },
        "static",
      ),
    ).toBe(true);
  });
});
