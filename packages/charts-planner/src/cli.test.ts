import { describe, expect, it } from "vitest";
import { runCli } from "./cli";

describe("charts-planner cli", () => {
  it("prints help", () => {
    expect(runCli([])).toBe(0);
    expect(runCli(["--help"])).toBe(0);
  });

  it("plans from example profile", () => {
    expect(
      runCli([
        "plan",
        "examples/ops.profile.json",
        "--intent",
        "Line 3 night shift overview",
      ]),
    ).toBe(0);
  });
});
