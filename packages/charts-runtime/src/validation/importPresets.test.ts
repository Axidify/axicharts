import { describe, expect, it } from "vitest";
import { HOSTED_IMPORT_PRESETS } from "../schemaUrls";
import { fetchImportPreset } from "./importPresets";

const preset = HOSTED_IMPORT_PRESETS[0]!;

describe("fetchImportPreset", () => {
  it("falls back to bundled fixtures when hosted and local fetch fail", async () => {
    const fixture = '{"layout":"embed"}';
    const result = await fetchImportPreset(preset, {
      fetch: async () => new Response(null, { status: 404 }),
      localFixtures: { [preset.filename]: fixture },
    });
    expect(result.json).toBe(fixture);
    expect(result.source).toBe("bundled");
  });

  it("uses local base URL before bundled fixtures", async () => {
    const localJson = '{"layout":"mosaic"}';
    const result = await fetchImportPreset(preset, {
      localBaseUrl: "https://docs.test/examples/",
      fetch: async (url) => {
        if (String(url).includes("axidify.github.io")) {
          return new Response(null, { status: 404 });
        }
        return new Response(localJson, { status: 200 });
      },
      localFixtures: { [preset.filename]: '{"layout":"embed"}' },
    });
    expect(result.json).toBe(localJson);
    expect(result.source).toBe("local");
  });

  it("prefers hosted examples when available", async () => {
    const hostedJson = '{"layout":"embed","dashboard":{"template":"ops-2x2"}}';
    const result = await fetchImportPreset(preset, {
      fetch: async () => new Response(hostedJson, { status: 200 }),
      localFixtures: { [preset.filename]: '{"layout":"mosaic"}' },
    });
    expect(result.json).toBe(hostedJson);
    expect(result.source).toBe("hosted");
  });
});
