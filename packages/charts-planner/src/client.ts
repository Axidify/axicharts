import type { DashboardPlan, PlannerRequest } from "./types";
import { planFromIntent, planFromProfile } from "./plan";

export type PlannerHealth = {
  ok: boolean;
  provider?: string;
};

export type RequestDashboardPlanOptions = PlannerRequest & {
  serverUrl?: string;
};

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

export async function fetchPlannerHealth(serverUrl: string): Promise<PlannerHealth> {
  const response = await fetch(`${normalizeBaseUrl(serverUrl)}/health`);
  if (!response.ok) {
    return { ok: false };
  }
  const payload = (await response.json()) as Partial<PlannerHealth>;
  return { ok: payload.ok === true, provider: payload.provider };
}

export async function requestDashboardPlan(
  options: RequestDashboardPlanOptions,
): Promise<DashboardPlan> {
  const { profile, intent, serverUrl } = options;
  const trimmed = intent?.trim();

  if (!serverUrl) {
    return trimmed ? planFromIntent(profile, trimmed) : planFromProfile(profile);
  }

  try {
    const response = await fetch(`${normalizeBaseUrl(serverUrl)}/plan`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profile, intent: trimmed }),
    });
    if (!response.ok) {
      throw new Error(`Planner HTTP ${response.status}`);
    }
    const plan = (await response.json()) as DashboardPlan;
    return plan;
  } catch (error) {
    if (!trimmed) {
      throw error;
    }
    const fallback = planFromIntent(profile, trimmed);
    const message = error instanceof Error ? error.message : String(error);
    return {
      ...fallback,
      warnings: [
        ...(fallback.warnings ?? []),
        `Planner server failed (${message}). Used local rules.`,
      ],
    };
  }
}
