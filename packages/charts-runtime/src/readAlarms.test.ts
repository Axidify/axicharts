import { describe, expect, it } from "vitest";
import { readAlarms } from "./readAlarms";

describe("readAlarms", () => {
  it("returns validated alarm items from runtime data", () => {
    expect(
      readAlarms({
        alarms: [
          { id: "a1", message: "High CPU", severity: "warning" },
          { message: "missing id" },
        ],
      }),
    ).toEqual([{ id: "a1", message: "High CPU", severity: "warning" }]);
  });
});
