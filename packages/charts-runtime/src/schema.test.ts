import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const schemaDir = join(packageRoot, "schema");
const examplesDir = join(packageRoot, "examples");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const runtimeSchema = JSON.parse(
  readFileSync(join(schemaDir, "runtime-spec.schema.json"), "utf8"),
) as object;
const shareSchema = JSON.parse(
  readFileSync(join(schemaDir, "share-export.schema.json"), "utf8"),
) as object;

const validateRuntimeSchema = ajv.compile(runtimeSchema);
const validateShareSchema = ajv.compile(shareSchema);

function readExample(name: string): unknown {
  return JSON.parse(readFileSync(join(examplesDir, name), "utf8")) as unknown;
}

describe("runtime JSON schema", () => {
  it("accepts shipped runtime examples", () => {
    expect(validateRuntimeSchema(readExample("ops-embed.runtime.json"))).toBe(true);
    expect(validateRuntimeSchema(readExample("ops-mosaic.runtime.json"))).toBe(true);
  });

  it("rejects embed specs without template", () => {
    expect(
      validateRuntimeSchema({
        layout: "embed",
        dashboard: { title: "Missing template" },
      }),
    ).toBe(false);
  });

  it("accepts dashboard share export envelope", () => {
    expect(validateShareSchema(readExample("ops-dashboard.share.json"))).toBe(true);
  });

  it("accepts runtime specs with $schema hints", () => {
    expect(
      validateRuntimeSchema({
        $schema: "https://axidify.github.io/axicharts/schema/runtime-spec.schema.json",
        layout: "embed",
        dashboard: { template: "ops-2x2", title: "Ops" },
      }),
    ).toBe(true);
  });
});
