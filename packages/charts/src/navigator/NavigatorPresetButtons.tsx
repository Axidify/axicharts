"use client";

import { useCallback, useId, useRef, type KeyboardEvent, type ReactElement } from "react";
import type { ChartTheme } from "@axicharts/charts-theme";
import { isDarkChartTheme } from "@axicharts/charts-canvas";
import type { NavigatorPreset } from "./navigatorPresets";

export const NAVIGATOR_PRESETS_HEIGHT = 28;

export type NavigatorPresetButtonsProps = {
  presets: NavigatorPreset[];
  active: NavigatorPreset | null;
  onSelect: (preset: NavigatorPreset) => void;
  theme: ChartTheme;
  /** DOM id of the linked range overview strip (aria-controls). */
  overviewId?: string;
};

export function NavigatorPresetButtons({
  presets,
  active,
  onSelect,
  theme,
  overviewId,
}: NavigatorPresetButtonsProps): ReactElement {
  const dark = isDarkChartTheme(theme.name);
  const groupId = useId();
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusPreset = useCallback(
    (index: number) => {
      const button = buttonRefs.current[index];
      button?.focus();
      const preset = presets[index];
      if (preset) onSelect(preset);
    },
    [onSelect, presets],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (presets.length === 0) return;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        focusPreset((index + 1) % presets.length);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        focusPreset((index - 1 + presets.length) % presets.length);
      } else if (event.key === "Home") {
        event.preventDefault();
        focusPreset(0);
      } else if (event.key === "End") {
        event.preventDefault();
        focusPreset(presets.length - 1);
      }
    },
    [focusPreset, presets.length],
  );

  return (
    <div
      role="radiogroup"
      aria-label="Range presets"
      id={groupId}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 4,
        height: NAVIGATOR_PRESETS_HEIGHT,
        padding: "0 6px",
      }}
    >
      {presets.map((preset, index) => {
        const selected = active === preset;
        return (
          <button
            key={preset}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-controls={overviewId}
            tabIndex={selected || (active == null && index === 0) ? 0 : -1}
            onClick={() => onSelect(preset)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            style={{
              border: `1px solid ${
                selected
                  ? dark
                    ? "#60a5fa"
                    : "#3b82f6"
                  : dark
                    ? "#334155"
                    : "#e2e8f0"
              }`,
              borderRadius: 999,
              background: selected
                ? dark
                  ? "rgba(59, 130, 246, 0.22)"
                  : "rgba(59, 130, 246, 0.12)"
                : "transparent",
              color: selected
                ? dark
                  ? "#f8fafc"
                  : "#1e3a8a"
                : dark
                  ? "#94a3b8"
                  : "#64748b",
              fontSize: 10,
              fontWeight: 600,
              lineHeight: 1,
              padding: "5px 10px",
              cursor: "pointer",
              fontFamily: "inherit",
              outline: "none",
              boxShadow: selected
                ? dark
                  ? "0 0 0 1px rgba(96, 165, 250, 0.35)"
                  : "0 0 0 1px rgba(59, 130, 246, 0.25)"
                : undefined,
            }}
          >
            {preset}
          </button>
        );
      })}
    </div>
  );
}
