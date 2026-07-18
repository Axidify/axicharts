#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { resolveRoot, startStaticServer } from "../browser/lib.mjs";

const root = resolveRoot(import.meta.url);
const STORYBOOK_OUT = path.join(root, "apps/storybook/storybook-static");
const port = Number(process.env.E2E_STORYBOOK_PORT ?? 6018);

if (process.env.SKIP_VISUAL_BUILD === "1") {
  if (!fs.existsSync(STORYBOOK_OUT)) {
    throw new Error(
      `SKIP_VISUAL_BUILD=1 but missing ${STORYBOOK_OUT} — run pnpm --filter @axicharts/storybook build`,
    );
  }
} else {
  execSync("pnpm build", { cwd: root, stdio: "inherit" });
  execSync("pnpm --filter @axicharts/storybook build", { cwd: root, stdio: "inherit" });
}

const server = startStaticServer(STORYBOOK_OUT, port);
console.log(`storybook static @ http://127.0.0.1:${port}`);

function shutdown() {
  server.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
