import { describe, expect, it } from "vitest";
import {
  chartConfigFromNominalLabels,
  isNominalColorDimension,
  resolveNominalFill,
} from "./nominalColorMap";

describe("nominalColorMap", () => {
  it("detects priority/status dimension fields", () => {
    expect(isNominalColorDimension("Priority")).toBe(true);
    expect(isNominalColorDimension("Status")).toBe(true);
    expect(isNominalColorDimension("Salesperson")).toBe(false);
  });

  it("maps P1–P4 and severity labels to semantic colors", () => {
    expect(resolveNominalFill("P1 – Critical")).toBe("#f43f5e");
    expect(resolveNominalFill("P2 – High")).toBe("#f59e0b");
    expect(resolveNominalFill("P3 – Medium")).toBe("#3b82f6");
    expect(resolveNominalFill("Critical")).toBe("#f43f5e");
    expect(resolveNominalFill("High")).toBe("#f59e0b");
    expect(resolveNominalFill("Low")).toBe("#64748b");
  });

  it("builds chartConfig entries for known labels", () => {
    expect(chartConfigFromNominalLabels(["Critical", "High", "Unknown"])).toEqual({
      Critical: { color: "#f43f5e" },
      High: { color: "#f59e0b" },
    });
  });
});
