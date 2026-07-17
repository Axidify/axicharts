import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { DEFAULT_ALARM_STATE_KEY } from "./alarmStateStore";
import { useAlarmState } from "./useAlarmState";

const initial = [
  { id: "cpu", message: "CPU high", severity: "warning" as const },
  { id: "mem", message: "Memory critical", severity: "critical" as const },
];

function createMemoryStorage(initialData: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initialData));
  return {
    get length() {
      return data.size;
    },
    clear() {
      data.clear();
    },
    getItem(key: string) {
      return data.get(key) ?? null;
    },
    key(index: number) {
      return [...data.keys()][index] ?? null;
    },
    removeItem(key: string) {
      data.delete(key);
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
  };
}

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

  it("persists ack and shelve actions per scope", () => {
    const storage = createMemoryStorage();

    const { result } = renderHook(() =>
      useAlarmState(initial, {
        scopeId: "dash-a",
        storage,
      }),
    );

    act(() => result.current.ack("cpu"));
    act(() => result.current.shelve("mem"));

    const { result: reloaded } = renderHook(() =>
      useAlarmState(initial, {
        scopeId: "dash-a",
        storage,
      }),
    );

    expect(
      reloaded.current.alarms.find((item) => item.id === "cpu")?.acknowledged,
    ).toBe(true);
    expect(reloaded.current.alarms.some((item) => item.id === "mem")).toBe(false);
    expect(storage.getItem(DEFAULT_ALARM_STATE_KEY)).toContain("dash-a");
  });
});
