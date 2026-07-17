import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAlarmState } from "./useAlarmState";

const initial = [
  { id: "cpu", message: "CPU high", severity: "warning" as const },
  { id: "mem", message: "Memory critical", severity: "critical" as const },
];

describe("useAlarmState", () => {
  it("acks and shelves alarms", () => {
    const { result } = renderHook(() => useAlarmState(initial));

    act(() => result.current.ack("cpu"));
    expect(result.current.alarms.find((item) => item.id === "cpu")?.acknowledged).toBe(
      true,
    );

    act(() => result.current.shelve("mem"));
    expect(result.current.alarms.some((item) => item.id === "mem")).toBe(false);
  });
});
