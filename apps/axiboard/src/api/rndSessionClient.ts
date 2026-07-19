import type { Persona } from "@axicharts/charts-spec";
import type { OrchestratorChatResult } from "../../server/types";

export type RndSlug = "tabular" | "ledger" | "sales" | "attendance";

export type RndSessionPayload = {
  csv: string;
  persona: Persona;
  followUpIntents: string[];
  lastResult?: OrchestratorChatResult;
  updatedAt: string;
};

type RndSessionResponse = {
  ok: boolean;
  session?: RndSessionPayload | null;
  error?: string;
};

export async function fetchRndSession(slug: RndSlug): Promise<RndSessionPayload | null> {
  const response = await fetch(`/api/rnd/${slug}`);
  const payload = (await response.json()) as RndSessionResponse;
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error ?? "Failed to load R&D session");
  }
  return payload.session ?? null;
}

export async function saveRndSession(slug: RndSlug, session: RndSessionPayload): Promise<void> {
  const response = await fetch(`/api/rnd/${slug}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ session }),
  });
  const payload = (await response.json()) as { ok: boolean; error?: string };
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error ?? "Failed to save R&D session");
  }
}
