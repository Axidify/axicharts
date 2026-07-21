import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  callTool,
  CARTESIAN_PANEL_SCHEMA_URL,
  type ToolName,
} from "./tools";

const dataProfileSchema = z
  .object({
    fields: z.array(z.string()).optional(),
    metrics: z
      .array(
        z.object({
          name: z.string(),
          kind: z.string().optional(),
        }),
      )
      .optional(),
  })
  .optional();

const panelSpecSchema = z.record(z.unknown());

const rowsSchema = z.array(z.record(z.unknown()));

export type CartesianMcpServerOptions = {
  name?: string;
  version?: string;
};

export function createCartesianMcpServer(
  options: CartesianMcpServerOptions = {},
): McpServer {
  const server = new McpServer({
    name: options.name ?? "axicharts-cartesian",
    version: options.version ?? "0.1.0",
  });

  server.tool(
    "create_panel",
    `Create a panel from natural-language intent. Dispatches by family (cartesian, distribution, matrix). Prefer over create_cartesian_panel.`,
    {
      family: z
        .enum(["cartesian", "distribution", "matrix"])
        .describe("Chart family — only cartesian is agent-ready today"),
      intent: z.string().describe("Chart intent — must name mark types for cartesian"),
      fields: z.array(z.string()).optional().describe("Row field names from sample data"),
      dataProfile: dataProfileSchema,
      mode: z.enum(["static", "interactive", "live"]).optional(),
      theme: z.enum(["clean", "studio", "live", "dark"]).optional(),
    },
    async (args) => callTool("create_panel", args),
  );

  server.tool(
    "validate_panel",
    `Validate any panel spec against data. Dispatches by family; strict mode rejects Tier-2 panels. Prefer over validate_cartesian_spec.`,
    {
      spec: panelSpecSchema,
      dataProfile: dataProfileSchema,
      rows: rowsSchema.optional(),
      strict: z.boolean().optional().describe("Reject Tier-2 / unimplemented families (default true)"),
    },
    async (args) => callTool("validate_panel", args),
  );

  server.tool(
    "list_marks",
    "List closed mark catalog for a chart family. Prefer over list_cartesian_marks.",
    {
      family: z.enum(["cartesian", "distribution", "matrix"]),
    },
    async (args) => callTool("list_marks", args),
  );

  server.tool(
    "create_cartesian_panel",
    `Create a cartesian panel (type: cartesian + marks[]) from natural-language intent. Schema: ${CARTESIAN_PANEL_SCHEMA_URL}`,
    {
      intent: z.string().describe("Chart intent — must name mark types (bar, line, area)"),
      fields: z.array(z.string()).optional().describe("Row field names from sample data"),
      rows: rowsSchema.optional().describe("Raw rows — use with groupBy + aggregates to pre-aggregate"),
      groupBy: z.string().optional().describe("When rows provided, group before binding axes"),
      aggregates: z
        .record(
          z.union([
            z.object({ op: z.literal("count") }),
            z.object({ op: z.literal("sum"), field: z.string() }),
            z.object({ op: z.literal("sum"), fields: z.array(z.string()) }),
            z.object({ op: z.literal("last"), field: z.string() }),
          ]),
        )
        .optional(),
      where: z
        .array(
          z.object({
            field: z.string(),
            op: z.enum(["eq", "neq", "gt", "gte", "lt", "lte"]),
            value: z.union([z.string(), z.number()]),
          }),
        )
        .optional(),
      xField: z.string().optional(),
      yField: z.string().optional(),
      yFields: z.array(z.string()).optional(),
      dataProfile: dataProfileSchema,
      mode: z.enum(["static", "interactive", "live"]).optional(),
      theme: z.enum(["clean", "studio", "live", "dark"]).optional(),
    },
    async (args) => callTool("create_cartesian_panel", args),
  );

  server.tool(
    "validate_cartesian_spec",
    `Validate a cartesian panel spec against data. Returns canonical spec or errors with suggestions. Schema: ${CARTESIAN_PANEL_SCHEMA_URL}`,
    {
      spec: panelSpecSchema,
      dataProfile: dataProfileSchema,
      rows: rowsSchema.optional(),
    },
    async (args) => callTool("validate_cartesian_spec", args),
  );

  server.tool(
    "revise_cartesian_panel",
    `Revise an existing cartesian panel from a follow-up instruction (e.g. add quota line). Schema: ${CARTESIAN_PANEL_SCHEMA_URL}`,
    {
      spec: panelSpecSchema,
      instruction: z.string(),
      dataProfile: dataProfileSchema,
    },
    async (args) => callTool("revise_cartesian_panel", args),
  );

  server.tool(
    "list_cartesian_marks",
    `List the closed v1 mark catalog (bar, line, area, rule, band). Schema: ${CARTESIAN_PANEL_SCHEMA_URL}`,
    {},
    async () => callTool("list_cartesian_marks", {}),
  );

  server.tool(
    "describe_data_profile",
    "Infer field names and roles (time, category, numeric) from a data profile or sample rows.",
    {
      dataProfile: dataProfileSchema,
      rows: rowsSchema.optional(),
    },
    async (args) => callTool("describe_data_profile", args),
  );

  server.tool(
    "compile_cartesian_panel",
    "Validate then compile a cartesian panel against rows (smoke test before render).",
    {
      spec: panelSpecSchema,
      rows: rowsSchema,
    },
    async (args) => callTool("compile_cartesian_panel", args),
  );

  server.tool(
    "create_table_panel",
    "Create a table panel for transaction lists or row previews (C150).",
    {
      intent: z.string().optional(),
      title: z.string().optional(),
      columns: z
        .array(
          z.object({
            key: z.string(),
            label: z.string().optional(),
            align: z.enum(["left", "right"]).optional(),
          }),
        )
        .optional(),
      compact: z.boolean().optional(),
    },
    async (args) => callTool("create_table_panel", args),
  );

  server.tool(
    "plan_dashboard",
    "Plan a full tabular dashboard via C157 planner — compiled KPIs/charts, decision log, persona, and template shell (C159).",
    {
      intent: z.string().optional(),
      csv: z.string().optional().describe("Pipe or comma-delimited table text"),
      dataProfile: dataProfileSchema,
      rows: rowsSchema.optional(),
      persona: z
        .enum(["executive", "manager", "analyst", "operator"])
        .optional()
        .describe("Audience persona for question ranking"),
      followUpIntents: z
        .array(z.string())
        .optional()
        .describe("NL follow-ups mapped to catalog questions (e.g. show payment method breakdown)"),
    },
    async (args) => callTool("plan_dashboard", args),
  );

  server.tool(
    "list_transform_ops",
    "List closed transform ops for execute_transform (groupBy + aggregates + where).",
    {},
    async () => callTool("list_transform_ops", {}),
  );

  server.tool(
    "execute_transform",
    "Group and aggregate tabular rows before compose_panel or create_cartesian_panel.",
    {
      rows: rowsSchema,
      groupBy: z.string().describe("Dimension field to group by"),
      aggregates: z
        .record(
          z.union([
            z.object({ op: z.literal("count") }),
            z.object({ op: z.literal("sum"), field: z.string() }),
            z.object({ op: z.literal("sum"), fields: z.array(z.string()) }),
            z.object({ op: z.literal("last"), field: z.string() }),
          ]),
        )
        .describe("Output field name → aggregate spec"),
      where: z
        .array(
          z.object({
            field: z.string(),
            op: z.enum(["eq", "neq", "gt", "gte", "lt", "lte"]),
            value: z.union([z.string(), z.number()]),
          }),
        )
        .optional(),
    },
    async (args) => callTool("execute_transform", args),
  );

  server.tool(
    "compose_panel",
    "Compile a PanelRecipe + rows into agent-safe PanelSpec (C174). Prefer over hand-written JSON.",
    {
      recipe: z.record(z.unknown()).describe("PanelRecipe from plan_dashboard or catalog"),
      rows: rowsSchema,
      dataProfile: dataProfileSchema,
      mode: z.enum(["static", "interactive", "live"]).optional(),
      theme: z.enum(["clean", "studio", "live", "dark"]).optional(),
    },
    async (args) => callTool("compose_panel", args),
  );

  return server;
}

export async function runCartesianMcpServer(
  options: CartesianMcpServerOptions = {},
): Promise<void> {
  const server = createCartesianMcpServer(options);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

export function isToolName(value: string): value is ToolName {
  return (
    value === "create_panel" ||
    value === "validate_panel" ||
    value === "list_marks" ||
    value === "create_cartesian_panel" ||
    value === "validate_cartesian_spec" ||
    value === "revise_cartesian_panel" ||
    value === "list_cartesian_marks" ||
    value === "describe_data_profile" ||
    value === "create_table_panel" ||
    value === "plan_dashboard" ||
    value === "list_transform_ops" ||
    value === "execute_transform" ||
    value === "compose_panel" ||
    value === "compile_cartesian_panel"
  );
}
