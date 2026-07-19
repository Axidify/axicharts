import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const toneEnum = ["default", "info", "success", "warning", "critical"];

const seriesMarkProps = {
  field: { type: "string" },
  label: { type: "string" },
  tone: { enum: toneEnum },
  yAxisId: { enum: ["left", "right"] },
  stack: { type: "string" },
  labels: { type: "boolean" },
  curve: { enum: ["linear", "monotone"] },
};

function seriesMarkDef(mark) {
  return {
    oneOf: [
      {
        type: "object",
        required: ["mark", "field"],
        additionalProperties: false,
        properties: { mark: { const: mark }, ...seriesMarkProps },
      },
      {
        type: "object",
        required: ["type", "field"],
        additionalProperties: false,
        properties: { type: { const: mark }, ...seriesMarkProps },
      },
    ],
  };
}

const markDefs = {
  barMark: seriesMarkDef("bar"),
  lineMark: seriesMarkDef("line"),
  areaMark: seriesMarkDef("area"),
  ruleMark: {
    oneOf: [
      {
        type: "object",
        required: ["mark", "value"],
        additionalProperties: false,
        properties: {
          mark: { const: "rule" },
          value: { type: "number" },
          label: { type: "string" },
          tone: { enum: toneEnum },
          orientation: { enum: ["horizontal", "vertical"] },
        },
      },
      {
        type: "object",
        required: ["type", "value"],
        additionalProperties: false,
        properties: {
          type: { const: "rule" },
          value: { type: "number" },
          label: { type: "string" },
          tone: { enum: toneEnum },
          orientation: { enum: ["horizontal", "vertical"] },
        },
      },
    ],
  },
  bandMark: {
    oneOf: [
      {
        type: "object",
        required: ["mark", "min", "max"],
        additionalProperties: false,
        properties: {
          mark: { const: "band" },
          min: { type: "number" },
          max: { type: "number" },
          label: { type: "string" },
          tone: { enum: toneEnum },
        },
      },
      {
        type: "object",
        required: ["type", "min", "max"],
        additionalProperties: false,
        properties: {
          type: { const: "band" },
          min: { type: "number" },
          max: { type: "number" },
          label: { type: "string" },
          tone: { enum: toneEnum },
        },
      },
    ],
  },
};

/** @type {Record<string, object>} */
const exportedSchemas = {
  "cartesian-panel.schema.json": {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://axicharts.dev/schema/cartesian-panel.schema.json",
    title: "CartesianPanelSpec",
    description:
      "RFC-002 cartesian dashboard panel — type cartesian with marks[] only.",
    type: "object",
    required: ["type", "encoding", "marks"],
    additionalProperties: true,
    $defs: markDefs,
    properties: {
      specVersion: { type: "integer", const: 1 },
      type: { type: "string", const: "cartesian" },
      title: { type: "string" },
      mode: { enum: ["static", "interactive", "live"] },
      theme: { enum: ["clean", "studio", "live", "dark"] },
      height: { type: "number", minimum: 80 },
      encoding: {
        type: "object",
        required: ["x"],
        properties: {
          x: {
            type: "object",
            required: ["field"],
            properties: {
              field: { type: "string" },
              label: { type: "string" },
            },
          },
        },
      },
      marks: {
        type: "array",
        minItems: 1,
        items: {
          oneOf: [
            { $ref: "#/$defs/barMark" },
            { $ref: "#/$defs/lineMark" },
            { $ref: "#/$defs/areaMark" },
            { $ref: "#/$defs/ruleMark" },
            { $ref: "#/$defs/bandMark" },
          ],
        },
      },
    },
  },
  "data-profile.schema.json": {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://axicharts.dev/schema/data-profile.schema.json",
    title: "DataProfile",
    description:
      "Known metrics and row fields for cartesian planner and MCP tools.",
    type: "object",
    required: ["metrics"],
    additionalProperties: false,
    properties: {
      metrics: {
        type: "array",
        items: {
          type: "object",
          required: ["name"],
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            unit: { type: "string" },
            kind: {
              enum: ["gauge", "counter", "histogram", "ohlc", "distribution"],
            },
            tags: {
              type: "object",
              additionalProperties: { type: "string" },
            },
          },
        },
      },
      fields: {
        type: "array",
        items: { type: "string" },
      },
    },
  },
};

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schemaDir = join(root, "schema");
const mcpSchemaDir = join(root, "..", "charts-mcp", "schema");

mkdirSync(schemaDir, { recursive: true });
mkdirSync(mcpSchemaDir, { recursive: true });

for (const [filename, schema] of Object.entries(exportedSchemas)) {
  const json = `${JSON.stringify(schema, null, 2)}\n`;
  writeFileSync(join(schemaDir, filename), json);
  if (filename === "cartesian-panel.schema.json") {
    writeFileSync(join(mcpSchemaDir, filename), json);
  }
}

console.log(
  `Exported ${Object.keys(exportedSchemas).length} schemas to packages/charts-spec/schema/`,
);
console.log("Synced cartesian-panel.schema.json to packages/charts-mcp/schema/");
