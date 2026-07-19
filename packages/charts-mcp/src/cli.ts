#!/usr/bin/env node

import { runCartesianMcpServer } from "./server";

runCartesianMcpServer().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
