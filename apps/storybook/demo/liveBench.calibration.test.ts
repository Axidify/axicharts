import { describe, expect, it } from "vitest";
import {
  calibrationStatusLabel,
  createInitialCalibrationStatuses,
  finishCalibrationRun,
  getCalibrationLibraries,
  getCalibrationProgressPercent,
  markLibraryError,
  markLibraryReady,
  startCalibrationRun,
  type CalibrationProgress,
} from "./liveBench";

describe("calibration state machine", () => {
  const threeWayLibraries = getCalibrationLibraries(true);
  const twoWayLibraries = getCalibrationLibraries(false);

  it("creates pending statuses for active libraries", () => {
    expect(createInitialCalibrationStatuses(true)).toEqual({
      axicharts: "pending",
      recharts: "pending",
      echarts: "pending",
    });
    expect(createInitialCalibrationStatuses(false)).toEqual({
      axicharts: "pending",
      recharts: "pending",
      echarts: "ready",
    });
  });

  it("starts a run with the first library calibrating", () => {
    const initial = createInitialCalibrationStatuses(true);
    expect(startCalibrationRun(initial, threeWayLibraries)).toEqual({
      axicharts: "calibrating",
      recharts: "pending",
      echarts: "pending",
    });
  });

  it("advances ready libraries and queues the next calibrator", () => {
    let statuses = startCalibrationRun(createInitialCalibrationStatuses(true), threeWayLibraries);

    statuses = markLibraryReady(statuses, "axicharts", threeWayLibraries);
    expect(statuses).toEqual({
      axicharts: "ready",
      recharts: "calibrating",
      echarts: "pending",
    });

    statuses = markLibraryReady(statuses, "recharts", threeWayLibraries);
    expect(statuses).toEqual({
      axicharts: "ready",
      recharts: "ready",
      echarts: "calibrating",
    });

    statuses = markLibraryReady(statuses, "echarts", threeWayLibraries);
    expect(statuses).toEqual({
      axicharts: "ready",
      recharts: "ready",
      echarts: "ready",
    });
  });

  it("marks a library as failed without advancing the queue", () => {
    const running = startCalibrationRun(createInitialCalibrationStatuses(true), threeWayLibraries);
    expect(markLibraryError(running, "axicharts")).toEqual({
      axicharts: "error",
      recharts: "pending",
      echarts: "pending",
    });
  });

  it("finishes a run by promoting pending/calibrating libraries to ready", () => {
    const running = {
      axicharts: "ready" as const,
      recharts: "calibrating" as const,
      echarts: "pending" as const,
    };
    expect(finishCalibrationRun(running, threeWayLibraries)).toEqual({
      axicharts: "ready",
      recharts: "ready",
      echarts: "ready",
    });
  });

  it("computes calibration progress percent", () => {
    const progress: CalibrationProgress = { library: "axicharts", step: 15, total: 30 };
    expect(getCalibrationProgressPercent(progress)).toBe(50);
    expect(getCalibrationProgressPercent(null)).toBe(0);
    expect(getCalibrationProgressPercent({ library: "axicharts", step: 0, total: 0 })).toBe(0);
  });

  it("labels calibration statuses for UI copy", () => {
    expect(calibrationStatusLabel("pending")).toBe("Pending");
    expect(calibrationStatusLabel("calibrating")).toBe("Calibrating");
    expect(calibrationStatusLabel("ready")).toBe("Ready");
    expect(calibrationStatusLabel("error")).toBe("Failed");
  });

  it("omits echarts from two-way library order", () => {
    expect(twoWayLibraries).toEqual(["axicharts", "recharts"]);
  });
});
