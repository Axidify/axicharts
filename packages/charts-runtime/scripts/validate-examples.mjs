import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runCli } from "../dist/cli.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const examplesDir = join(packageRoot, "examples");

function listFixtures(suffix) {
  return readdirSync(examplesDir)
    .filter((name) => name.endsWith(suffix))
    .map((name) => join(examplesDir, name));
}

let failed = false;

for (const file of listFixtures(".runtime.json")) {
  const code = runCli(["validate", file]);
  if (code !== 0) {
    failed = true;
    process.stderr.write(`semantic validation failed: ${file}\n`);
  }
}

for (const file of listFixtures(".share.json")) {
  const code = runCli(["validate", "--share", file]);
  if (code !== 0) {
    failed = true;
    process.stderr.write(`share validation failed: ${file}\n`);
  }
}

if (failed) {
  process.exit(1);
}

process.stdout.write(
  `ok (${listFixtures(".runtime.json").length} runtime, ${listFixtures(".share.json").length} share)\n`,
);
