"use client";

import type { ReactElement } from "react";
import type { ChartTheme } from "@axicharts/charts-theme";
import { isDarkChartTheme } from "@axicharts/charts-canvas";
import type { NavigatorPreset } from "./navigatorPresets";

export const NAVIGATOR_PRESETS_HEIGHT = 26;

export type NavigatorPresetButtonsProps = {
  presets: NavigatorPreset[];
  active: NavigatorPreset | null;
  onSelect: (preset: NavigatorPreset) => void;
  theme: ChartTheme;
};

export function NavigatorPresetButtons({
  presets,
  active,
  onSelect,
  theme,
}: NavigatorPresetButtonsProps): ReactElement {
  const dark = isDarkChartTheme(theme.name);

  return (
    <div
      role="toolbar"
      aria-label="Range presets"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 4,
        height: NAVIGATOR_PRESETS_HEIGHT,
        padding: "0 4px",
      }}
    >
      {presets.map((preset) => {
        const selected = active === preset;
        return (
          <button
            key={preset}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(preset)}
            style={{
              border: `1px solid ${selected ? (dark ? "#64748b" : "#94a3b8") : (dark ? "#334155" : "#e2e8f0")}`,
              borderRadius: 999,
              background: selected
                ? dark
                  ? "#334155"
                  : "#f1f5f9"
                : "transparent",
              color: selected
                ? dark
                  ? "#f8fafc"
                  : "#0f172a"
                : dark
                  ? "#94a3b8"
                  : "#64748b",
              fontSize: 10,
              fontWeight: 600,
              lineHeight: 1,
              padding: "4px 8px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {preset}
          </button>
        );
      })}
    </div>
  );
}
