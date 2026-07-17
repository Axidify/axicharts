import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { parseDataProfileFile } from "@axicharts/charts-spec";
import { planFromIntent, planFromProfile } from "./plan";
import { planWithProvider } from "./provider";
import type { LlmPlannerProvider, PlannerRequest } from "./types";

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function isPlannerRequest(value: unknown): value is PlannerRequest {
  return (
    typeof value === "object" &&
    value !== null &&
    "profile" in value &&
    typeof (value as PlannerRequest).profile === "object"
  );
}

export type PlannerServerOptions = {
  port?: number;
  host?: string;
  provider?: LlmPlannerProvider;
};

export function createPlannerServer(options: PlannerServerOptions = {}) {
  const { port = 3921, host = "127.0.0.1", provider } = options;

  const server = createServer(async (request, response) => {
    if (request.method === "GET" && request.url === "/health") {
      sendJson(response, 200, { ok: true, provider: provider?.id ?? "rules" });
      return;
    }

    if (request.method === "POST" && request.url === "/plan") {
      try {
        const body = await readJsonBody(request);
        if (!isPlannerRequest(body) || !Array.isArray(body.profile.metrics)) {
          sendJson(response, 400, { error: "Request must include profile.metrics" });
          return;
        }

        const plan = body.intent?.trim()
          ? provider
            ? await planWithProvider(body.profile, body.intent.trim(), provider)
            : planFromIntent(body.profile, body.intent.trim())
          : planFromProfile(body.profile);

        sendJson(response, 200, plan);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        sendJson(response, 500, { error: message });
      }
      return;
    }

    sendJson(response, 404, { error: "Not found" });
  });

  return {
    server,
    listen() {
      return new Promise<void>((resolve) => {
        server.listen(port, host, () => resolve());
      });
    },
    url: `http://${host}:${port}`,
  };
}
