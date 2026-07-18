import type { SeriesTone } from "./types";

export type WordCloudWord = {
  text: string;
  value: number;
  tone?: SeriesTone;
  color?: string;
};
