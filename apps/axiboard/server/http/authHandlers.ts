import type { IncomingMessage, ServerResponse } from "node:http";
import { loadAuthConfig } from "../auth/config";
import { AUTH_COOKIE_NAME, createSessionToken } from "../auth/session";
import { resolveAuthContext } from "../auth/context";
import { parseJsonBody } from "./jsonBody";
import { z } from "zod";

const loginSchema = z.object({
  token: z.string().min(1),
});

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(payload));
}

function setAuthCookie(res: ServerResponse, token: string): void {
  const maxAge = 60 * 60 * 8;
  res.setHeader(
    "set-cookie",
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
  );
}

function clearAuthCookie(res: ServerResponse): void {
  res.setHeader(
    "set-cookie",
    `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
}

export async function handleAuthRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
): Promise<boolean> {
  if (!pathname.startsWith("/api/auth")) return false;

  const config = loadAuthConfig();

  if (req.method === "GET" && pathname === "/api/auth/me") {
    const auth = resolveAuthContext(req);
    sendJson(res, 200, {
      ok: true,
      enabled: config.enabled,
      userId: auth.authenticated ? auth.userId : null,
      authenticated: auth.authenticated,
    });
    return true;
  }

  if (!config.enabled) {
    sendJson(res, 404, { ok: false, error: "Auth not enabled" });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    const parsed = await parseJsonBody(req, loginSchema);
    if (!parsed.ok) {
      sendJson(res, 400, { ok: false, error: parsed.error });
      return true;
    }

    const userId = config.tokens.get(parsed.data.token);
    if (!userId) {
      sendJson(res, 401, { ok: false, error: "Invalid token" });
      return true;
    }

    const sessionToken = createSessionToken(userId, config.secret);
    setAuthCookie(res, sessionToken);
    sendJson(res, 200, { ok: true, userId });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/auth/logout") {
    clearAuthCookie(res);
    sendJson(res, 200, { ok: true });
    return true;
  }

  sendJson(res, 405, { ok: false, error: "Method not allowed" });
  return true;
}
