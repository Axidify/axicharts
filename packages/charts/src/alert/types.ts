export type AlertSeverity = "normal" | "warning" | "alarm" | "critical";

export type AlertSurface = "dark" | "light";

export type AlertItem = {
  id: string;
  message: string;
  severity?: AlertSeverity;
  acknowledged?: boolean;
  shelved?: boolean;
  timestamp?: number;
  tag?: string;
  metric?: string;
};
