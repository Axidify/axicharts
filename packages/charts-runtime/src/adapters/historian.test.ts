import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildHistorianUrl,
  connectHistorianSource,
  defaultHistorianMapper,
} from "./historian";
import type { DataSourceSnapshot } from "../types";

describe("historian adapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds rolling window query params", () => {
    const query = buildHistorianUrl(
      {
        url: "https://historian.test/api/tags",
        tags: ["cpu", "memory"],
        windowMs: 60_000,
      },
      1_700_000_000_000,
    );

    expect(query).toContain("from=1699999940000");
    expect(query).toContain("to=1700000000000");
    expect(query).toContain("tags=cpu%2Cmemory");
  });

  it("maps tag historian payloads to ops grid data", () => {
    const mapped = defaultHistorianMapper({
      tags: [
        {
          name: "CPU",
          timestamps: ["08:00", "09:00"],
          values: [22, 28],
          suffix: "%",
        },
      ],
      alarms: [{ id: "cpu", message: "warn", severity: "warning" }],
    });

    expect(mapped.categories).toEqual(["08:00", "09:00"]);
    expect(mapped.cells).toEqual([
      { title: "CPU", data: [22, 28], suffix: "%", tone: undefined },
    ]);
  });

  it("passes alarms through on poll", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        tags: [{ name: "CPU", timestamps: ["Mon"], values: [12] }],
        alarms: [{ id: "cpu", message: "warn", severity: "warning" }],
      }),
    });
    const snapshots: DataSourceSnapshot[] = [];

    const disconnect = connectHistorianSource(
      {
        type: "historian",
        url: "https://historian.test/api/tags",
        intervalMs: 60_000,
        fetch: fetchMock,
      },
      (snapshot) => snapshots.push(snapshot),
    );

    await vi.waitFor(() => {
      expect(snapshots.some((item) => item.connection === "ready")).toBe(true);
    });

    expect(fetchMock.mock.calls[0]?.[0]).toContain("/api/tags?from=");
    expect(snapshots.at(-1)?.data.cells).toEqual([
      { title: "CPU", data: [12], suffix: undefined, tone: undefined },
    ]);
    expect(snapshots.at(-1)?.data.alarms).toEqual([
      { id: "cpu", message: "warn", severity: "warning" },
    ]);

    disconnect();
  });
});
