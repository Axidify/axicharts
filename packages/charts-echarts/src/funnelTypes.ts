import type { SeriesTone } from "./types";

export type FunnelStage = {
  name: string;
  value: number;
  key?: string;
  color?: string;
  tone?: SeriesTone;
};
