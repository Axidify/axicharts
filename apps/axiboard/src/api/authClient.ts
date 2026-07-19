export type AuthMeResponse = {
  ok: boolean;
  enabled: boolean;
  userId: string | null;
  authenticated: boolean;
  error?: string;
};

const fetchOptions: RequestInit = {
  credentials: "include",
};

export async function fetchAuthMe(): Promise<AuthMeResponse> {
  const response = await fetch("/api/auth/me", fetchOptions);
  return (await response.json()) as AuthMeResponse;
}

export async function loginWithToken(token: string): Promise<string> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  });
  const payload = (await response.json()) as { ok: boolean; userId?: string; error?: string };
  if (!response.ok || !payload.ok || !payload.userId) {
    throw new Error(payload.error ?? "Login failed");
  }
  return payload.userId;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}
