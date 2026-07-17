import type {
  DashboardEmbedSpec,
  MosaicWallSpec,
  RuntimeDashboardSpec,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function toPortableRuntimeSpec(spec: RuntimeDashboardSpec): RuntimeDashboardSpec {
  return JSON.parse(JSON.stringify(spec)) as RuntimeDashboardSpec;
}

export function serializeRuntimeSpec(spec: RuntimeDashboardSpec, pretty = true): string {
  const portable = toPortableRuntimeSpec(spec);
  return JSON.stringify(portable, null, pretty ? 2 : undefined);
}

function normalizeEmbed(raw: Record<string, unknown>): DashboardEmbedSpec {
  if (typeof raw.template !== "string") {
    throw new Error("Embed dashboard requires a template");
  }
  return raw as DashboardEmbedSpec;
}

function normalizeWall(raw: Record<string, unknown>): MosaicWallSpec {
  if (!Array.isArray(raw.cells)) {
    throw new Error("Mosaic wall requires a cells array");
  }
  return raw as MosaicWallSpec;
}

export function parseRuntimeSpec(json: string): RuntimeDashboardSpec {
  const raw = JSON.parse(json) as unknown;
  if (!isRecord(raw)) {
    throw new Error("Runtime spec must be a JSON object");
  }

  if (raw.layout === "mosaic") {
    const wall = isRecord(raw.wall) ? raw.wall : raw;
    return { layout: "mosaic", wall: normalizeWall(wall) };
  }

  if (isRecord(raw.dashboard)) {
    return {
      layout: "embed",
      dashboard: normalizeEmbed(raw.dashboard),
    };
  }

  if (typeof raw.template === "string") {
    return { layout: "embed", dashboard: normalizeEmbed(raw) };
  }

  throw new Error("Runtime spec must include dashboard or mosaic wall fields");
}
