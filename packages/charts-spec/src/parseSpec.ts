import { SPEC_VERSION, type DashboardSpec, type DataProfile, type PanelSpec } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizePanelSpec(raw: unknown): PanelSpec {
  if (!isRecord(raw) || typeof raw.type !== "string") {
    throw new Error("Panel spec must be an object with a type field");
  }

  const version = raw.specVersion;
  if (version != null && version !== SPEC_VERSION) {
    throw new Error(
      `Unsupported specVersion ${String(version)} (expected ${SPEC_VERSION})`,
    );
  }

  return {
    specVersion: SPEC_VERSION,
    ...(raw as PanelSpec),
  };
}

export function parsePanelSpecFile(json: string): PanelSpec {
  return normalizePanelSpec(JSON.parse(json));
}

export function parseDataProfileFile(json: string): DataProfile {
  const raw = JSON.parse(json) as unknown;
  if (!isRecord(raw) || !Array.isArray(raw.metrics)) {
    throw new Error("Data profile must include a metrics array");
  }
  return raw as DataProfile;
}

export function parseDashboardSpecFile(json: string): DashboardSpec {
  const raw = JSON.parse(json) as unknown;
  if (!isRecord(raw) || typeof raw.template !== "string" || !isRecord(raw.data)) {
    throw new Error("Dashboard spec must include template and data");
  }
  return {
    specVersion: SPEC_VERSION,
    ...(raw as DashboardSpec),
  };
}
