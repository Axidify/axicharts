"use client";

import type { ReactElement } from "react";
import { compilePanel } from "./compilePanel";
import { compileDashboard } from "./templates";
import { asRows } from "./data";
import { resolvePanelFamily } from "./resolvePanelFamily";
import { assertValidPanel, PanelValidationError } from "./validatePanel";
import type {
  ChartMode,
  DashboardSpec,
  PanelSpec,
  SpecData,
  ThemeName,
} from "./types";

export type ChartProps = {
  panel: PanelSpec;
  data: SpecData;
  theme?: ThemeName;
  mode?: ChartMode;
  height?: number;
  width?: number | string;
  /** Skip cartesian grammar validation (default false). */
  skipValidation?: boolean;
};

function PanelValidationFallback({
  error,
}: {
  error: PanelValidationError;
}): ReactElement {
  const first = error.errors[0];
  return (
    <div
      role="alert"
      style={{
        padding: 12,
        borderRadius: 8,
        border: "1px solid #fecaca",
        background: "#fef2f2",
        color: "#991b1b",
        fontSize: 12,
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Panel validation failed</div>
      <div>{first?.message ?? error.message}</div>
      {first?.suggestion ? (
        <div style={{ marginTop: 4, color: "#b91c1c" }}>
          Suggestion: <code>{first.suggestion}</code>
        </div>
      ) : null}
    </div>
  );
}

export function Chart({
  panel,
  data,
  theme,
  mode,
  height,
  width,
  skipValidation = false,
}: ChartProps): ReactElement {
  let resolvedPanel = panel;

  if (!skipValidation) {
    const family = resolvePanelFamily(panel);
    if (family === "cartesian" || family === "distribution") {
      try {
        const validated = assertValidPanel(panel, { rows: asRows(data) });
        resolvedPanel = validated.spec;
      } catch (error) {
        if (error instanceof PanelValidationError) {
          return <PanelValidationFallback error={error} />;
        }
        throw error;
      }
    }
  }

  return compilePanel(resolvedPanel, data, {
    theme,
    mode,
    height,
    width,
    validateCartesian: false,
  });
}

export type DashboardProps = DashboardSpec;

export function Dashboard(spec: DashboardProps): ReactElement {
  return compileDashboard(spec);
}
