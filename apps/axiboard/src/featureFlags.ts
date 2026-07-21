/**
 * M1 chat-first demo uses tabular orchestrator only (`planDashboardFromRows`).
 * Profile planner (`planFromIntent` / charts-planner server) is legacy — Tier-2 panel types.
 *
 * Set `VITE_ENABLE_PROFILE_PLANNER=true` to show Plan UI in workspace mode (R&D / Storybook parity).
 */
export const PROFILE_PLANNER_ENABLED =
  import.meta.env.VITE_ENABLE_PROFILE_PLANNER === "true";
