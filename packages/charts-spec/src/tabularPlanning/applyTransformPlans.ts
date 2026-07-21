import type { AggregateRowsOptions } from "../aggregateRows";
import { classifyTabularDomain } from "../classifyTabularDomain";
import { executeTransform } from "../executeTransform";
import { fieldProfilesToDataProfile, inferFieldRoles } from "../inferFieldRoles";
import type { TabularVerticalId } from "../classifyTabularDomain";
import type { VerticalId } from "../rulePacks/types";
import type { DataProfile, PanelSpec } from "../types";
import type { ValidationIssue } from "../validatePanel";
import { validatePanel } from "../validatePanel";
import { recipesFromFollowUp } from "./followUpRecipes";
import { ALL_TABULAR_QUESTIONS, questionsForVertical } from "./catalogs";
import { compileRecipe } from "./recipes/compileRecipe";
import type { PanelRecipe } from "./recipes/types";
import { questionToRecipe } from "./recipes/questionToRecipe";
import { findQuestionsForIntent } from "./rankQuestions";
import type { Persona } from "./types";

export type TransformPlan = {
  /** Natural-language analytic intent (maps to catalog question). */
  intent: string;
  questionId?: string;
  title?: string;
  /** Optional row transform before recipe compile (C174 aggregateRows). */
  transform?: AggregateRowsOptions;
};

export type AppliedTransformPlan = {
  plan: TransformPlan;
  panel: PanelSpec;
  rows: Record<string, unknown>[];
  ok: boolean;
  issues: ValidationIssue[];
};

function recipesForIntent(
  intent: string,
  rows: Record<string, unknown>[],
  fieldProfiles: ReturnType<typeof inferFieldRoles>,
  dataProfile: DataProfile,
  vertical: TabularVerticalId,
  questionId?: string,
): PanelRecipe[] {
  const pool =
    vertical === "generic" ? ALL_TABULAR_QUESTIONS : questionsForVertical(vertical as VerticalId);

  if (questionId) {
    const question = pool.find((entry) => entry.id === questionId);
    if (question) {
      const recipe = questionToRecipe(question, fieldProfiles, dataProfile);
      if (recipe) return [recipe];
    }
  }

  if (vertical !== "generic") {
    const matches = findQuestionsForIntent(intent, vertical as VerticalId);
    for (const question of matches) {
      const recipe = questionToRecipe(question, fieldProfiles, dataProfile);
      if (recipe) return [recipe];
    }
  }
  return recipesFromFollowUp(intent, rows, fieldProfiles);
}

/**
 * C178 — compile LLM-structured transform plans through the same validate loop as rules.
 */
export function applyTransformPlans(
  sourceRows: Record<string, unknown>[],
  plans: TransformPlan[],
  options: {
    dataProfile?: DataProfile;
    persona?: Persona;
    vertical?: TabularVerticalId;
  } = {},
): AppliedTransformPlan[] {
  if (plans.length === 0) return [];

  const fieldProfiles = inferFieldRoles(sourceRows);
  const dataProfile = options.dataProfile ?? fieldProfilesToDataProfile(fieldProfiles);
  const vertical =
    options.vertical ?? classifyTabularDomain({ rows: sourceRows }).vertical;
  const results: AppliedTransformPlan[] = [];

  for (const plan of plans) {
    const intent = plan.intent?.trim();
    if (!intent) continue;

    const workingRows = plan.transform
      ? executeTransform(sourceRows, plan.transform)
      : sourceRows;

    const recipes = recipesForIntent(
      intent,
      workingRows,
      fieldProfiles,
      dataProfile,
      vertical,
      plan.questionId,
    );
    const recipe = recipes[0];
    if (!recipe) {
      results.push({
        plan,
        panel: { type: "cartesian", title: plan.title ?? intent },
        rows: workingRows,
        ok: false,
        issues: [
          {
            code: "NO_CATALOG_MATCH",
            path: "intent",
            message: `No recipe matched intent "${intent}"`,
            severity: "error",
          },
        ],
      });
      continue;
    }

    if (plan.title) recipe.title = plan.title;
    if (plan.questionId) recipe.questionId = plan.questionId;

    const compiled = compileRecipe(recipe, workingRows, { dataProfile });
    const validation = validatePanel(compiled.panel, {
      rows: compiled.rows,
      dataProfile,
      strict: compiled.panel.type === "cartesian" || compiled.panel.type === "distribution" || compiled.panel.type === "matrix",
    });

    results.push({
      plan,
      panel: compiled.panel,
      rows: compiled.rows,
      ok: validation.ok,
      issues: validation.ok ? validation.warnings : validation.errors,
    });
  }

  return results;
}

export function transformPlanIntents(plans: TransformPlan[]): string[] {
  return plans.map((plan) => plan.intent.trim()).filter(Boolean);
}
