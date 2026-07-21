import {
  blockMarksToChartProps,
  createCartesianPanel,
  createPanel,
  createTablePanel,
  listCartesianMarks,
  listMarks,
  normalizeToCartesian,
  parseTabular,
  reviseCartesianPanel,
  validateCartesianSpec,
  validatePanel,
  CARTESIAN_PANEL_SCHEMA_URL,
  DATA_PROFILE_SCHEMA_URL,
  type AgentChartFamily,
  type ChartMode,
  type DataProfile,
  type PanelSpec,
  type Persona,
  type SpecData,
  type ThemeName,
} from "@axicharts/charts-spec/planning";
import { planDashboardForMcp } from "./planDashboardMcp";
import { describeDataProfile } from "./describeDataProfile";

function asRowArray(rows?: SpecData): Record<string, unknown>[] | undefined {
  if (rows == null) return undefined;
  return Array.isArray(rows) ? rows : [rows];
}

export { CARTESIAN_PANEL_SCHEMA_URL, DATA_PROFILE_SCHEMA_URL };

export type ToolTextResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

function jsonResult(payload: unknown, isError = false): ToolTextResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    isError,
  };
}

export function handleCreatePanel(args: {
  family: AgentChartFamily;
  intent: string;
  dataProfile?: DataProfile;
  fields?: string[];
  mode?: ChartMode;
  theme?: ThemeName;
}): ToolTextResult {
  try {
    const result = createPanel({
      family: args.family,
      intent: args.intent,
      dataProfile: args.dataProfile,
      fields: args.fields,
      mode: args.mode,
      theme: args.theme,
    });
    return jsonResult(result);
  } catch (error) {
    return jsonResult(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        family: args.family,
      },
      true,
    );
  }
}

export function handleValidatePanel(args: {
  spec: PanelSpec;
  dataProfile?: DataProfile;
  rows?: SpecData;
  strict?: boolean;
}): ToolTextResult {
  const validation = validatePanel(args.spec, {
    dataProfile: args.dataProfile,
    rows: asRowArray(args.rows),
    strict: args.strict ?? true,
  });
  if (!validation.ok) {
    return jsonResult(
      {
        ok: false,
        family: validation.family,
        errors: validation.errors,
      },
      true,
    );
  }
  return jsonResult({
    ok: true,
    family: validation.family,
    spec: validation.spec,
    warnings: validation.warnings,
    schema:
      validation.family === "cartesian" ? CARTESIAN_PANEL_SCHEMA_URL : undefined,
  });
}

export function handleListMarks(args: { family: AgentChartFamily }): ToolTextResult {
  try {
    return jsonResult(listMarks(args.family));
  } catch (error) {
    return jsonResult(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        family: args.family,
      },
      true,
    );
  }
}

export function handleCreateCartesianPanel(args: {
  intent: string;
  dataProfile?: DataProfile;
  fields?: string[];
  mode?: ChartMode;
  theme?: ThemeName;
}): ToolTextResult {
  const result = createCartesianPanel({
    intent: args.intent,
    dataProfile: args.dataProfile,
    fields: args.fields,
    mode: args.mode,
    theme: args.theme,
  });
  return jsonResult({
    schema: CARTESIAN_PANEL_SCHEMA_URL,
    ...result,
  });
}

export function handleValidateCartesianSpec(args: {
  spec: PanelSpec;
  dataProfile?: DataProfile;
  rows?: SpecData;
}): ToolTextResult {
  const panel =
    args.spec.type === "cartesian" || args.spec.type === "blocks"
      ? normalizeToCartesian(args.spec)
      : args.spec;
  const validation = validateCartesianSpec(panel, {
    dataProfile: args.dataProfile,
    rows: asRowArray(args.rows),
  });
  if (!validation.ok) {
    return jsonResult(
      {
        ok: false,
        schema: CARTESIAN_PANEL_SCHEMA_URL,
        errors: validation.errors,
      },
      true,
    );
  }
  return jsonResult({
    ok: true,
    schema: CARTESIAN_PANEL_SCHEMA_URL,
    spec: panel,
    warnings: validation.warnings,
  });
}

export function handleReviseCartesianPanel(args: {
  spec: PanelSpec;
  instruction: string;
  dataProfile?: DataProfile;
}): ToolTextResult {
  const result = reviseCartesianPanel(args);
  return jsonResult({
    schema: CARTESIAN_PANEL_SCHEMA_URL,
    ...result,
  });
}

export function handleListCartesianMarks(): ToolTextResult {
  return jsonResult({
    schema: CARTESIAN_PANEL_SCHEMA_URL,
    catalog: listCartesianMarks(),
    closedSet: listCartesianMarks().map((entry) => entry.mark),
  });
}

export function handleDescribeDataProfile(args: {
  dataProfile?: DataProfile;
  rows?: SpecData;
}): ToolTextResult {
  return jsonResult({
    schema: DATA_PROFILE_SCHEMA_URL,
    ...describeDataProfile({
      dataProfile: args.dataProfile,
      rows: asRowArray(args.rows),
    }),
  });
}

export function handleCreateTablePanel(args: {
  intent?: string;
  title?: string;
  columns?: Array<{ key: string; label?: string; align?: "left" | "right" }>;
  compact?: boolean;
}): ToolTextResult {
  const panel = createTablePanel(args);
  return jsonResult({
    schema: CARTESIAN_PANEL_SCHEMA_URL,
    panel,
    needsReview: false,
    matchedRules: ["table-default"],
  });
}

export function handlePlanDashboard(args: {
  intent?: string;
  csv?: string;
  dataProfile?: DataProfile;
  rows?: SpecData;
  persona?: Persona;
  followUpIntents?: string[];
}): ToolTextResult {
  const rows = args.csv?.trim()
    ? parseTabular(args.csv)
    : (asRowArray(args.rows) ?? []);

  if (rows.length === 0) {
    return jsonResult(
      {
        ok: false,
        error: "plan_dashboard requires csv text or a non-empty rows array",
      },
      true,
    );
  }

  const result = planDashboardForMcp(
    rows,
    {
      intent: args.intent,
      persona: args.persona,
      followUpIntents: args.followUpIntents,
    },
    DATA_PROFILE_SCHEMA_URL,
  );

  if (!result.ok) {
    return jsonResult(result, true);
  }

  return jsonResult(result);
}

export function handleCompileCartesianPanel(args: {
  spec: PanelSpec;
  rows: SpecData;
}): ToolTextResult {
  const validation = validateCartesianSpec(args.spec, { rows: asRowArray(args.rows) });
  if (!validation.ok) {
    return jsonResult({ ok: false, errors: validation.errors }, true);
  }
  const panel = normalizeToCartesian(args.spec);
  const rows = asRowArray(args.rows) ?? [];
  try {
    const compiled = blockMarksToChartProps(rows, panel.marks ?? []);
    if (
      compiled.series.length === 0 &&
      compiled.referenceLines.length === 0 &&
      compiled.thresholdBands.length === 0
    ) {
      throw new Error("No series or overlay marks resolved from rows");
    }
  } catch (error) {
    return jsonResult(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      true,
    );
  }
  return jsonResult({
    ok: true,
    panelType: panel.type,
    markCount: panel.marks?.length ?? 0,
    warnings: validation.warnings,
  });
}

export const TOOL_HANDLERS = {
  create_panel: handleCreatePanel,
  validate_panel: handleValidatePanel,
  list_marks: handleListMarks,
  create_cartesian_panel: handleCreateCartesianPanel,
  validate_cartesian_spec: handleValidateCartesianSpec,
  revise_cartesian_panel: handleReviseCartesianPanel,
  list_cartesian_marks: handleListCartesianMarks,
  describe_data_profile: handleDescribeDataProfile,
  create_table_panel: handleCreateTablePanel,
  plan_dashboard: handlePlanDashboard,
  compile_cartesian_panel: handleCompileCartesianPanel,
} as const;

export type ToolName = keyof typeof TOOL_HANDLERS;

export function callTool(name: ToolName, args: unknown): ToolTextResult {
  const handler = TOOL_HANDLERS[name];
  return handler(args as never);
}
