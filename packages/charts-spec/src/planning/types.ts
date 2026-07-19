import type { DataProfile, FieldProfile } from "../types";
import type { DomainSemantics } from "../classifyTabularDomain";
import type { VerticalId } from "../rulePacks/types";

export type Persona = "executive" | "manager" | "analyst" | "operator";

export type PlanningContext = {
  persona?: Persona;
  intent?: string;
};

export type QuestionRequires = {
  timeField?: boolean;
  dimensionPattern?: RegExp;
  measurePattern?: RegExp;
  minMeasures?: number;
};

export type AnalyticalQuestion = {
  id: string;
  text: string;
  /** Compiler intent passed to createCartesianPanel / interpreters. */
  intent: string;
  verticals: VerticalId[];
  personas: Persona[];
  basePriority: number;
  kind: "kpi" | "chart" | "table";
  /** Dedup key — e.g. "stage", "department". */
  dimensionKey?: string;
  matchPatterns?: RegExp[];
  requires?: QuestionRequires;
};

export type RankedQuestion = {
  question: AnalyticalQuestion;
  score: number;
  reasons: string[];
};

export type RankQuestionsInput = {
  fieldProfiles: FieldProfile[];
  domain: DomainSemantics;
  context?: PlanningContext;
  kinds?: AnalyticalQuestion["kind"][];
  limit?: number;
  /** C165 — grain, cardinalities, and time span for ranking tweaks. */
  dataProfile?: Pick<DataProfile, "grain" | "timeSpan" | "cardinalities">;
};

export type RankQuestionsResult = {
  persona: Persona;
  ranked: RankedQuestion[];
  domain: DomainSemantics;
};
