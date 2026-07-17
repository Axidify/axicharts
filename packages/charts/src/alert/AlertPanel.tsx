import type { CSSProperties, ReactElement } from "react";
import type { AlertItem, AlertSeverity, AlertSurface } from "./types";

const SEVERITY_STYLES: Record<
  AlertSurface,
  Record<AlertSeverity, { background: string; border: string; color: string }>
> = {
  dark: {
    normal: { background: "#172554", border: "#1d4ed8", color: "#bfdbfe" },
    warning: { background: "#422006", border: "#b45309", color: "#fde68a" },
    alarm: { background: "#431407", border: "#c2410c", color: "#fdba74" },
    critical: { background: "#450a0a", border: "#b91c1c", color: "#fecaca" },
  },
  light: {
    normal: { background: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
    warning: { background: "#fffbeb", border: "#fde68a", color: "#b45309" },
    alarm: { background: "#fff7ed", border: "#fdba74", color: "#c2410c" },
    critical: { background: "#fef2f2", border: "#fecaca", color: "#b91c1c" },
  },
};

const buttonStyle: CSSProperties = {
  fontSize: 11,
  padding: "4px 8px",
  borderRadius: 4,
  border: "1px solid transparent",
  cursor: "pointer",
  fontWeight: 600,
};

export type AlertPanelProps = {
  alarms: AlertItem[];
  surface?: AlertSurface;
  title?: string;
  onAck?: (id: string) => void;
  onShelve?: (id: string) => void;
  style?: CSSProperties;
};

function formatTimestamp(value?: number): string | null {
  if (value == null) return null;
  return new Date(value).toLocaleTimeString();
}

export function AlertPanel({
  alarms,
  surface = "dark",
  title = "Active alarms",
  onAck,
  onShelve,
  style,
}: AlertPanelProps): ReactElement | null {
  const active = alarms.filter((alarm) => !alarm.acknowledged && !alarm.shelved);
  if (!active.length) return null;

  const muted = surface === "dark" ? "#94a3b8" : "#64748b";
  const actionBorder = surface === "dark" ? "#475569" : "#cbd5e1";
  const actionColor = surface === "dark" ? "#e2e8f0" : "#0f172a";

  return (
    <section
      role="region"
      aria-label={title}
      style={{
        display: "grid",
        gap: 8,
        ...style,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: muted,
        }}
      >
        {title}
      </div>
      {active.map((alarm) => {
        const severity = alarm.severity ?? "warning";
        const palette = SEVERITY_STYLES[surface][severity];
        const timestamp = formatTimestamp(alarm.timestamp);

        return (
          <div
            key={alarm.id}
            role="alert"
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${palette.border}`,
              background: palette.background,
              color: palette.color,
              fontSize: 12,
              display: "grid",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{alarm.message}</div>
                <div style={{ marginTop: 4, fontSize: 11, color: muted }}>
                  {[alarm.tag, timestamp].filter(Boolean).join(" · ")}
                </div>
              </div>
              <span style={{ textTransform: "uppercase", fontWeight: 700, fontSize: 10 }}>
                {severity}
              </span>
            </div>
            {onAck || onShelve ? (
              <div style={{ display: "flex", gap: 8 }}>
                {onAck ? (
                  <button
                    type="button"
                    onClick={() => onAck(alarm.id)}
                    style={{
                      ...buttonStyle,
                      borderColor: actionBorder,
                      background: "transparent",
                      color: actionColor,
                    }}
                  >
                    Ack
                  </button>
                ) : null}
                {onShelve ? (
                  <button
                    type="button"
                    onClick={() => onShelve(alarm.id)}
                    style={{
                      ...buttonStyle,
                      borderColor: actionBorder,
                      background: "transparent",
                      color: actionColor,
                    }}
                  >
                    Shelve
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
