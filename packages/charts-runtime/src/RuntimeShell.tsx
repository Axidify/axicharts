"use client";

import type { ReactElement, ReactNode } from "react";
import { StaleBadge, useIsStale } from "@axicharts/charts";
import { AlarmBanner } from "./AlarmBanner";
import { useAlarmState } from "./useAlarmState";
import type { AlarmItem, ConnectionState } from "./types";

export type RuntimeShellProps = {
  children: ReactNode;
  connection: ConnectionState;
  lastUpdatedAt?: number;
  staleAfterMs?: number;
  error?: string;
  live?: boolean;
  alarms?: AlarmItem[];
  interactiveAlarms?: boolean;
  alarmSurface?: "dark" | "light";
  alarmScopeId?: string;
  alarmStorage?: Pick<Storage, "getItem" | "setItem">;
};

export function RuntimeShell({
  children,
  connection,
  lastUpdatedAt,
  staleAfterMs,
  error,
  live = false,
  alarms: initialAlarms = [],
  interactiveAlarms = false,
  alarmSurface = "light",
  alarmScopeId,
  alarmStorage,
}: RuntimeShellProps): ReactElement {
  const isStale = useIsStale(
    lastUpdatedAt,
    staleAfterMs,
    live && connection === "ready",
  );
  const managed = useAlarmState(initialAlarms, {
    scopeId: interactiveAlarms ? alarmScopeId : undefined,
    storage: interactiveAlarms ? alarmStorage : undefined,
  });
  const alarms = interactiveAlarms ? managed.alarms : initialAlarms;

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
      <AlarmBanner
        alarms={alarms}
        surface={alarmSurface}
        onAck={interactiveAlarms ? managed.ack : undefined}
        onShelve={interactiveAlarms ? managed.shelve : undefined}
      />
    </div>
  );
}
