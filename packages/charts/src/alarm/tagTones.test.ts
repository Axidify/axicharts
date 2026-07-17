import { describe, expect, it } from "vitest";
import type { PlotSeries } from "@axicharts/charts-canvas";
import {
  alarmSeverityToSeriesTone,
  applyTagTonesToSeries,
  mergeSeriesTone,
  readTagTones,
  resolveTagStatTone,
} from "./tagTones";

describe("readTagTones", () => {
  it("reads explicit tones map", () => {
    expect(
      readTagTones({
        tones: { cpu: "warning", memory: "critical" },
      }),
    ).toEqual({
      cpu: "warning",
      memory: "critical",
    });
  });

  it("derives tones from active alarms with tag", () => {
    expect(
      readTagTones({
        alarms: [
          { id: "a1", message: "CPU high", severity: "warning", tag: "cpu" },
          {
            id: "a2",
            message: "CPU critical",
            severity: "critical",
            tag: "cpu",
          },
        ],
      }),
    ).toEqual({ cpu: "critical" });
  });

  it("ignores acknowledged alarms", () => {
    expect(
      readTagTones({
        alarms: [
          {
            id: "a1",
            message: "CPU high",
            severity: "critical",
            tag: "cpu",
            acknowledged: true,
          },
        ],
      }),
    ).toEqual({});
  });
});

describe("applyTagTonesToSeries", () => {
  it("fills missing series tone from tag map without overriding explicit tone", () => {
    const series: PlotSeries[] = [
      { name: "cpu", data: [1, 2] },
      { name: "memory", data: [3, 4], tone: "success" },
    ];

    expect(
      applyTagTonesToSeries(series, { cpu: "warning", memory: "critical" }),
    ).toEqual([
      { name: "cpu", data: [1, 2], tone: "warning" },
      { name: "memory", data: [3, 4], tone: "success" },
    ]);
  });
});

describe("tone helpers", () => {
  it("merges by severity rank", () => {
    expect(mergeSeriesTone("warning", "critical")).toBe("critical");
    expect(mergeSeriesTone("critical", "warning")).toBe("critical");
  });

  it("maps alarm severity to chart tones", () => {
    expect(alarmSeverityToSeriesTone("alarm")).toBe("critical");
    expect(resolveTagStatTone({ cpu: "warning" }, "cpu")).toBe("warning");
  });
});
