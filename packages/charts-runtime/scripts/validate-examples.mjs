import { runCli } from "../dist/cli.js";
import { HOSTED_IMPORT_PRESETS } from "../dist/validation/index.js";

let failed = false;

for (const preset of HOSTED_IMPORT_PRESETS) {
  const code = runCli(["validate", "--preset", preset.id, "--all"]);
  if (code !== 0) {
    failed = true;
    process.stderr.write(`validation failed: --preset ${preset.id}\n`);
  }
}

if (failed) {
  process.exit(1);
}

process.stdout.write(`ok (${HOSTED_IMPORT_PRESETS.length} presets via --preset --all)\n`);
