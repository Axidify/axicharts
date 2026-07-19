import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAxiboardServer } from "./createServer";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const staticDir =
  process.env.AXIBOARD_STATIC_DIR?.trim() || path.resolve(appRoot, "../dist");

const { listen, url } = createAxiboardServer({ staticDir });

await listen();
console.log(`Axiboard listening on ${url}`);
console.log(`  static: ${staticDir}`);
console.log(`  orchestrator: ${url}/api/orchestrator/health`);
