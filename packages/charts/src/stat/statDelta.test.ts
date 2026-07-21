import { describe, expect, it } from "vitest";
import { inferStatDeltaDirection, statDeltaChipStyle } from "./statDelta";

describe("statDelta", () => {
  it("infers direction from signed delta strings", () => {
    expect(inferStatDeltaDirection("+12.4%")).toBe("up");
    expect(inferStatDeltaDirection("-3.1 pts")).toBe("down");
    expect(inferStatDeltaDirection("flat")).toBe("neutral");
  });

  it("uses tremor-style light-surface chip colors", () => {
    expect(statDeltaChipStyle("up", "light")).toEqual({
      background: "#ecfdf5",
      color: "#15803d",
    });
    expect(statDeltaChipStyle("down", "light")).toEqual({
      background: "#fff7ed",
      color: "#c2410c",
    });
  });
});
