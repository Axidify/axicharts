export type MosaicPresetId =
  | "ops-finance"
  | "ops-overview"
  | "trading-program"
  | "command-center";

export type MosaicPresetMeta = {
  id: MosaicPresetId;
  label: string;
  description: string;
};

const PRESETS: MosaicPresetMeta[] = [
  {
    id: "ops-finance",
    label: "Ops + finance",
    description: "Line 3 telemetry with shift P&L",
  },
  {
    id: "ops-overview",
    label: "Ops + overview",
    description: "2×2 wall with throughput KPI trend",
  },
  {
    id: "trading-program",
    label: "Trading + program",
    description: "Blotter desk beside sprint command center",
  },
  {
    id: "command-center",
    label: "Command center",
    description: "Ops wall with resource capacity grid",
  },
];

export function listMosaicPresets(): MosaicPresetMeta[] {
  return [...PRESETS];
}
