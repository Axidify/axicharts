import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schemaSrc = join(root, "packages/charts-runtime/schema");
const schemaDest = join(root, "apps/docs/public/schema");
const examplesSrc = join(root, "packages/charts-runtime/examples");
const examplesDest = join(root, "apps/docs/public/examples");

mkdirSync(schemaDest, { recursive: true });
mkdirSync(examplesDest, { recursive: true });

for (const name of ["runtime-spec.schema.json", "share-export.schema.json"]) {
  cpSync(join(schemaSrc, name), join(schemaDest, name));
}

for (const name of [
  "ops-embed.runtime.json",
  "ops-mosaic.runtime.json",
  "ops-dashboard.share.json",
  "ops-workspace.workspace.json",
  "ops-historian.runtime.json",
  "ops-mqtt.runtime.json",
  "ops-rest.runtime.json",
  "ops-websocket.runtime.json",
  "ops-mock-live.runtime.json",
]) {
  cpSync(join(examplesSrc, name), join(examplesDest, name));
}
