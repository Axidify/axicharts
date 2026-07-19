import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as connectModule from "./connectSource";
import { useDataSource } from "./useDataSource";

describe("useDataSource", () => {
  it("does not reconnect when static spec identity changes but data is equal", () => {
    const spy = vi.spyOn(connectModule, "connectSource");
    const { rerender } = renderHook(({ spec }) => useDataSource(spec), {
      initialProps: {
        spec: { type: "static" as const, data: { rows: [{ week: "W1", cpu: 1 }] } },
      },
    });

    expect(spy).toHaveBeenCalledTimes(1);

    rerender({
      spec: { type: "static", data: { rows: [{ week: "W1", cpu: 1 }] } },
    });

    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
