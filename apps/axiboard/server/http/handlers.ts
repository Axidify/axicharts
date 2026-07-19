import { parseTabular } from "@axicharts/charts-spec";
import type { IncomingMessage, ServerResponse } from "node:http";
import { runOrchestratorChat } from "../orchestrator/chat";
import { runTabularPlan } from "../orchestrator/plan";
import {
  createSession,
  getSession,
  updateSessionByok,
} from "../orchestrator/sessionStore";
import type { ByokConfig, OrchestratorChatRequest } from "../types";

const SESSION_HEADER = "x-axiboard-session";
const API_KEY_HEADER = "x-axiboard-api-key";

async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text.trim()) return {} as T;
  return JSON.parse(text) as T;
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(payload));
}

function resolveByok(req: IncomingMessage): ByokConfig | undefined {
  const headerKey = req.headers[API_KEY_HEADER];
  if (typeof headerKey === "string" && headerKey.trim()) {
    return { apiKey: headerKey.trim() };
  }

  const sessionId = req.headers[SESSION_HEADER];
  const session = getSession(typeof sessionId === "string" ? sessionId : undefined);
  if (session?.byok) return session.byok;

  if (process.env.OPENAI_API_KEY?.trim()) {
    return {
      apiKey: process.env.OPENAI_API_KEY.trim(),
      model: process.env.OPENAI_MODEL,
      baseUrl: process.env.OPENAI_BASE_URL,
    };
  }

  return undefined;
}

function rowsFromRequest(body: OrchestratorChatRequest): Record<string, unknown>[] {
  if (body.csv?.trim()) return parseTabular(body.csv);
  return body.rows ?? [];
}

export async function handleOrchestratorRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
): Promise<boolean> {
  if (!pathname.startsWith("/api/orchestrator")) return false;

  if (req.method === "GET" && pathname === "/api/orchestrator/health") {
    sendJson(res, 200, { ok: true, service: "axiboard-orchestrator" });
    return true;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return true;
  }

  try {
    if (pathname === "/api/orchestrator/byok") {
      const body = await readJsonBody<ByokConfig & { sessionId?: string }>(req);
      if (!body.apiKey?.trim()) {
        sendJson(res, 400, { ok: false, error: "apiKey required" });
        return true;
      }
      const byok: ByokConfig = {
        apiKey: body.apiKey.trim(),
        model: body.model,
        baseUrl: body.baseUrl,
      };
      if (body.sessionId && updateSessionByok(body.sessionId, byok)) {
        sendJson(res, 200, { ok: true, sessionId: body.sessionId });
        return true;
      }
      const sessionId = createSession(byok);
      sendJson(res, 200, { ok: true, sessionId });
      return true;
    }

    const body = await readJsonBody<OrchestratorChatRequest>(req);
    const rows = rowsFromRequest(body);
    if (rows.length === 0) {
      sendJson(res, 400, { ok: false, error: "csv or rows required" });
      return true;
    }

    const byok = resolveByok(req);

    if (pathname === "/api/orchestrator/plan") {
      const plan = runTabularPlan(rows, {
        persona: body.persona,
        followUpIntents: body.followUpIntents,
        intent: body.intent,
      });
      if (!plan) {
        sendJson(res, 422, { ok: false, error: "planning failed" });
        return true;
      }
      sendJson(res, 200, { ok: true, plan });
      return true;
    }

    if (pathname === "/api/orchestrator/chat") {
      const result = await runOrchestratorChat(rows, body, byok);
      sendJson(res, 200, { ok: true, result });
      return true;
    }

    sendJson(res, 404, { ok: false, error: "Not found" });
    return true;
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
    return true;
  }
}
