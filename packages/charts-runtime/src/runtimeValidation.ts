import type {
  DashboardEmbedSpec,
  MosaicWallSpec,
  RuntimeDashboardSpec,
} from "./types";

export type RuntimeValidationIssue = {
  path: string;
  message: string;
};

export type RuntimeValidationResult =
  | { ok: true; spec: RuntimeDashboardSpec }
  | { ok: false; errors: RuntimeValidationIssue[] };

const TEMPLATE_IDS = new Set([
  "finance-pnl",
  "trading-blotter",
  "capacity-grid",
  "ops-2x2",
  "line-overview",
  "plugins-wall",
  "program-dashboard",
  "sre-incident",
  "saas-growth",
]);
const THEMES = new Set(["clean", "live", "industrial", "presentation"]);
const MODES = new Set(["static", "interactive", "live", "presentation"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function issue(path: string, message: string): RuntimeValidationIssue {
  return { path, message };
}

function validateTheme(value: unknown, path: string, errors: RuntimeValidationIssue[]): void {
  if (value == null) return;
  if (typeof value !== "string" || !THEMES.has(value)) {
    errors.push(issue(path, "theme must be clean, live, industrial, or presentation"));
  }
}

function validateMode(value: unknown, path: string, errors: RuntimeValidationIssue[]): void {
  if (value == null) return;
  if (typeof value !== "string" || !MODES.has(value)) {
    errors.push(issue(path, "mode must be static, interactive, live, or presentation"));
  }
}

function validateTemplate(value: unknown, path: string, errors: RuntimeValidationIssue[]): void {
  if (typeof value !== "string") {
    errors.push(issue(path, "template is required"));
    return;
  }
  if (!TEMPLATE_IDS.has(value)) {
    errors.push(issue(path, `unknown template "${value}"`));
  }
}

function validateDataSource(raw: unknown, path: string, errors: RuntimeValidationIssue[]): void {
  if (!isRecord(raw)) {
    errors.push(issue(path, "data source must be an object"));
    return;
  }

  const type = raw.type;
  if (typeof type !== "string") {
    errors.push(issue(`${path}.type`, "adapter type is required"));
    return;
  }

  switch (type) {
    case "static":
      if (!isRecord(raw.data)) {
        errors.push(issue(`${path}.data`, "static adapter requires data"));
      }
      break;
    case "rest":
    case "historian":
      if (typeof raw.url !== "string" || !raw.url) {
        errors.push(issue(`${path}.url`, `${type} adapter requires url`));
      }
      break;
    case "websocket":
      if (typeof raw.url !== "string" || !raw.url) {
        errors.push(issue(`${path}.url`, "websocket adapter requires url"));
      }
      break;
    case "mqtt":
      if (typeof raw.url !== "string" || !raw.url) {
        errors.push(issue(`${path}.url`, "mqtt adapter requires url"));
      }
      if (typeof raw.topic !== "string" || !raw.topic) {
        errors.push(issue(`${path}.topic`, "mqtt adapter requires topic"));
      }
      break;
    case "mock-live":
      if (!isRecord(raw.data)) {
        errors.push(issue(`${path}.data`, "mock-live adapter requires data"));
      }
      break;
    default:
      errors.push(issue(`${path}.type`, `unknown adapter type "${type}"`));
  }
}

function collectSourceIds(
  dataSources: unknown,
  path: string,
  errors: RuntimeValidationIssue[],
): Set<string> {
  const ids = new Set<string>();
  if (dataSources == null) return ids;
  if (!Array.isArray(dataSources)) {
    errors.push(issue(path, "dataSources must be an array"));
    return ids;
  }

  dataSources.forEach((item, index) => {
    if (!isRecord(item)) {
      errors.push(issue(`${path}[${index}]`, "data source entry must be an object"));
      return;
    }
    if (typeof item.id !== "string" || !item.id) {
      errors.push(issue(`${path}[${index}].id`, "bound data source requires id"));
      return;
    }
    if (ids.has(item.id)) {
      errors.push(issue(`${path}[${index}].id`, `duplicate data source id "${item.id}"`));
    }
    ids.add(item.id);
    validateDataSource(item, `${path}[${index}]`, errors);
  });

  return ids;
}

function resolveDataSourceId(
  dataSourceId: unknown,
  sourceIds: Set<string>,
  path: string,
  errors: RuntimeValidationIssue[],
): void {
  if (dataSourceId == null) return;
  if (typeof dataSourceId !== "string" || !dataSourceId) {
    errors.push(issue(path, "dataSourceId must be a non-empty string"));
    return;
  }
  if (sourceIds.size > 0 && !sourceIds.has(dataSourceId)) {
    errors.push(issue(path, `dataSourceId "${dataSourceId}" is not defined in dataSources`));
  }
}

function validateEmbedDashboard(
  raw: Record<string, unknown>,
  path: string,
  errors: RuntimeValidationIssue[],
): DashboardEmbedSpec {
  validateTemplate(raw.template, `${path}.template`, errors);
  validateTheme(raw.theme, `${path}.theme`, errors);
  validateMode(raw.mode, `${path}.mode`, errors);

  const sourceIds = collectSourceIds(raw.dataSources, `${path}.dataSources`, errors);
  if (raw.dataSource) {
    validateDataSource(raw.dataSource, `${path}.dataSource`, errors);
  }
  resolveDataSourceId(raw.dataSourceId, sourceIds, `${path}.dataSourceId`, errors);

  return raw as DashboardEmbedSpec;
}

function validateMosaicWall(
  raw: Record<string, unknown>,
  path: string,
  errors: RuntimeValidationIssue[],
): MosaicWallSpec {
  validateTheme(raw.theme, `${path}.theme`, errors);
  validateMode(raw.mode, `${path}.mode`, errors);

  if (!Array.isArray(raw.cells)) {
    errors.push(issue(`${path}.cells`, "mosaic wall requires a cells array"));
    return raw as MosaicWallSpec;
  }

  const sourceIds = collectSourceIds(raw.dataSources, `${path}.dataSources`, errors);
  if (raw.dataSource) {
    validateDataSource(raw.dataSource, `${path}.dataSource`, errors);
  }
  resolveDataSourceId(raw.dataSourceId, sourceIds, `${path}.dataSourceId`, errors);

  const cellIds = new Set<string>();
  raw.cells.forEach((cell, index) => {
    const cellPath = `${path}.cells[${index}]`;
    if (!isRecord(cell)) {
      errors.push(issue(cellPath, "cell must be an object"));
      return;
    }
    if (typeof cell.id !== "string" || !cell.id) {
      errors.push(issue(`${cellPath}.id`, "cell id is required"));
    } else if (cellIds.has(cell.id)) {
      errors.push(issue(`${cellPath}.id`, `duplicate cell id "${cell.id}"`));
    } else {
      cellIds.add(cell.id);
    }
    validateTemplate(cell.template, `${cellPath}.template`, errors);
    validateTheme(cell.theme, `${cellPath}.theme`, errors);
    validateMode(cell.mode, `${cellPath}.mode`, errors);
    resolveDataSourceId(
      cell.dataSourceId,
      sourceIds,
      `${cellPath}.dataSourceId`,
      errors,
    );
  });

  return raw as MosaicWallSpec;
}

export function validateRuntimeSpecRaw(raw: unknown): RuntimeValidationResult {
  const errors: RuntimeValidationIssue[] = [];

  if (!isRecord(raw)) {
    return { ok: false, errors: [issue("$", "runtime spec must be a JSON object")] };
  }

  if (raw.layout === "mosaic") {
    const wallRaw = isRecord(raw.wall) ? raw.wall : raw;
    const wall = validateMosaicWall(wallRaw, isRecord(raw.wall) ? "wall" : "$", errors);
    if (errors.length > 0) return { ok: false, errors };
    return { ok: true, spec: { layout: "mosaic", wall } };
  }

  if (isRecord(raw.dashboard)) {
    const dashboard = validateEmbedDashboard(raw.dashboard, "dashboard", errors);
    if (errors.length > 0) return { ok: false, errors };
    return { ok: true, spec: { layout: "embed", dashboard } };
  }

  if (typeof raw.template === "string") {
    const dashboard = validateEmbedDashboard(raw, "$", errors);
    if (errors.length > 0) return { ok: false, errors };
    return { ok: true, spec: { layout: "embed", dashboard } };
  }

  return {
    ok: false,
    errors: [issue("$", "runtime spec must include dashboard or mosaic wall fields")],
  };
}

export function validateRuntimeSpecJson(json: string): RuntimeValidationResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, errors: [issue("$", `invalid JSON: ${message}`)] };
  }
  return validateRuntimeSpecRaw(raw);
}

export function formatValidationErrors(errors: RuntimeValidationIssue[]): string {
  return errors.map((item) => `${item.path}: ${item.message}`).join("; ");
}

export function assertRuntimeSpec(raw: unknown): RuntimeDashboardSpec {
  const result = validateRuntimeSpecRaw(raw);
  if (!result.ok) {
    throw new Error(formatValidationErrors(result.errors));
  }
  return result.spec;
}
