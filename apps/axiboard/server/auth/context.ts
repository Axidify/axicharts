import type { IncomingMessage } from "node:http";
import { loadAuthConfig, getDefaultUserId } from "./config";
import { AUTH_COOKIE_NAME, verifySessionToken } from "./session";

export type AuthContext = {
  enabled: boolean;
  userId: string;
  authenticated: boolean;
};

function readCookie(req: IncomingMessage, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function resolveAuthContext(req: IncomingMessage): AuthContext {
  const config = loadAuthConfig();
  if (!config.enabled) {
    return { enabled: false, userId: getDefaultUserId(), authenticated: true };
  }

  const bearer = req.headers.authorization;
  if (typeof bearer === "string" && bearer.startsWith("Bearer ")) {
    const token = bearer.slice("Bearer ".length).trim();
    const userId = config.tokens.get(token);
    if (userId) {
      return { enabled: true, userId, authenticated: true };
    }
  }

  const cookieToken = readCookie(req, AUTH_COOKIE_NAME);
  if (cookieToken) {
    const payload = verifySessionToken(cookieToken, config.secret);
    if (payload) {
      return { enabled: true, userId: payload.userId, authenticated: true };
    }
  }

  return { enabled: true, userId: getDefaultUserId(), authenticated: false };
}
