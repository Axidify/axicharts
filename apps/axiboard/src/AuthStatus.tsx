import { useCallback, useEffect, useState, type ReactElement } from "react";
import { fetchAuthMe, logout } from "./api/authClient";

const buttonStyle = {
  fontSize: 12,
  padding: "4px 10px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#1e293b",
  color: "#e2e8f0",
  cursor: "pointer",
} as const;

export function AuthStatus(): ReactElement | null {
  const [enabled, setEnabled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const me = await fetchAuthMe();
    setEnabled(me.enabled);
    setUserId(me.authenticated ? me.userId : null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!enabled || !userId) return null;

  return (
    <div style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 12 }}>
      <span style={{ color: "#94a3b8" }}>{userId}</span>
      <button
        type="button"
        style={buttonStyle}
        onClick={() => {
          void logout().then(() => window.location.reload());
        }}
      >
        Sign out
      </button>
    </div>
  );
}
