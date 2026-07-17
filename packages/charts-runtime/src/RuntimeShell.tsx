"use client";

import type { ReactElement, ReactNode } from "react";
import { StaleBadge, useIsStale } from "@axicharts/charts";
import type { ConnectionState } from "./types";

export type RuntimeShellProps = {
  children: ReactNode;
  connection: ConnectionState;
  lastUpdatedAt?: number;
  staleAfterMs?: number;
  error?: string;
  live?: boolean;
};

export function RuntimeShell({
  children,
  connection,
  lastUpdatedAt,
  staleAfterMs,
  error,
  live = false,
}: RuntimeShellProps): ReactElement {
  const isStale = useIsStale(
    lastUpdatedAt,
    staleAfterMs,
    live && connection === "ready",
  );

  return (
    <div
      className="axicharts-runtime"
      style={{ position: "relative", width: "100%" }}
    >
      {children}
      {error && connection === "error" ? (
        <div
          role="alert"
          style={{
            marginTop: 8,
            padding: "8px 10px",
            borderRadius: 6,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontSize: 12,
          }}
        >
          {error}
        </div>
      ) : null}
      {isStale ? (
        <div style={{ position: "absolute", top: 8, right: 8, zIndex: 4 }}>
          <StaleBadge />
        </div>
      ) : null}
    </div>
  );
}
