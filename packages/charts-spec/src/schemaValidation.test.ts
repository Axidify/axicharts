import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  validateCartesianPanelSchemaRaw,
  validateDataProfileSchemaRaw,
} from "./schemaValidation";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXAMPLES = join(ROOT, "examples");

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

describe("exported JSON schemas", () => {
  it("validates cartesian panel gate fixtures", () => {
    const fixtures = [
      "cartesian-revenue-target.panel.json",
      "playground/revenue-target.panel.json",
      "playground/ops-slo.panel.json",
      "playground/dual-metric.panel.json",
      "playground/studio-cell.panel.json",
    ];

    for (const fixture of fixtures) {
      const result = validateCartesianPanelSchemaRaw(readJson(join(EXAMPLES, fixture)));
      expect(result.ok, fixture).toBe(true);
    }
  });

  it("validates mixed data profile example", () => {
    const result = validateDataProfileSchemaRaw(
      readJson(join(EXAMPLES, "mixed.profile.json")),
    );
    expect(result.ok).toBe(true);
  });

  it("cartesian schema oneOf includes each mark type", () => {
    const schema = readJson(join(ROOT, "schema/cartesian-panel.schema.json")) as {
      properties: { marks: { items: { oneOf: Array<{ $ref: string }> } } };
    };
    const refs = schema.properties.marks.items.oneOf.map((item) => item.$ref);
    expect(refs).toEqual([
      "#/$defs/barMark",
      "#/$defs/lineMark",
      "#/$defs/areaMark",
      "#/$defs/ruleMark",
      "#/$defs/bandMark",
    ]);
  });

  it("rejects cartesian panel missing marks", () => {
    const result = validateCartesianPanelSchemaRaw({
      type: "cartesian",
      encoding: { x: { field: "week" } },
      marks: [],
    });
    expect(result.ok).toBe(false);
  });

  it("rejects data profile without metrics", () => {
    const result = validateDataProfileSchemaRaw({ fields: ["week"] });
    expect(result.ok).toBe(false);
  });

  it("rejects combo panel type", () => {
    expect(
      validateCartesianPanelSchemaRaw({
        type: "combo",
        encoding: { x: { field: "week" } },
        marks: [{ type: "bar", field: "revenue" }],
      }).ok,
    ).toBe(false);
  });

  it("accepts RFC mark key on series marks", () => {
    expect(
      validateCartesianPanelSchemaRaw({
        type: "cartesian",
        encoding: { x: { field: "week" } },
        marks: [{ mark: "bar", field: "revenue" }],
      }).ok,
    ).toBe(true);
  });
});
