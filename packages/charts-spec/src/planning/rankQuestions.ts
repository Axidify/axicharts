import type { FieldProfile } from "../types";
import type { VerticalId } from "../rulePacks/types";
import { ALL_TABULAR_QUESTIONS, questionsForVertical } from "./catalogs";
import { resolvePersona } from "./inferPersona";
import type {
  AnalyticalQuestion,
  Persona,
  QuestionRequires,
  RankedQuestion,
  RankQuestionsInput,
  RankQuestionsResult,
} from "./types";

const PERSONA_BOOST = 12;
const PERSONA_PARTIAL_BOOST = 4;
const DEDUP_PENALTY = 6;

function fieldMatchesPattern(fieldProfiles: FieldProfile[], pattern?: RegExp): boolean {
  if (!pattern) return true;
  return fieldProfiles.some((profile) => pattern.test(profile.name));
}

function countMeasures(fieldProfiles: FieldProfile[]): number {
  return fieldProfiles.filter((profile) => profile.role === "measure").length;
}

function meetsRequirements(
  question: AnalyticalQuestion,
  fieldProfiles: FieldProfile[],
): boolean {
  const requires: QuestionRequires | undefined = question.requires;
  if (!requires) return true;

  if (requires.timeField && !fieldProfiles.some((profile) => profile.role === "time")) {
    return false;
  }
  if (!fieldMatchesPattern(fieldProfiles, requires.dimensionPattern)) return false;
  if (!fieldMatchesPattern(fieldProfiles, requires.measurePattern)) return false;
  if (requires.minMeasures != null && countMeasures(fieldProfiles) < requires.minMeasures) {
    return false;
  }
  return true;
}

function scoreQuestion(question: AnalyticalQuestion, persona: Persona): RankedQuestion {
  const reasons: string[] = [`base:${question.basePriority}`];
  let score = question.basePriority;

  if (question.personas.includes(persona)) {
    score += PERSONA_BOOST;
    reasons.push(`persona:${persona}`);
  } else if (question.personas.includes("manager")) {
    score += PERSONA_PARTIAL_BOOST;
    reasons.push("persona:manager-fallback");
  }

  return { question, score, reasons };
}

function catalogForDomain(vertical: VerticalId | "generic"): AnalyticalQuestion[] {
  if (vertical === "generic") return ALL_TABULAR_QUESTIONS;
  return questionsForVertical(vertical);
}

/**
 * C156 — rank analytical questions for a tabular profile + domain + persona.
 */
export function rankQuestions(input: RankQuestionsInput): RankQuestionsResult {
  const persona = resolvePersona(input.context);
  const kinds = input.kinds;
  const limit = input.limit ?? 8;
  const catalog = catalogForDomain(input.domain.vertical);
  const seenDimensions = new Set<string>();

  const candidates = catalog
    .filter((question) => kinds == null || kinds.includes(question.kind))
    .filter((question) => meetsRequirements(question, input.fieldProfiles))
    .map((question) => scoreQuestion(question, persona))
    .sort((a, b) => b.score - a.score);

  const ranked: RankedQuestion[] = [];

  for (const entry of candidates) {
    const dimensionKey = entry.question.dimensionKey;
    if (dimensionKey && seenDimensions.has(dimensionKey)) {
      entry.score -= DEDUP_PENALTY;
      entry.reasons.push(`dedup:${dimensionKey}`);
    }
    ranked.push(entry);
    if (dimensionKey) seenDimensions.add(dimensionKey);
  }

  ranked.sort((a, b) => b.score - a.score);

  return {
    persona,
    domain: input.domain,
    ranked: ranked.slice(0, limit),
  };
}

/**
 * Match NL follow-up text to catalog questions for a vertical.
 */
export function findQuestionsForIntent(
  intent: string,
  vertical: VerticalId,
): AnalyticalQuestion[] {
  const lower = intent.toLowerCase().trim();
  if (!lower) return [];

  return questionsForVertical(vertical).filter((question) => {
    if (question.matchPatterns?.some((pattern) => pattern.test(lower))) return true;
    if (question.text.toLowerCase().includes(lower)) return true;
    if (question.id.replace(/\./g, " ").includes(lower)) return true;
    return false;
  });
}
