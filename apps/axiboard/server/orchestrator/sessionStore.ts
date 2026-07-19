import type { ByokConfig } from "../types";

type SessionRecord = {
  byok?: ByokConfig;
  createdAt: number;
};

const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const sessions = new Map<string, SessionRecord>();

function pruneExpired(): void {
  const now = Date.now();
  for (const [id, record] of sessions) {
    if (now - record.createdAt > SESSION_TTL_MS) sessions.delete(id);
  }
}

export function createSession(byok?: ByokConfig): string {
  pruneExpired();
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, { byok, createdAt: Date.now() });
  return sessionId;
}

export function getSession(sessionId: string | undefined): SessionRecord | undefined {
  if (!sessionId) return undefined;
  pruneExpired();
  return sessions.get(sessionId);
}

export function updateSessionByok(sessionId: string, byok: ByokConfig): boolean {
  const record = sessions.get(sessionId);
  if (!record) return false;
  record.byok = byok;
  return true;
}

export function clearSessions(): void {
  sessions.clear();
}
