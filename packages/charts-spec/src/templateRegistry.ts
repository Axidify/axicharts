import type { ReactElement } from "react";
import type { ChartConfigSpec, ChartMode, ThemeName } from "./types";

export type DashboardTemplateRenderer = (
  data: Record<string, unknown>,
  theme: ThemeName,
  mode?: ChartMode,
  chartConfig?: ChartConfigSpec,
) => ReactElement;

export type DashboardTemplateRegistration = {
  id: string;
  label: string;
  vertical?: string;
  render: DashboardTemplateRenderer;
};

export type DashboardTemplateMeta = {
  id: string;
  label: string;
  vertical?: string;
  source: "builtin" | "community";
};

const builtins = new Map<string, DashboardTemplateRegistration>();
const community = new Map<string, DashboardTemplateRegistration>();

function assertId(id: string): string {
  const trimmed = id.trim();
  if (!trimmed) {
    throw new Error("[AxiCharts] Dashboard template id is required");
  }
  if (!/^[a-z][a-z0-9-]*$/.test(trimmed)) {
    throw new Error(
      `[AxiCharts] Dashboard template id "${trimmed}" must be lowercase kebab-case`,
    );
  }
  return trimmed;
}

export function registerBuiltinDashboardTemplate(
  registration: DashboardTemplateRegistration,
): void {
  const id = assertId(registration.id);
  if (builtins.has(id)) {
    throw new Error(`[AxiCharts] Builtin dashboard template "${id}" is already registered`);
  }
  if (community.has(id)) {
    throw new Error(
      `[AxiCharts] Dashboard template "${id}" is already registered as a community template`,
    );
  }
  builtins.set(id, { ...registration, id });
}

/** Register a third-party or community dashboard template without forking charts-spec. */
export function registerDashboardTemplate(registration: DashboardTemplateRegistration): void {
  const id = assertId(registration.id);
  if (builtins.has(id)) {
    throw new Error(
      `[AxiCharts] Dashboard template "${id}" is reserved by a builtin template`,
    );
  }
  if (community.has(id)) {
    throw new Error(`[AxiCharts] Community dashboard template "${id}" is already registered`);
  }
  community.set(id, { ...registration, id });
}

export function getTemplateRenderer(id: string): DashboardTemplateRenderer | undefined {
  return builtins.get(id)?.render ?? community.get(id)?.render;
}

export function isRegisteredTemplate(id: string): boolean {
  return builtins.has(id) || community.has(id);
}

export function listTemplates(): string[] {
  return [...builtins.keys(), ...community.keys()];
}

export function listTemplateMeta(): DashboardTemplateMeta[] {
  return [
    ...[...builtins.values()].map((entry) => ({
      id: entry.id,
      label: entry.label,
      vertical: entry.vertical,
      source: "builtin" as const,
    })),
    ...[...community.values()].map((entry) => ({
      id: entry.id,
      label: entry.label,
      vertical: entry.vertical,
      source: "community" as const,
    })),
  ];
}

export function clearCommunityTemplates(): void {
  community.clear();
}

export function clearBuiltinTemplates(): void {
  builtins.clear();
}
