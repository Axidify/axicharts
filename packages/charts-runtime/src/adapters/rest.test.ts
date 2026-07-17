import { afterEach, describe, expect, it, vi } from "vitest";
import { connectRestSource } from "./rest";
import { defaultRestMapper } from "./normalize";
import type { DataSourceSnapshot } from "../types";

describe("rest adapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps JSON objects with defaultRestMapper", () => {
    expect(defaultRestMapper({ kpis: [{ value: "1" }] })).toEqual({
      kpis: [{ value: "1" }],
    });
  });

  it("passes alarms through merge on poll", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        categories: ["Mon"],
        cells: [{ title: "CPU", data: [1] }],
        alarms: [{ id: "a1", message: "warn", severity: "warning" }],
      }),
    });
    const snapshots: DataSourceSnapshot[] = [];

    const disconnect = connectRestSource(
      {
        type: "rest",
        url: "https://metrics.test/api",
        intervalMs: 60_000,
        fetch: fetchMock,
      },
      (snapshot) => snapshots.push(snapshot),
    );

    await vi.waitFor(() => {
      expect(snapshots.some((item) => item.connection === "ready")).toBe(true);
    });

    expect(snapshots.at(-1)?.data.alarms).toEqual([
      { id: "a1", message: "warn", severity: "warning" },
    ]);

    disconnect();
  });

  it("does not flash connecting after first success", async () => {
    let pollCount = 0;
    const fetchMock = vi.fn().mockImplementation(async () => {
      pollCount += 1;
      return {
        ok: true,
        json: async () => ({ value: pollCount }),
      };
    });
    const snapshots: DataSourceSnapshot[] = [];

    const disconnect = connectRestSource(
      {
        type: "rest",
        url: "https://metrics.test/api",
        intervalMs: 10,
        fetch: fetchMock,
      },
      (snapshot) => snapshots.push(snapshot),
    );

    await vi.waitFor(() => {
      expect(snapshots.filter((item) => item.connection === "ready").length).toBeGreaterThan(1);
    });

    expect(snapshots.some((item, index) => index > 0 && item.connection === "connecting")).toBe(
      false,
    );

    disconnect();
  });
});
