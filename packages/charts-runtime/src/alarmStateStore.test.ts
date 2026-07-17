import { describe, expect, it } from "vitest";
import {
  DEFAULT_ALARM_STATE_KEY,
  loadPersistedAlarmScope,
  parsePersistedAlarmStore,
  savePersistedAlarmScope,
} from "./alarmStateStore";

function createMemoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
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

describe("alarmStateStore", () => {
  it("round-trips acked and shelved ids per scope", () => {
    const storage = createMemoryStorage();

    savePersistedAlarmScope(storage, "dash-a", {
      acked: ["cpu"],
      shelved: ["mem"],
    });

    expect(loadPersistedAlarmScope(storage, "dash-a")).toEqual({
      acked: ["cpu"],
      shelved: ["mem"],
    });
    expect(loadPersistedAlarmScope(storage, "dash-b")).toEqual({
      acked: [],
      shelved: [],
    });
  });

  it("removes empty scopes from storage", () => {
    const storage = createMemoryStorage();
    savePersistedAlarmScope(storage, "dash-a", {
      acked: ["cpu"],
      shelved: [],
    });
    savePersistedAlarmScope(storage, "dash-a", { acked: [], shelved: [] });

    const store = parsePersistedAlarmStore(storage.getItem(DEFAULT_ALARM_STATE_KEY));
    expect(store.scopes["dash-a"]).toBeUndefined();
  });
});
