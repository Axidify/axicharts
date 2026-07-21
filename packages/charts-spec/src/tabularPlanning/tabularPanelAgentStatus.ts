import type { DataProfile, PanelSpec } from "../types";
import { resolvePanelFamily, type PanelFamily } from "../resolvePanelFamily";
import { validatePanel, type ValidationIssue } from "../validatePanel";

export type TabularPanelAgentStatus = {
  status: "ok" | "needs_review" | "validated";
  notes: string;
  validationIssues: ValidationIssue[];
};

const WIDGET_TYPES = new Set(["stat", "table", "markdown", "text", "navigator"]);

function tier2PanelStatus(panel: PanelSpec, family: PanelFamily): TabularPanelAgentStatus {
  return {
    status: "needs_review",
    notes: `panel: ${panel.type} · Tier-2 chart (no agent grammar yet)`,
    validationIssues: [
      {
        code: "TIER2_PANEL",
        path: "type",
        message: `Panel type "${panel.type}" is Tier-2 — not agent grammar`,
        suggestion: "Use cartesian or distribution family until this chart type ships",
        severity: "error",
        family,
      },
    ],
  };
}

/**
 * Classify agent-safety for a tabular dashboard panel (RFC-004).
 * Cartesian and distribution panels must pass `validatePanel`; Tier-2 charts get `needs_review`.
 */
export function classifyTabularPanelAgentStatus(
  panel: PanelSpec,
  rows: Record<string, unknown>[],
  dataProfile?: DataProfile,
): TabularPanelAgentStatus {
  if (WIDGET_TYPES.has(panel.type)) {
    const rowNote =
      panel.type === "table" ? `${rows.length} rows · ` : "";
    return {
      status: "ok",
      notes: `${rowNote}widget panel — ${panel.type} (not agent grammar)`,
      validationIssues: [],
    };
  }

  const family = resolvePanelFamily(panel);

  if (family === "legacy") {
    return tier2PanelStatus(panel, family);
  }

  if (family === "matrix") {
    return tier2PanelStatus(panel, family);
  }

  const result = validatePanel(panel, { rows, dataProfile, strict: true });

  if (family === "cartesian") {
    if (!result.ok) {
      return {
        status: "needs_review",
        notes: `panel: cartesian · errors: ${result.errors.map((issue) => issue.code).join(", ")}`,
        validationIssues: result.errors,
      };
    }
    return {
      status: "validated",
      notes:
        result.warnings.length > 0
          ? `panel: cartesian · warnings: ${result.warnings.length}`
          : "panel: cartesian",
      validationIssues: result.warnings,
    };
  }

  if (family === "distribution") {
    if (!result.ok) {
      return {
        status: "needs_review",
        notes: `panel: distribution · errors: ${result.errors.map((issue) => issue.code).join(", ")}`,
        validationIssues: result.errors,
      };
    }
    return {
      status: "validated",
      notes:
        result.warnings.length > 0
          ? `panel: distribution · warnings: ${result.warnings.length}`
          : "panel: distribution",
      validationIssues: result.warnings,
    };
  }

  const code = result.errors[0]?.code ?? "NOT_AGENT_SAFE";
  return {
    status: "needs_review",
    notes: `panel: ${panel.type} · ${code}`,
    validationIssues: result.errors,
  };
}
