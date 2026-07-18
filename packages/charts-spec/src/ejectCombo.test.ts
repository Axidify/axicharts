import { describe, expect, it } from "vitest";
import { ejectComboBody } from "./ejectCombo";

describe("ejectComboBody", () => {
  it("emits mixed series kinds and dualAxis flag", () => {
    const body = ejectComboBody(
      {
        type: "combo",
        encoding: {
          x: { field: "week" },
          y: [
            { field: "volume", label: "Volume", kind: "bar" },
            { field: "avg", label: "Daily avg", kind: "line" },
          ],
        },
        props: { dualAxis: "auto" },
      },
      "rows",
    );

    expect(body).toContain('kind: "bar"');
    expect(body).toContain('kind: "line"');
    expect(body).toContain('dualAxis="auto"');
    expect(body).toContain("row.week");
  });
});
