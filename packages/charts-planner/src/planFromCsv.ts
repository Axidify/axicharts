import {
  enrichProfileWithDomain,
  fieldProfilesToDataProfile,
  inferFieldRoles,
  parseTabular,
  type DataProfile,
  type DomainSemantics,
} from "@axicharts/charts-spec";
import { planFromIntent } from "./plan";
import type { DashboardPlan } from "./types";

export type PlanFromCsvOptions = {
  intent?: string;
};

/**
 * C152 — one-shot CSV/text → DataProfile → DashboardPlan.
 * C155 — tags metrics with data-inferred vertical when confident.
 */
export function planFromCsv(text: string, options: PlanFromCsvOptions = {}): DashboardPlan {
  const rows = parseTabular(text);
  const intent = options.intent ?? "Static CSV snapshot batch report";
  const fieldProfiles = inferFieldRoles(rows);
  const { profile } = enrichProfileWithDomain({
    ...fieldProfilesToDataProfile(fieldProfiles),
    fieldProfiles,
  });
  return planFromIntent(profile, intent);
}

export function profileFromCsv(text: string): DataProfile & { domain: DomainSemantics } {
  const rows = parseTabular(text);
  const fieldProfiles = inferFieldRoles(rows);
  const { profile, domain } = enrichProfileWithDomain({
    ...fieldProfilesToDataProfile(fieldProfiles),
    fieldProfiles,
  });
  return { ...profile, domain };
}
