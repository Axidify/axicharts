import { describe, expect, it } from "vitest";
import {
  buildMosaicPreset,
  mosaicPresetTemplates,
} from "./build";
import { listMosaicPresets } from "../mosaicPresetMeta";

describe("mosaicPresets", () => {
  it("lists named presets", () => {
    const presets = listMosaicPresets();
    expect(presets.map((item) => item.id)).toEqual([
      "ops-finance",
      "ops-overview",
      "trading-program",
      "command-center",
    ]);
  });

  it("builds ops-finance with multi-source cells", () => {
    const wall = buildMosaicPreset("ops-finance");
    expect(wall.cells).toHaveLength(2);
    expect(wall.dataSources?.map((source) => source.id)).toEqual(["ops", "finance"]);
    expect(wall.cells[0]?.template).toBe("ops-2x2");
    expect(wall.cells[1]?.template).toBe("finance-pnl");
  });

  it("builds trading-program with mixed themes", () => {
    const wall = buildMosaicPreset("trading-program");
    expect(mosaicPresetTemplates("trading-program")).toEqual([
      "trading-blotter",
      "program-dashboard",
    ]);
    expect(wall.cells[0]?.theme).toBe("live");
    expect(wall.cells[1]?.theme).toBe("clean");
  });

  it("includes shared alarm fixtures", () => {
    const wall = buildMosaicPreset("command-center");
    expect(wall.data?.alarms).toHaveLength(1);
  });
});
