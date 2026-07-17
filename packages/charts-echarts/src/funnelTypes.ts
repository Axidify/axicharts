import type { SeriesTone } from "./types";

export type FunnelStage = {
  name: string;
  value: number;
  tone?: SeriesTone;
};
