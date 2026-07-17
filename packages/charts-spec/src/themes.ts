import {
  cleanTheme,
  industrialTheme,
  liveTheme,
  presentationTheme,
  type ChartTheme,
} from "@axicharts/charts-theme";
import type { ThemeName } from "./types";

const THEMES: Record<ThemeName, ChartTheme> = {
  clean: cleanTheme,
  live: liveTheme,
  industrial: industrialTheme,
  presentation: presentationTheme,
};

export function resolveTheme(name: ThemeName = "clean"): ChartTheme {
  return THEMES[name];
}
