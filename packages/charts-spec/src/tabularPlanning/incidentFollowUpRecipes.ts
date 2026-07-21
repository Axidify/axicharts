import type { FieldProfile } from "../types";
import type { PanelRecipe } from "./recipes/types";
import { findNamedField } from "./enrich/types";

const CLOSED_STATUS = /closed|resolved|done/i;

function tableRecipe(
  questionId: string,
  title: string,
  rows: Record<string, unknown>[],
  fieldProfiles: FieldProfile[],
): PanelRecipe {
  return {
    questionId,
    title,
    intent: "filtered incident table",
    panelType: "table",
    vertical: "ops",
    preparedRows: rows,
    tableColumns: fieldProfiles.map((profile) => ({
      key: profile.name,
      label: profile.name,
      align: profile.role === "measure" ? "right" : "left",
    })),
  };
}

/**
 * C181 — incident-shaped refinement intents (open tickets, priority filter).
 */
export function incidentRecipesFromFollowUp(
  intent: string,
  rows: Record<string, unknown>[],
  fieldProfiles: FieldProfile[],
): PanelRecipe[] {
  const lower = intent.toLowerCase();
  const statusField = findNamedField(fieldProfiles, /status/i);
  const priorityField = findNamedField(fieldProfiles, /priority|severity/i);
  const recipes: PanelRecipe[] = [];

  if (
    statusField &&
    (/\bopen\b|in progress|active|unresolved/i.test(lower) || /show open/i.test(lower)) &&
    !/closed|resolved/i.test(lower)
  ) {
    const filtered = rows.filter((row) => !CLOSED_STATUS.test(String(row[statusField] ?? "")));
    recipes.push(
      tableRecipe("agent.incident.followup.open_table", "Open tickets", filtered, fieldProfiles),
    );
  }

  if (priorityField && /critical|high priority|escalat/i.test(lower)) {
    const filtered = rows.filter((row) =>
      /critical|high/i.test(String(row[priorityField] ?? "")),
    );
    recipes.push(
      tableRecipe(
        "agent.incident.followup.priority_table",
        "Critical / High priority",
        filtered,
        fieldProfiles,
      ),
    );
  }

  return recipes;
}
