import { useCallback, useEffect, useState, type ReactElement, type ReactNode } from "react";
import { fetchAuthMe, loginWithToken } from "./api/authClient";

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#0f172a",
  color: "#e2e8f0",
  fontSize: 13,
} as const;

const buttonStyle = {
  fontSize: 13,
  padding: "8px 14px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#1e293b",
  color: "#e2e8f0",
  cursor: "pointer",
} as const;

export function AuthGate({ children }: { children: ReactNode }): ReactElement {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [authenticated, setAuthenticated] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await fetchAuthMe();
      setEnabled(me.enabled);
      setAuthenticated(me.authenticated);
      setUserId(me.userId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Auth check failed");
      setEnabled(false);
      setAuthenticated(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleLogin = async () => {
    setError(null);
    try {
      const id = await loginWithToken(token.trim());
      setUserId(id);
      setAuthenticated(true);
      setToken("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Login failed");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 32, color: "#94a3b8", fontSize: 14 }}>Checking authentication…</div>
    );
  }

  if (!enabled || authenticated) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#0b1220",
        color: "#e2e8f0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          padding: 24,
          borderRadius: 12,
          border: "1px solid #334155",
          background: "#111827",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Sign in to Axiboard</div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
          Enter your access token. Set <code>AXIBOARD_AUTH_TOKENS</code> on the server.
        </div>
        <input
          type="password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Access token"
          style={inputStyle}
        />
        {error ? <div style={{ marginTop: 10, fontSize: 12, color: "#f87171" }}>{error}</div> : null}
        <button type="button" onClick={() => void handleLogin()} style={{ ...buttonStyle, marginTop: 16 }}>
          Sign in
        </button>
        {userId ? (
          <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>Signed in as {userId}</div>
        ) : null}
      </div>
    </div>
  );
}
