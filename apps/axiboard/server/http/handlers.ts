import { extractTabularFromMessage, parseTabular } from "@axicharts/charts-spec/planning";
import type { IncomingMessage, ServerResponse } from "node:http";
import { resolveAuthContext } from "../auth/context";
import { runOrchestratorChat } from "../orchestrator/chat";
import { runTabularPlan } from "../orchestrator/plan";
import {
  createSession,
  getSession,
  updateSessionByok,
} from "../orchestrator/sessionStore";
import { getUserByokStore } from "../persistence/resolveStore";
import type { ByokConfig } from "../types";
import { parseJsonBody } from "./jsonBody";
import { byokBodySchema, tabularInputSchema } from "./schemas";

const SESSION_HEADER = "x-axiboard-session";
const API_KEY_HEADER = "x-axiboard-api-key";

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(payload));
}

async function resolveByok(req: IncomingMessage): Promise<ByokConfig | undefined> {
  const headerKey = req.headers[API_KEY_HEADER];
  if (typeof headerKey === "string" && headerKey.trim()) {
    return { apiKey: headerKey.trim() };
  }

  const auth = resolveAuthContext(req);
  if (auth.enabled && auth.authenticated) {
    const userStore = getUserByokStore();
    const stored = await userStore?.getByok(auth.userId);
    if (stored) return stored;
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

function rowsFromBody(body: {
  csv?: string;
  rows?: Array<Record<string, unknown>>;
  message?: string;
}): Record<string, unknown>[] {
  if (body.csv?.trim()) return parseTabular(body.csv);
  if (body.rows?.length) return body.rows;
  if (body.message?.trim()) {
    const { tabular } = extractTabularFromMessage(body.message);
    if (tabular?.trim()) return parseTabular(tabular);
  }
  return [];
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
      const parsed = await parseJsonBody(req, byokBodySchema);
      if (!parsed.ok) {
        sendJson(res, 400, { ok: false, error: parsed.error });
        return true;
      }

      const body = parsed.data;
      const byok: ByokConfig = {
        apiKey: body.apiKey.trim(),
        model: body.model,
        baseUrl: body.baseUrl,
      };

      const auth = resolveAuthContext(req);
      const userStore = getUserByokStore();
      if (auth.enabled && auth.authenticated && userStore) {
        await userStore.saveByok(auth.userId, byok);
        sendJson(res, 200, { ok: true, userId: auth.userId, persisted: "user" });
        return true;
      }

      if (body.sessionId && updateSessionByok(body.sessionId, byok)) {
        sendJson(res, 200, { ok: true, sessionId: body.sessionId, persisted: "session" });
        return true;
      }
      const sessionId = createSession(byok);
      sendJson(res, 200, { ok: true, sessionId, persisted: "session" });
      return true;
    }

    const parsed = await parseJsonBody(req, tabularInputSchema);
    if (!parsed.ok) {
      sendJson(res, 400, { ok: false, error: parsed.error });
      return true;
    }

    const body = parsed.data;
    const rows = rowsFromBody(body);
    const byok = await resolveByok(req);

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
