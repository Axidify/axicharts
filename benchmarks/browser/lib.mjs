import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const BENCH_PORT = 5175;
export const BENCH_BASE_URL = `http://localhost:${BENCH_PORT}`;

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

export function buildHarnessUrl(params) {
  const search = new URLSearchParams(params);
  return `${BENCH_BASE_URL}/?${search.toString()}`;
}

export function resolveRoot(importMetaUrl) {
  return path.resolve(path.dirname(fileURLToPath(importMetaUrl)), "../..");
}

export function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

export function percentile(sorted, p) {
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * p) - 1),
  );
  return sorted[index] ?? 0;
}
