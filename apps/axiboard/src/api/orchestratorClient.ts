import type { Persona } from "@axicharts/charts-spec";
import type { ByokConfig, OrchestratorChatRequest, OrchestratorChatResult, OrchestratorPlanResult } from "../../server/types";

const SESSION_STORAGE_KEY = "axiboard-orchestrator-session";

export function getOrchestratorSessionId(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(SESSION_STORAGE_KEY);
}

export function setOrchestratorSessionId(sessionId: string): void {
  sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
}

type ApiPayload<T> = {
  ok: boolean;
  error?: string;
  result?: T;
  plan?: T;
  sessionId?: string;
};

async function postJson<T>(path: string, body: unknown, apiKey?: string): Promise<ApiPayload<T>> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  const sessionId = getOrchestratorSessionId();
  if (sessionId) headers["x-axiboard-session"] = sessionId;
  if (apiKey?.trim()) headers["x-axiboard-api-key"] = apiKey.trim();

  const response = await fetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  return (await response.json()) as ApiPayload<T>;
}

export async function saveByokSession(config: ByokConfig): Promise<string> {
  const payload = await postJson<{ sessionId: string }>("/api/orchestrator/byok", {
    ...config,
    sessionId: getOrchestratorSessionId() ?? undefined,
  });
  if (!payload.ok || !payload.sessionId) {
    throw new Error(payload.error ?? "Failed to save BYOK session");
  }
  setOrchestratorSessionId(payload.sessionId);
  return payload.sessionId;
}

export async function postOrchestratorPlan(
  request: OrchestratorChatRequest,
): Promise<OrchestratorPlanResult> {
  const payload = await postJson<OrchestratorPlanResult>("/api/orchestrator/plan", request);
  if (!payload.ok || !payload.plan) {
    throw new Error(payload.error ?? "Plan request failed");
  }
  return payload.plan;
}

export async function postOrchestratorChat(
  request: OrchestratorChatRequest,
): Promise<OrchestratorChatResult> {
  const payload = await postJson<OrchestratorChatResult>("/api/orchestrator/chat", request);
  if (!payload.ok || !payload.result) {
    throw new Error(payload.error ?? "Chat request failed");
  }
  return payload.result;
}

export type { OrchestratorChatResult, OrchestratorPlanResult, Persona };
