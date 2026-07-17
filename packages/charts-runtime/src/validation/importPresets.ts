import type { HostedImportPreset } from "../schemaUrls";
import { hostedImportPresetUrl, localImportPresetUrl } from "../schemaUrls";

export type ImportPresetSource = "hosted" | "local" | "bundled";

export type FetchImportPresetOptions = {
  localBaseUrl?: string;
  localFixtures?: Record<string, string>;
  fetch?: typeof fetch;
};

export type FetchImportPresetResult = {
  json: string;
  source: ImportPresetSource;
};

async function tryFetchUrl(
  fetchFn: typeof fetch,
  url: string,
): Promise<string | null> {
  try {
    const response = await fetchFn(url);
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

export async function fetchImportPreset(
  preset: HostedImportPreset,
  options: FetchImportPresetOptions = {},
): Promise<FetchImportPresetResult> {
  const fetchFn = options.fetch ?? fetch;

  const hosted = await tryFetchUrl(fetchFn, hostedImportPresetUrl(preset));
  if (hosted) {
    return { json: hosted, source: "hosted" };
  }

  if (options.localBaseUrl) {
    const local = await tryFetchUrl(
      fetchFn,
      localImportPresetUrl(preset, options.localBaseUrl),
    );
    if (local) {
      return { json: local, source: "local" };
    }
  }

  const bundled =
    options.localFixtures?.[preset.filename] ?? options.localFixtures?.[preset.id];
  if (bundled) {
    return { json: bundled, source: "bundled" };
  }

  throw new Error(`Could not load ${preset.label}`);
}
