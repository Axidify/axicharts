export type AuthConfig = {
  enabled: boolean;
  secret: string;
  tokens: Map<string, string>;
};

const DEFAULT_USER_ID = "default";

export function getDefaultUserId(): string {
  return DEFAULT_USER_ID;
}

export function loadAuthConfig(): AuthConfig {
  const secret = process.env.AXIBOARD_AUTH_SECRET?.trim() ?? "";
  const enabled =
    process.env.AXIBOARD_AUTH_ENABLED === "true" ||
    process.env.AXIBOARD_AUTH_ENABLED === "1" ||
    secret.length >= 16;

  const tokens = new Map<string, string>();
  const rawTokens = process.env.AXIBOARD_AUTH_TOKENS?.trim();
  if (rawTokens) {
    for (const entry of rawTokens.split(",")) {
      const [userId, token] = entry.split(":").map((part) => part.trim());
      if (userId && token) tokens.set(token, userId);
    }
  }

  return {
    enabled: enabled && secret.length >= 16,
    secret,
    tokens,
  };
}
