#!/usr/bin/env node
/**
 * Registry E2E — validates source registry + dry-runs/adds via shadcn CLI.
 *
 * shadcn blocks http://127.0.0.1 URLs, so the CLI integration step uses the
 * hosted GitHub Pages item JSON (stable in CI). Source validation + built JSON
 * contract checks run entirely locally.
 */
import { execFileSync, execSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const registrySourceDir = join(root, "registry");
const registryBuiltDir = join(root, "apps/docs/public/registry");
const shadcnBin = join(root, "node_modules/.bin/shadcn");

const HOSTED_ITEM_URL =
  process.env.REGISTRY_E2E_URL ??
  "https://axidify.github.io/axicharts/registry/chart-axi-bar.json";

const workspaceChartsVersion = JSON.parse(
  readFileSync(join(root, "packages/charts/package.json"), "utf8"),
).version;

/** Use latest published npm version when workspace version is not on npm yet (CI runs before publish). */
function resolveInstallVersion() {
  try {
    execSync(`npm view @axicharts/charts@${workspaceChartsVersion} version`, {
      cwd: root,
      stdio: "pipe",
    });
    return workspaceChartsVersion;
  } catch {
    const latest = execSync("npm view @axicharts/charts version", {
      cwd: root,
      encoding: "utf8",
    }).trim();
    console.warn(
      `registry e2e: @axicharts/charts@${workspaceChartsVersion} not on npm; using @${latest}`,
    );
    return latest;
  }
}

function writeInstallableRegistryItem(workDir) {
  const item = JSON.parse(
    readFileSync(join(registryBuiltDir, "chart-axi-bar.json"), "utf8"),
  );
  const version = resolveInstallVersion();
  item.dependencies = [
    `@axicharts/charts@${version}`,
    `@axicharts/charts-theme@${version}`,
  ];
  const itemPath = join(workDir, "chart-axi-bar.local.json");
  writeFileSync(itemPath, JSON.stringify(item, null, 2));
  return itemPath;
}

function run(command, options = {}) {
  execSync(command, { cwd: root, stdio: "inherit", ...options });
}

function shadcn(args, cwd = root) {
  execFileSync(shadcnBin, args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, CI: "true" },
  });
}

function scaffoldShadcnProject(workDir) {
  execSync("npm create vite@latest . -- --template react-ts", {
    cwd: workDir,
    stdio: "inherit",
    env: { ...process.env, CI: "true" },
  });
  execSync("npm install", { cwd: workDir, stdio: "inherit" });
  execSync("npm install -D tailwindcss @tailwindcss/vite", {
    cwd: workDir,
    stdio: "inherit",
  });

  writeFileSync(
    join(workDir, "vite.config.ts"),
    `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
`,
  );
  writeFileSync(join(workDir, "src/index.css"), '@import "tailwindcss";\n');
  writeFileSync(
    join(workDir, "tsconfig.app.json"),
    `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
`,
  );

  shadcn(["init", "-y", "-d", "-t", "vite", "-f"], workDir);
}

function assertBuiltRegistryContract() {
  const itemPath = join(registryBuiltDir, "chart-axi-bar.json");
  const item = JSON.parse(readFileSync(itemPath, "utf8"));
  const file = item.files?.[0];
  if (!file?.content || !file.path) {
    throw new Error("built chart-axi-bar.json missing inline file content");
  }
  if (!file.content.includes("ChartContainer") || !file.content.includes("BarChart")) {
    throw new Error("built chart-axi-bar content missing ChartContainer/BarChart");
  }
  const catalog = JSON.parse(readFileSync(join(registryBuiltDir, "registry.json"), "utf8"));
  if (!catalog.items?.some((entry) => entry.name === "chart-axi-bar")) {
    throw new Error("registry.json catalog missing chart-axi-bar");
  }
}

function resolveInstalledFile(workDir) {
  const candidates = [
    join(workDir, "@/components/charts/chart-axi-bar.tsx"),
    join(workDir, "src/components/charts/chart-axi-bar.tsx"),
  ];
  for (const path of candidates) {
    if (existsSync(path)) {
      return path;
    }
  }
  throw new Error(
    `chart-axi-bar.tsx not found in fixture project (checked ${candidates.join(", ")})`,
  );
}

async function main() {
  console.log("registry e2e: build + validate source registry");
  run("node scripts/build-registry.mjs");
  shadcn(["registry", "validate", "-c", registrySourceDir, "registry.json"]);
  assertBuiltRegistryContract();

  const workDir = mkdtempSync(join(tmpdir(), "axicharts-registry-e2e-"));
  try {
    console.log("registry e2e: scaffold shadcn/vite fixture");
    scaffoldShadcnProject(workDir);

    console.log(`registry e2e: shadcn add --dry-run ${HOSTED_ITEM_URL}`);
    shadcn(["add", "-y", "--dry-run", HOSTED_ITEM_URL], workDir);

    const localItemPath = writeInstallableRegistryItem(workDir);
    console.log(`registry e2e: shadcn add ${localItemPath} (npm-resolved deps)`);
    shadcn(["add", "-y", "-o", localItemPath], workDir);

    const target = resolveInstalledFile(workDir);
    const content = readFileSync(target, "utf8");
    if (!content.includes("ChartContainer") || !content.includes("BarChart")) {
      throw new Error("installed chart-axi-bar.tsx missing expected imports");
    }
    console.log("registry e2e: ok");
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
