import { isCompactTile } from "./themeBridge";

export type FunnelLayout = {
  compact: boolean;
  labelFontSize: number;
  gap: number;
  inset: { left: string; width: string; top: number; bottom: number };
  minSize: string;
};

export function resolveFunnelLayout(width: number, height: number): FunnelLayout {
  const compact = isCompactTile(width, height);

  return {
    compact,
    labelFontSize: compact ? 9 : 11,
    gap: compact ? 2 : 4,
    inset: compact
      ? { left: "4%", width: "92%", top: 8, bottom: 8 }
      : { left: "8%", width: "84%", top: 16, bottom: 16 },
    minSize: compact ? "16%" : "12%",
  };
}
