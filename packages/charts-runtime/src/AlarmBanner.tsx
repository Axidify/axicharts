"use client";

import type { ReactElement } from "react";
import type { AlarmItem, AlarmSeverity } from "./types";

const SEVERITY_STYLES: Record<
  AlarmSeverity,
  { background: string; border: string; color: string }
> = {
  normal: { background: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
  warning: { background: "#fffbeb", border: "#fde68a", color: "#b45309" },
  alarm: { background: "#fff7ed", border: "#fdba74", color: "#c2410c" },
  critical: { background: "#fef2f2", border: "#fecaca", color: "#b91c1c" },
};

export type AlarmBannerProps = {
  alarms: AlarmItem[];
};

export function AlarmBanner({ alarms }: AlarmBannerProps): ReactElement | null {
  const active = alarms.filter((alarm) => !alarm.acknowledged);
  if (!active.length) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "grid",
        gap: 6,
        marginTop: 12,
      }}
    >
      {active.map((alarm) => {
        const severity = alarm.severity ?? "warning";
        const palette = SEVERITY_STYLES[severity];
        return (
          <div
            key={alarm.id}
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: `1px solid ${palette.border}`,
              background: palette.background,
              color: palette.color,
              fontSize: 12,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span>{alarm.message}</span>
            <span style={{ textTransform: "uppercase", fontWeight: 600 }}>{severity}</span>
          </div>
        );
      })}
    </div>
  );
}
