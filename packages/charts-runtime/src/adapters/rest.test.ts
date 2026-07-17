import { afterEach, describe, expect, it, vi } from "vitest";
import { connectRestSource } from "./rest";
import type { DataSourceSnapshot } from "./types";

describe("connectRestSource", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("polls REST and emits ready snapshots", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ cells: [{ title: "CPU", data: [1, 2, 3] }] }),
    });

    const snapshots: DataSourceSnapshot[] = [];
    const disconnect = connectRestSource(
      {
        type: "rest",
        url: "https://example.test/metrics",
        intervalMs: 50_000,
        fetch: fetchMock,
      },
      (snapshot) => snapshots.push(snapshot),
    );

    await vi.waitFor(() => {
      expect(snapshots.some((item) => item.connection === "ready")).toBe(true);
    });

    const ready = snapshots.find((item) => item.connection === "ready");
    expect(ready?.data.cells).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith("https://example.test/metrics");

    disconnect();
  });
});
