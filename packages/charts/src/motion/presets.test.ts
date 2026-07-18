import { describe, expect, it } from "vitest";
import {
  applyCountUpPreset,
  isMotionPresetName,
  MOTION_PRESETS,
  resolveCartesianMotionPreset,
  resolveMotionPreset,
  resolveSeriesEnterDelay,
} from "./presets";

describe("motion presets", () => {
  it("resolveMotionPreset returns expected durations", () => {
    expect(resolveMotionPreset("stagger").enter).toMatchObject({
      duration: 520,
      staggerMs: 80,
    });
    expect(resolveMotionPreset("spring").enter).toMatchObject({
      duration: 680,
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    });
    expect(resolveMotionPreset("gentle").enter).toMatchObject({
      duration: 780,
      delay: 40,
    });
    expect(resolveMotionPreset("morph").enter).toMatchObject({ duration: 520 });
    expect(resolveMotionPreset("morph").update).toMatchObject({ duration: 320 });
    expect(resolveMotionPreset("countUp")).toMatchObject({ duration: 900 });
  });

  it("resolveCartesianMotionPreset excludes countUp", () => {
    expect(resolveCartesianMotionPreset("spring").enter?.duration).toBe(680);
  });

  it("isMotionPresetName narrows preset strings", () => {
    expect(isMotionPresetName("stagger")).toBe(true);
    expect(isMotionPresetName("enter")).toBe(false);
  });

  it("resolveSeriesEnterDelay increases with seriesIndex", () => {
    const enter = MOTION_PRESETS.stagger.enter!;
    expect(resolveSeriesEnterDelay(enter, 0)).toBe(0);
    expect(resolveSeriesEnterDelay(enter, 1)).toBe(80);
    expect(resolveSeriesEnterDelay(enter, 2)).toBe(160);
  });

  it("applyCountUpPreset overrides duration", () => {
    expect(applyCountUpPreset().duration).toBe(900);
    expect(applyCountUpPreset(1200).duration).toBe(1200);
  });
});
