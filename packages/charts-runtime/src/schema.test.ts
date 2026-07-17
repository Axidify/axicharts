import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  validateRuntimeSpecSchemaRaw,
  validateShareExportSchemaRaw,
} from "./schemaValidation";

const examplesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "examples");

function readExample(name: string): unknown {
  return JSON.parse(readFileSync(join(examplesDir, name), "utf8")) as unknown;
}

describe("runtime JSON schema", () => {
  it("accepts shipped runtime examples", () => {
    expect(validateRuntimeSpecSchemaRaw(readExample("ops-embed.runtime.json")).ok).toBe(true);
    expect(validateRuntimeSpecSchemaRaw(readExample("ops-mosaic.runtime.json")).ok).toBe(true);
  });

  it("rejects embed specs without template", () => {
    expect(
      validateRuntimeSpecSchemaRaw({
        layout: "embed",
        dashboard: { title: "Missing template" },
      }).ok,
    ).toBe(false);
  });

  it("accepts dashboard share export envelope", () => {
    expect(validateShareExportSchemaRaw(readExample("ops-dashboard.share.json")).ok).toBe(true);
  });

  it("accepts runtime specs with $schema hints", () => {
    expect(
      validateRuntimeSpecSchemaRaw({
        $schema: "https://axidify.github.io/axicharts/schema/runtime-spec.schema.json",
        layout: "embed",
        dashboard: { template: "ops-2x2", title: "Ops" },
      }).ok,
    ).toBe(true);
  });
});
