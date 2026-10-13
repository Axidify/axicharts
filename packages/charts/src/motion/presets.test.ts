import { describe, expect, it } from "vitest";
import {
  applyCountUpPreset,
  isMotionPresetName,
  resolveCartesianMotionPreset,
  resolveMotionPreset,
  resolveSeriesEnterDelay,
} from "./presets";

describe("motion presets", () => {
  it("resolveMotionPreset returns expected durations", () => {
    expect(resolveMotionPreset("stagger")).toMatchObject({
      enter: { duration: 520, staggerMs: 80 },
    });
    expect(resolveMotionPreset("spring")).toMatchObject({
      enter: { duration: 680, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
    });
    expect(resolveMotionPreset("gentle")).toMatchObject({
      enter: { duration: 780, delay: 40 },
    });
    expect(resolveMotionPreset("morph")).toMatchObject({
      enter: { duration: 520 },
      update: { duration: 320 },
    });
    expect(resolveMotionPreset("countUp")).toMatchObject({ duration: 900 });
  });

  it("resolveCartesianMotionPreset excludes countUp", () => {
    expect(resolveCartesianMotionPreset("spring")).toMatchObject({
      enter: { duration: 680 },
    });
  });

  it("isMotionPresetName narrows preset strings", () => {
    expect(isMotionPresetName("stagger")).toBe(true);
    expect(isMotionPresetName("enter")).toBe(false);
  });

  it("resolveSeriesEnterDelay increases with seriesIndex", () => {
    const enter = resolveCartesianMotionPreset("stagger").enter;
    if (!enter) throw new Error("stagger preset must define enter");
    expect(resolveSeriesEnterDelay(enter, 0)).toBe(0);
    expect(resolveSeriesEnterDelay(enter, 1)).toBe(80);
    expect(resolveSeriesEnterDelay(enter, 2)).toBe(160);
  });

  it("applyCountUpPreset overrides duration", () => {
    expect(applyCountUpPreset().duration).toBe(900);
    expect(applyCountUpPreset(1200).duration).toBe(1200);
  });
});
